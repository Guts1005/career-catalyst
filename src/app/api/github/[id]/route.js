import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const analysis = db.prepare('SELECT * FROM github_analyses WHERE id = ?').get(id);
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...analysis,
        profile_data: JSON.parse(analysis.profile_data),
        repo_data: JSON.parse(analysis.repo_data),
        language_stats: JSON.parse(analysis.language_stats),
        contribution_stats: JSON.parse(analysis.contribution_stats),
        recommendations: JSON.parse(analysis.recommendations)
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    db.prepare('DELETE FROM github_analyses WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 });
  }
}
