import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const { data: existing, error: fetchError } = await supabase
      .from('user_question_progress')
      .select('id, status, notes')
      .eq('question_id', id)
      .single();

    if (existing) {
      await supabase
        .from('user_question_progress')
        .update({
          status: status !== undefined ? status : existing.status,
          notes: notes !== undefined ? notes : existing.notes,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('question_id', id);
    } else {
      await supabase
        .from('user_question_progress')
        .insert([{
          question_id: id,
          status: status || 'unprepared',
          notes: notes || '',
          last_reviewed_at: new Date().toISOString()
        }]);
    }

    if (status === 'mastered') {
      const { data: q } = await supabase.from('interview_questions').select('question').eq('id', id).single();
      
      await supabase.from('activity_log').insert([{
        action: 'Mastered interview question',
        entity_type: 'interview_prep',
        entity_id: id,
        entity_name: q ? q.question.substring(0, 40) + '...' : 'Question'
      }]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update question progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
