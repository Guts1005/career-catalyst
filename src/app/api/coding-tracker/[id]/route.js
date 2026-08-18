import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    const { status, solution_notes } = body;

    const { data: existing, error: fetchError } = await supabase.from('coding_problems').select('*').eq('id', id).single();
    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase.from('coding_problems').update({
      status: status !== undefined ? status : existing.status,
      solution_notes: solution_notes !== undefined ? solution_notes : existing.solution_notes
    }).eq('id', id);
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data: existing, error: fetchError } = await supabase.from('coding_problems').select('title').eq('id', id).single();
    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from('coding_problems').delete().eq('id', id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
