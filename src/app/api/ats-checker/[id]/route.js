import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    
    const { data: check, error: fetchError } = await supabase.from('resume_checks').select('*').eq('id', id).single();
    
    if (fetchError || !check) {
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
    const supabase = getSupabase();
    
    await supabase.from('resume_checks').delete().eq('id', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete check' }, { status: 500 });
  }
}
