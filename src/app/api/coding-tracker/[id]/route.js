import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { status, solution_notes } = body;

    const existing = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE coding_problems
      SET status = COALESCE(?, status), solution_notes = COALESCE(?, solution_notes)
      WHERE id = ?
    `).run(status, solution_notes, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;

    const existing = db.prepare('SELECT title FROM coding_problems WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM coding_problems WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
