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
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');

    const profiles = db.prepare('SELECT * FROM coding_profiles ORDER BY id ASC').all();

    let problemQuery = `SELECT * FROM coding_problems WHERE 1=1`;
    const params = [];

    if (platform && platform !== 'All') {
      problemQuery += ` AND platform = ?`;
      params.push(platform);
    }

    if (category && category !== 'All') {
      problemQuery += ` AND category = ?`;
      params.push(category);
    }

    problemQuery += ` ORDER BY completed_at DESC, id DESC`;

    const problems = db.prepare(problemQuery).all(...params);

    // Compute stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_logged,
        SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as total_solved,
        SUM(CASE WHEN difficulty = 'easy' AND status = 'solved' THEN 1 ELSE 0 END) as easy_solved,
        SUM(CASE WHEN difficulty = 'medium' AND status = 'solved' THEN 1 ELSE 0 END) as medium_solved,
        SUM(CASE WHEN difficulty = 'hard' AND status = 'solved' THEN 1 ELSE 0 END) as hard_solved
      FROM coding_problems
    `).get();

    return NextResponse.json({ profiles, problems, stats });
  } catch (error) {
    console.error('Failed to get coding data:', error);
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

    body = whitelistFields(body, 'coding_tracker', '/api/coding-tracker');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['title']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.difficulty && !validateEnum(body.difficulty, ['easy', 'medium', 'hard'])) {
      logSecurityEvent('BLOCK', 'Invalid difficulty enum', { difficulty: body.difficulty });
      return NextResponse.json({ error: 'Invalid difficulty enum' }, { status: 400 });
    }

    if (body.platform && !validateEnum(body.platform, ['LeetCode', 'Kaggle', 'HackerRank', 'CodeSignal', 'Other'])) {
      logSecurityEvent('BLOCK', 'Invalid platform enum', { platform: body.platform });
      return NextResponse.json({ error: 'Invalid platform enum' }, { status: 400 });
    }

    const { title, platform, category, difficulty, status, url, solution_notes } = body;

    const result = db.prepare(`
      INSERT INTO coding_problems (title, platform, category, difficulty, status, url, solution_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      platform || 'LeetCode',
      category || 'Machine Learning Math',
      difficulty || 'medium',
      status || 'solved',
      url || '',
      solution_notes || ''
    );

    // Increment profile solved count if solved
    if (status === 'solved') {
      db.prepare(`
        UPDATE coding_profiles 
        SET solved_count = solved_count + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE platform = ?
      `).run(platform);
    }

    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'Solved problem', 'coding_problem', result.lastInsertRowid, `${title} (${platform})`
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Problem logged successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to log problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
