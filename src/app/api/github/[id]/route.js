import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const { data: analysis, error: fetchError } = await supabase.from('github_analyses').select('*').eq('id', id).single();
    
    if (fetchError || !analysis) {
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
    const supabase = getSupabase();
    const { id } = await params;
    await supabase.from('github_analyses').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 });
  }
}
