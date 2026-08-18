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
    
    body = whitelistFields(body, 'certifications', '/api/certifications/[id]');
    body = sanitizeObject(body);
    
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
      status,
      progress,
      priority,
      deadline,
      notes,
      category,
      estimated_hours
    } = body;

    const currentCert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(id);
    if (!currentCert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    const stmt = db.prepare(`
      UPDATE certifications 
      SET name = ?, provider = ?, url = ?, status = ?, progress = ?, priority = ?, deadline = ?, notes = ?, category = ?, estimated_hours = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name ?? currentCert.name,
      provider ?? currentCert.provider,
      url ?? currentCert.url,
      status ?? currentCert.status,
      progress ?? currentCert.progress,
      priority ?? currentCert.priority,
      deadline ?? currentCert.deadline,
      notes ?? currentCert.notes,
      category ?? currentCert.category,
      estimated_hours ?? currentCert.estimated_hours,
      id
    );

    if (status === 'completed' && currentCert.status !== 'completed') {
      const certTitle = (name ?? currentCert.name).toLowerCase();

      // Intelligent Skill Auto-Leveling
      if (certTitle.includes('tensorflow')) {
        db.prepare(`UPDATE skills SET current_level = MAX(current_level, 80) WHERE LOWER(name) LIKE '%tensorflow%' OR LOWER(name) LIKE '%deep learning%'`).run();
      }
      if (certTitle.includes('aws') || certTitle.includes('cloud') || certTitle.includes('azure')) {
        db.prepare(`UPDATE skills SET current_level = MAX(current_level, 80) WHERE LOWER(name) LIKE '%cloud%' OR LOWER(name) LIKE '%aws%'`).run();
      }
      if (certTitle.includes('databricks') || certTitle.includes('data engineer')) {
        db.prepare(`UPDATE skills SET current_level = MAX(current_level, 80) WHERE LOWER(name) LIKE '%sql%' OR LOWER(name) LIKE '%spark%'`).run();
      }
      if (certTitle.includes('pytorch')) {
        db.prepare(`UPDATE skills SET current_level = MAX(current_level, 85) WHERE LOWER(name) LIKE '%pytorch%'`).run();
      }

      db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
        'Completed certification (Auto-boosted related skills 🎯)', 'certification', id, name ?? currentCert.name
      );
    } else if (progress !== currentCert.progress || status !== currentCert.status) {
       db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
        'Updated certification progress', 'certification', id, name ?? currentCert.name
      );
    }

    const updatedCert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(id);
    return NextResponse.json(updatedCert);
  } catch (error) {
    console.error('Failed to update certification:', error);
    return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const cert = db.prepare('SELECT name FROM certifications WHERE id = ?').get(id);
    if (!cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM certifications WHERE id = ?').run(id);
    
    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'Deleted certification', 'certification', id, cert.name
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete certification:', error);
    return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
  }
}
