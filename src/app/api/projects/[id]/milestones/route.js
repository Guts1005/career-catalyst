import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    const { name, due_date } = body;
    
    const { data: result, error } = await supabase.from('project_milestones').insert([{
      project_id: id, name, due_date: due_date || null
    }]).select().single();
    
    if (error) throw error;
    
    return NextResponse.json({ id: result.id, name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id: projectId } = await params;
    const body = await request.json();
    const { milestone_id, completed } = body;
    
    const { error } = await supabase.from('project_milestones')
      .update({ completed: completed ? 1 : 0 })
      .eq('id', milestone_id)
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id: projectId } = await params;
    const body = await request.json();
    const { milestone_id } = body;
    
    const { error } = await supabase.from('project_milestones')
      .delete()
      .eq('id', milestone_id)
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
