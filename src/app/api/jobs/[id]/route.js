import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateEnum,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    
    body = whitelistFields(body, 'jobs', '/api/jobs/[id]');
    body = sanitizeObject(body);
    
    if (body.status !== undefined && !validateEnum(body.status, ['wishlist', 'applied', 'oa', 'interview', 'final', 'offer', 'rejected'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (body.work_model !== undefined && !validateEnum(body.work_model, ['remote', 'hybrid', 'onsite'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'work_model' });
      return NextResponse.json({ error: 'Invalid work_model' }, { status: 400 });
    }

    const current = db.prepare('SELECT * FROM job_applications WHERE id = ?').get(id);
    if (!current) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 });
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

    // Recalculate match score if required_skills changed
    let matchScore = current.match_score;
    if (required_skills !== undefined) {
      const skillsArray = required_skills ? required_skills.split(',').map(s => s.trim().toLowerCase()) : [];
      if (skillsArray.length > 0) {
        const allUserSkills = db.prepare('SELECT LOWER(name) as name, current_level FROM skills').all();
        const userSkillMap = new Map(allUserSkills.map(s => [s.name, s.current_level]));
        let matchedCount = 0;
        for (const reqSkill of skillsArray) {
          if (userSkillMap.has(reqSkill) && (userSkillMap.get(reqSkill) > 20)) {
            matchedCount++;
          }
        }
        matchScore = Math.round((matchedCount / skillsArray.length) * 100);
      }
    }

    const newStatus = status !== undefined ? status : current.status;

    db.prepare(`
      UPDATE job_applications
      SET company = ?, role = ?, location = ?, work_model = ?, salary = ?, status = ?,
          applied_date = ?, job_url = ?, recruiter_contact = ?, required_skills = ?,
          match_score = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      company !== undefined ? company : current.company,
      role !== undefined ? role : current.role,
      location !== undefined ? location : current.location,
      work_model !== undefined ? work_model : current.work_model,
      salary !== undefined ? salary : current.salary,
      newStatus,
      applied_date !== undefined ? applied_date : current.applied_date,
      job_url !== undefined ? job_url : current.job_url,
      recruiter_contact !== undefined ? recruiter_contact : current.recruiter_contact,
      required_skills !== undefined ? required_skills : current.required_skills,
      matchScore,
      notes !== undefined ? notes : current.notes,
      id
    );

    if (newStatus !== current.status) {
      db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
        `Stage moved to ${newStatus.toUpperCase()}`, 'job_application', id, `${current.role} at ${current.company}`
      );
    }

    return NextResponse.json({ success: true, message: 'Application updated' });
  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const current = db.prepare('SELECT company, role FROM job_applications WHERE id = ?').get(id);

    if (!current) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM job_applications WHERE id = ?').run(id);
    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'deleted', 'job_application', id, `${current.role} at ${current.company}`
    );

    return NextResponse.json({ success: true, message: 'Job application deleted' });
  } catch (error) {
    console.error('Failed to delete job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
