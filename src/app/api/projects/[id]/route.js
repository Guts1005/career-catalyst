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

export async function GET(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ?').all(id);
    project.milestones = milestones;
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    
    body = whitelistFields(body, 'projects', '/api/projects/[id]');
    body = sanitizeObject(body);
    
    if (body.status !== undefined && !validateEnum(body.status, ['planned', 'in_progress', 'completed'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { name, description, status, github_url, live_url, tech_stack, category, impact, start_date, end_date } = body;
    
    const update = db.prepare(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, github_url = ?, live_url = ?, tech_stack = ?, category = ?, impact = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(
      name, description, status, github_url || null, live_url || null, 
      tech_stack || null, category || null, impact || null, start_date || null, end_date || null, id
    );
    
    try {
      db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run('updated', 'project', id, name);
    } catch (e) {
      console.error("Activity log error:", e);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    
    const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(id);
    
    if (project) {
      db.prepare('DELETE FROM projects WHERE id = ?').run(id);
      try {
        db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run('deleted', 'project', id, project.name);
      } catch (e) {
        console.error("Activity log error:", e);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
