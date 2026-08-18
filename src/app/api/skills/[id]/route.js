import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateEnum,
  validateRange,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    
    body = whitelistFields(body, 'skills', '/api/skills/[id]');
    body = sanitizeObject(body);
    
    if (body.importance !== undefined && !validateEnum(body.importance, ['low', 'medium', 'high'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'importance' });
      return NextResponse.json({ error: 'Invalid importance' }, { status: 400 });
    }
    if (body.current_level !== undefined && !validateRange(body.current_level, 0, 100)) {
      logSecurityEvent('BLOCK', 'INVALID_RANGE', { field: 'current_level' });
      return NextResponse.json({ error: 'Invalid current_level' }, { status: 400 });
    }
    if (body.target_level !== undefined && !validateRange(body.target_level, 0, 100)) {
      logSecurityEvent('BLOCK', 'INVALID_RANGE', { field: 'target_level' });
      return NextResponse.json({ error: 'Invalid target_level' }, { status: 400 });
    }

    const { current_level, target_level, importance } = body;
    
    const skill = db.prepare('SELECT name FROM skills WHERE id = ?').get(id);
    if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const updates = [];
    const vals = [];
    if (current_level !== undefined) {
      updates.push('current_level = ?');
      vals.push(current_level);
    }
    if (target_level !== undefined) {
      updates.push('target_level = ?');
      vals.push(target_level);
    }
    if (importance !== undefined) {
      updates.push('importance = ?');
      vals.push(importance);
    }
    
    if (updates.length > 0) {
      vals.push(id);
      db.prepare(`UPDATE skills SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
      
      db.prepare(`
        INSERT INTO activity_log (action, entity_type, entity_id, entity_name) 
        VALUES (?, ?, ?, ?)
      `).run('Update Skill', 'skill', id, skill.name);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const skill = db.prepare('SELECT name FROM skills WHERE id = ?').get(id);
    if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    db.prepare('DELETE FROM skills WHERE id = ?').run(id);
    
    db.prepare(`
      INSERT INTO activity_log (action, entity_type, entity_id, entity_name) 
      VALUES (?, ?, ?, ?)
    `).run('Delete Skill', 'skill', id, skill.name);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
