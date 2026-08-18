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

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const topic = searchParams.get('topic');
    const completed = searchParams.get('completed');
    
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (topic) {
      query += ' AND topic LIKE ?';
      params.push(`%${topic}%`);
    }
    if (completed !== null) {
      query += ' AND completed = ?';
      params.push(parseInt(completed, 10));
    }
    
    query += ' ORDER BY created_at DESC';
    
    const resources = db.prepare(query).all(...params);
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
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

    body = whitelistFields(body, 'resources', '/api/resources');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['title']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.type && !validateEnum(body.type, ['course', 'book', 'tutorial', 'video', 'article', 'podcast', 'tool'])) {
      logSecurityEvent('BLOCK', 'Invalid type enum', { type: body.type });
      return NextResponse.json({ error: 'Invalid type enum' }, { status: 400 });
    }

    const { title, url, type, topic, completed = 0, rating, notes } = body;
    
    const result = db.prepare(`
      INSERT INTO resources (title, url, type, topic, completed, rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      url || null,
      type || 'course',
      topic || null,
      completed ? 1 : 0,
      rating || null,
      notes || null
    );
    
    const insertedId = result.lastInsertRowid;
    
    // Log activity
    db.prepare(`
      INSERT INTO activity_log (action, entity_type, entity_id, entity_name) 
      VALUES (?, ?, ?, ?)
    `).run('added', 'resource', insertedId, title);
    
    const newResource = db.prepare('SELECT * FROM resources WHERE id = ?').get(insertedId);
    
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
