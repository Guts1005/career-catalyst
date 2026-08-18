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

    body = whitelistFields(body, 'resources', '/api/resources/[id]');
    body = sanitizeObject(body);

    if (body.type && !validateEnum(body.type, ['course', 'book', 'tutorial', 'video', 'article', 'podcast', 'tool'])) {
      logSecurityEvent('BLOCK', 'Invalid type enum', { type: body.type });
      return NextResponse.json({ error: 'Invalid type enum' }, { status: 400 });
    }
    
    const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    const title = body.title !== undefined ? body.title : existing.title;
    const url = body.url !== undefined ? body.url : existing.url;
    const type = body.type !== undefined ? body.type : existing.type;
    const topic = body.topic !== undefined ? body.topic : existing.topic;
    const completed = body.completed !== undefined ? (body.completed ? 1 : 0) : existing.completed;
    const rating = body.rating !== undefined ? body.rating : existing.rating;
    const notes = body.notes !== undefined ? body.notes : existing.notes;
    
    db.prepare(`
      UPDATE resources
      SET title = ?, url = ?, type = ?, topic = ?, completed = ?, rating = ?, notes = ?
      WHERE id = ?
    `).run(title, url, type, topic, completed, rating, notes, id);
    
    let action = 'updated';
    if (existing.completed === 0 && completed === 1) {
      action = 'completed';
    }
    
    // Log activity
    db.prepare(`
      INSERT INTO activity_log (action, entity_type, entity_id, entity_name) 
      VALUES (?, ?, ?, ?)
    `).run(action, 'resource', id, title);
    
    const updated = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    
    const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    
    // Log activity
    db.prepare(`
      INSERT INTO activity_log (action, entity_type, entity_id, entity_name) 
      VALUES (?, ?, ?, ?)
    `).run('deleted', 'resource', id, existing.title);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
