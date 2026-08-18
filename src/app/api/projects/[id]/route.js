import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateEnum,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    
    const { data: project, error: projError } = await supabase.from('projects').select('*').eq('id', id).single();
    
    if (projError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const { data: milestones } = await supabase.from('project_milestones').select('*').eq('project_id', id);
    project.milestones = milestones || [];
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    
    body = whitelistFields(body, 'projects', '/api/projects/[id]');
    body = sanitizeObject(body);
    
    if (body.status !== undefined && !validateEnum(body.status, ['planned', 'in_progress', 'completed'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { name, description, status, github_url, live_url, tech_stack, category, impact, start_date, end_date } = body;
    
    const { error: updateError } = await supabase.from('projects').update({
      name, description, status, github_url: github_url || null, live_url: live_url || null, 
      tech_stack: tech_stack || null, category: category || null, impact: impact || null, start_date: start_date || null, end_date: end_date || null, updated_at: new Date().toISOString()
    }).eq('id', id);
    
    if (updateError) throw updateError;
    
    try {
      await supabase.from('activity_log').insert([{ action: 'updated', entity_type: 'project', entity_id: id, entity_name: name }]);
    } catch (e) {
      console.error("Activity log error:", e);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    
    const { data: project } = await supabase.from('projects').select('name').eq('id', id).single();
    
    if (project) {
      await supabase.from('projects').delete().eq('id', id);
      try {
        await supabase.from('activity_log').insert([{ action: 'deleted', entity_type: 'project', entity_id: id, entity_name: project.name }]);
      } catch (e) {
        console.error("Activity log error:", e);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
