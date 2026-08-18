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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let query = `
      SELECT 
        q.*,
        COALESCE(p.status, 'unprepared') as user_status,
        p.notes as user_notes,
        p.last_reviewed_at
      FROM interview_questions q
      LEFT JOIN user_question_progress p ON q.id = p.question_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND q.category = ?`;
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      query += ` AND q.difficulty = ?`;
      params.push(difficulty.toLowerCase());
    }

    query += ` ORDER BY q.id ASC`;

    const questions = db.prepare(query).all(...params);

    // Compute stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN p.status = 'mastered' THEN 1 ELSE 0 END) as mastered_count,
        SUM(CASE WHEN p.status = 'reviewing' THEN 1 ELSE 0 END) as reviewing_count,
        SUM(CASE WHEN p.status = 'unprepared' OR p.status IS NULL THEN 1 ELSE 0 END) as unprepared_count
      FROM interview_questions q
      LEFT JOIN user_question_progress p ON q.id = p.question_id
    `).get();

    return NextResponse.json({ questions, stats });
  } catch (error) {
    console.error('Failed to get interview questions:', error);
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

    body = whitelistFields(body, 'interview_prep', '/api/interview-prep');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['question', 'answer']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.difficulty && !validateEnum(body.difficulty, ['easy', 'medium', 'hard'])) {
      logSecurityEvent('BLOCK', 'Invalid difficulty enum', { difficulty: body.difficulty });
      return NextResponse.json({ error: 'Invalid difficulty enum' }, { status: 400 });
    }

    const { category, difficulty, question, answer, key_takeaways, code_snippet, tags } = body;

    const result = db.prepare(`
      INSERT INTO interview_questions (category, difficulty, question, answer, key_takeaways, code_snippet, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      category || 'Machine Learning',
      difficulty || 'medium',
      question,
      answer,
      key_takeaways || '',
      code_snippet || '',
      tags || ''
    );

    db.prepare('INSERT INTO user_question_progress (question_id, status) VALUES (?, ?)').run(
      result.lastInsertRowid, 'unprepared'
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Question created' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
