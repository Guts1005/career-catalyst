import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    const check = db.prepare('SELECT * FROM resume_checks WHERE id = ?').get(id);
    
    if (!check) {
      return NextResponse.json({ error: 'Check not found' }, { status: 404 });
    }
    
    return NextResponse.json(check);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch check' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    
    db.prepare('DELETE FROM resume_checks WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete check' }, { status: 500 });
  }
}
