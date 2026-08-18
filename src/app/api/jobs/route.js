import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET() {
  try {
    const db = getDb();
    const jobs = db.prepare('SELECT * FROM job_applications ORDER BY updated_at DESC').all();
    
    // Also fetch all user skills to calculate match scores dynamically
    const userSkills = db.prepare('SELECT name, current_level FROM skills').all();
    
    return NextResponse.json({ jobs, userSkills });
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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
    
    body = whitelistFields(body, 'jobs', '/api/jobs');
    body = sanitizeObject(body);
    
    const required = validateRequired(body, ['company', 'role']);
    if (!required.valid) {
      logSecurityEvent('BLOCK', 'MISSING_REQUIRED_FIELDS', { missing: required.missing });
      return NextResponse.json({ error: 'Missing required fields', missing: required.missing }, { status: 400 });
    }
    
    if (body.status !== undefined && !validateEnum(body.status, ['wishlist', 'applied', 'oa', 'interview', 'final', 'offer', 'rejected'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (body.work_model !== undefined && !validateEnum(body.work_model, ['remote', 'hybrid', 'onsite'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'work_model' });
      return NextResponse.json({ error: 'Invalid work_model' }, { status: 400 });
    }

    const {
      company,
      role,
      location,
      work_model,
      salary,
      status,
      applied_date,
      job_url,
      recruiter_contact,
      required_skills,
      notes
    } = body;

    // Calculate match score based on user skills vs required skills
    let matchScore = 0;
    if (required_skills) {
      const skillsArray = required_skills.split(',').map(s => s.trim().toLowerCase());
      const allUserSkills = db.prepare('SELECT LOWER(name) as name, current_level FROM skills').all();
      const userSkillMap = new Map(allUserSkills.map(s => [s.name, s.current_level]));
      
      let matchedCount = 0;
      for (const reqSkill of skillsArray) {
        if (userSkillMap.has(reqSkill) && (userSkillMap.get(reqSkill) > 20)) {
          matchedCount++;
        }
      }
      matchScore = skillsArray.length > 0 ? Math.round((matchedCount / skillsArray.length) * 100) : 50;
    }

    const stmt = db.prepare(`
      INSERT INTO job_applications (
        company, role, location, work_model, salary, status,
        applied_date, job_url, recruiter_contact, required_skills, match_score, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      company,
      role,
      location || '',
      work_model || 'remote',
      salary || '',
      status || 'wishlist',
      applied_date || null,
      job_url || '',
      recruiter_contact || '',
      required_skills || '',
      matchScore,
      notes || ''
    );

    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'created', 'job_application', result.lastInsertRowid, `${role} at ${company}`
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Application created successfully' });
  } catch (error) {
    console.error('Failed to create job application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
