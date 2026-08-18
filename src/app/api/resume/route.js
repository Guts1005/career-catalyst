import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import {
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  validateRange,
  validateLength,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET() {
  try {
    const db = getDb();

    // Fetch primary resume record or fallback
    let resume = db.prepare('SELECT * FROM resumes ORDER BY id ASC LIMIT 1').get();
    if (!resume) {
      db.prepare(`
        INSERT INTO resumes (title, full_name, email, summary)
        VALUES ('Data Science Resume', 'Sharvin Neve', 'sharvinneve67@gmail.com', 'Aspiring Machine Learning Engineer')
      `).run();
      resume = db.prepare('SELECT * FROM resumes ORDER BY id ASC LIMIT 1').get();
    }

    // Pull completed/in-progress certifications from database
    const certifications = db.prepare(`
      SELECT id, name, provider, status, progress, url, category 
      FROM certifications 
      WHERE status IN ('completed', 'in_progress')
      ORDER BY status DESC, progress DESC
    `).all();

    // Pull projects with completed milestones
    const projects = db.prepare(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM project_milestones pm WHERE pm.project_id = p.id AND pm.completed = 1) as completed_milestones,
        (SELECT COUNT(*) FROM project_milestones pm WHERE pm.project_id = p.id) as total_milestones
      FROM projects p
      ORDER BY p.status DESC, p.created_at DESC
    `).all();

    // Pull skills grouped by category
    const skills = db.prepare(`
      SELECT name, category, current_level, target_level, importance
      FROM skills
      WHERE current_level > 20
      ORDER BY category ASC, current_level DESC
    `).all();

    // Format skills grouped by category
    const skillsByCategory = {};
    for (const skill of skills) {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill.name);
    }

    return NextResponse.json({
      resume: {
        ...resume,
        education: JSON.parse(resume.education_json || '[]'),
        experience: JSON.parse(resume.experience_json || '[]')
      },
      liveData: {
        certifications,
        projects,
        skillsByCategory
      }
    });
  } catch (error) {
    console.error('Failed to get resume data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }

    body = whitelistFields(body, 'resume', '/api/resume');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['full_name']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.email && !validateLength(body.email, 200)) {
      logSecurityEvent('BLOCK', 'Email exceeds maximum length', { length: body.email.length });
      return NextResponse.json({ error: 'Email exceeds maximum length of 200' }, { status: 400 });
    }

    const {
      title,
      full_name,
      email,
      phone,
      location,
      linkedin_url,
      github_url,
      portfolio_url,
      summary,
      template_name,
      education,
      experience
    } = body;

    const current = db.prepare('SELECT id FROM resumes ORDER BY id ASC LIMIT 1').get();
    if (!current) {
      return NextResponse.json({ error: 'No resume record found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE resumes
      SET title = ?, full_name = ?, email = ?, phone = ?, location = ?,
          linkedin_url = ?, github_url = ?, portfolio_url = ?, summary = ?,
          template_name = ?, education_json = ?, experience_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || 'Primary Resume',
      full_name || '',
      email || '',
      phone || '',
      location || '',
      linkedin_url || '',
      github_url || '',
      portfolio_url || '',
      summary || '',
      template_name || 'modern-ats',
      JSON.stringify(education || []),
      JSON.stringify(experience || []),
      current.id
    );

    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'updated', 'resume', current.id, title || 'Resume'
    );

    return NextResponse.json({ success: true, message: 'Resume saved successfully' });
  } catch (error) {
    console.error('Failed to update resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
