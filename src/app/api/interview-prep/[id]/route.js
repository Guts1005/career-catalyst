import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const existing = db.prepare('SELECT id FROM user_question_progress WHERE question_id = ?').get(id);

    if (existing) {
      db.prepare(`
        UPDATE user_question_progress
        SET status = COALESCE(?, status), notes = COALESCE(?, notes), last_reviewed_at = CURRENT_TIMESTAMP
        WHERE question_id = ?
      `).run(status, notes, id);
    } else {
      db.prepare(`
        INSERT INTO user_question_progress (question_id, status, notes, last_reviewed_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).run(id, status || 'unprepared', notes || '');
    }

    if (status === 'mastered') {
      const q = db.prepare('SELECT question FROM interview_questions WHERE id = ?').get(id);
      db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
        'Mastered interview question', 'interview_prep', id, q ? q.question.substring(0, 40) + '...' : 'Question'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update question progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
