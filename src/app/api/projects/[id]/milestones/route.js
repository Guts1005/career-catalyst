import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { name, due_date } = body;
    
    const result = db.prepare(`
      INSERT INTO project_milestones (project_id, name, due_date)
      VALUES (?, ?, ?)
    `).run(id, name, due_date || null);
    
    return NextResponse.json({ id: result.lastInsertRowid, name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { id: projectId } = await params;
    const body = await request.json();
    const { milestone_id, completed } = body;
    
    db.prepare(`
      UPDATE project_milestones
      SET completed = ?
      WHERE id = ? AND project_id = ?
    `).run(completed ? 1 : 0, milestone_id, projectId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const { id: projectId } = await params;
    const body = await request.json();
    const { milestone_id } = body;
    
    db.prepare(`
      DELETE FROM project_milestones
      WHERE id = ? AND project_id = ?
    `).run(milestone_id, projectId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
