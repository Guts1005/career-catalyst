import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  validateRange,
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
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM certifications';
    const params = [];
    
    const conditions = [];
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (search) {
      conditions.push('(name LIKE ? OR provider LIKE ?)');
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const certifications = db.prepare(query).all(...params);
    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Failed to fetch certifications:', error);
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
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
    
    body = whitelistFields(body, 'certifications', '/api/certifications');
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
    if (body.priority !== undefined && !validateEnum(body.priority, ['low', 'medium', 'high'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'priority' });
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }
    if (body.progress !== undefined && !validateRange(body.progress, 0, 100)) {
      logSecurityEvent('BLOCK', 'INVALID_RANGE', { field: 'progress' });
      return NextResponse.json({ error: 'Invalid progress' }, { status: 400 });
    }
    
    const {
      name,
      provider,
      url,
      status = 'planned',
      progress = 0,
      priority = 'medium',
      deadline,
      notes,
      category,
      estimated_hours
    } = body;

    const stmt = db.prepare(`
      INSERT INTO certifications (
        name, provider, url, status, progress, priority, deadline, notes, category, estimated_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name, provider, url, status, progress, priority, deadline, notes, category, estimated_hours
    );

    const action = 'Created certification';
    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      action, 'certification', result.lastInsertRowid, name
    );

    const newCert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(newCert, { status: 201 });
  } catch (error) {
    console.error('Failed to create certification:', error);
    return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
  }
}
