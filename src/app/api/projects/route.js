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

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = 'SELECT * FROM projects';
    let params = [];
    
    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const projects = db.prepare(query).all(...params);
    const milestones = db.prepare('SELECT * FROM project_milestones').all();
    
    const projectsWithMilestones = projects.map(p => ({
      ...p,
      milestones: milestones.filter(m => m.project_id === p.id)
    }));
    
    return NextResponse.json(projectsWithMilestones);
  } catch (error) {
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
    
    body = whitelistFields(body, 'projects', '/api/projects');
    body = sanitizeObject(body);
    
    const required = validateRequired(body, ['name']);
    if (!required.valid) {
      logSecurityEvent('BLOCK', 'MISSING_REQUIRED_FIELDS', { missing: required.missing });
      return NextResponse.json({ error: 'Missing required fields', missing: required.missing }, { status: 400 });
    }
    
    if (body.status !== undefined && !validateEnum(body.status, ['planned', 'in_progress', 'completed'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { name, description, status, github_url, live_url, tech_stack, category, impact, start_date, end_date, milestones } = body;
    
    const insertProject = db.prepare(`
      INSERT INTO projects (name, description, status, github_url, live_url, tech_stack, category, impact, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertProject.run(
      name, description, status || 'planned', github_url || null, live_url || null, 
      tech_stack || null, category || null, impact || null, start_date || null, end_date || null
    );
    const projectId = result.lastInsertRowid;
    
    if (milestones && milestones.length > 0) {
      const insertMilestone = db.prepare(`
        INSERT INTO project_milestones (project_id, name, due_date)
        VALUES (?, ?, ?)
      `);
      
      const insertMany = db.transaction((miles) => {
        for (const m of miles) {
          if (m.name.trim() !== '') {
            insertMilestone.run(projectId, m.name, m.due_date || null);
          }
        }
      });
      
      insertMany(milestones);
    }
    
    try {
      db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run('created', 'project', projectId, name);
    } catch (e) {
      // Activity log table might not exist or other issues, ignore to not fail project creation
      console.error("Activity log error:", e);
    }
    
    return NextResponse.json({ id: projectId, name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
