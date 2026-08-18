import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const [{ data: projects, error: projError }, { data: milestones, error: milesError }] = await Promise.all([
      query,
      supabase.from('project_milestones').select('*')
    ]);

    if (projError) throw projError;
    if (milesError) throw milesError;
    
    const projectsWithMilestones = (projects || []).map(p => ({
      ...p,
      milestones: (milestones || []).filter(m => m.project_id === p.id)
    }));
    
    return NextResponse.json(projectsWithMilestones);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    
    body = whitelistFields(body, 'projects', '/api/projects');
    body = sanitizeObject(body);
    
    const required = validateRequired(body, ['name']);
    if (!required.valid) {
      logSecurityEvent('BLOCK', 'MISSING_REQUIRED_FIELDS', { missing: required.missing });
      return NextResponse.json({ error: 'Missing required fields', missing: required.missing }, { status: 400 });
    }
    
    if (body.status !== undefined && !validateEnum(body.status, ['planned', 'in_progress', 'completed'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { name, description, status, github_url, live_url, tech_stack, category, impact, start_date, end_date, milestones } = body;
    
    const { data: result, error: insertError } = await supabase.from('projects').insert([{
      name, description, status: status || 'planned', github_url: github_url || null, live_url: live_url || null, 
      tech_stack: tech_stack || null, category: category || null, impact: impact || null, start_date: start_date || null, end_date: end_date || null
    }]).select().single();
    
    if (insertError) throw insertError;
    
    const projectId = result.id;
    
    if (milestones && milestones.length > 0) {
      const milestoneInserts = milestones
        .filter(m => m.name.trim() !== '')
        .map(m => ({ project_id: projectId, name: m.name, due_date: m.due_date || null }));
      
      if (milestoneInserts.length > 0) {
        await supabase.from('project_milestones').insert(milestoneInserts);
      }
    }
    
    try {
      await supabase.from('activity_log').insert([{ action: 'created', entity_type: 'project', entity_id: projectId, entity_name: name }]);
    } catch (e) {
      console.error("Activity log error:", e);
    }
    
    return NextResponse.json({ id: projectId, name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
