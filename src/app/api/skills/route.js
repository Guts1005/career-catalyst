import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  validateRange,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = supabase.from('skills').select('*').order('category').order('name');
    
    if (category) {
      query = supabase.from('skills').select('*').eq('category', category).order('name');
    }
    
    const { data: skills, error } = await query;
    if (error) throw error;
    
    return NextResponse.json(skills || []);
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
    
    body = whitelistFields(body, 'skills', '/api/skills');
    body = sanitizeObject(body);
    
    const required = validateRequired(body, ['name', 'category']);
    if (!required.valid) {
      logSecurityEvent('BLOCK', 'MISSING_REQUIRED_FIELDS', { missing: required.missing });
      return NextResponse.json({ error: 'Missing required fields', missing: required.missing }, { status: 400 });
    }
    
    if (body.importance !== undefined && !validateEnum(body.importance, ['low', 'medium', 'high'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'importance' });
      return NextResponse.json({ error: 'Invalid importance' }, { status: 400 });
    }
    if (body.current_level !== undefined && !validateRange(body.current_level, 0, 100)) {
      logSecurityEvent('BLOCK', 'INVALID_RANGE', { field: 'current_level' });
      return NextResponse.json({ error: 'Invalid current_level' }, { status: 400 });
    }
    if (body.target_level !== undefined && !validateRange(body.target_level, 0, 100)) {
      logSecurityEvent('BLOCK', 'INVALID_RANGE', { field: 'target_level' });
      return NextResponse.json({ error: 'Invalid target_level' }, { status: 400 });
    }

    const { name, category, current_level, target_level, importance } = body;
    
    const { data: result, error: insertError } = await supabase.from('skills').insert([{
      name, category, current_level: current_level || 0, target_level: target_level || 100, importance: importance || 'medium'
    }]).select().single();
    
    if (insertError) throw insertError;

    await supabase.from('activity_log').insert([{
      action: 'Create Skill', entity_type: 'skill', entity_id: result.id, entity_name: name
    }]);
    
    return NextResponse.json({ id: result.id, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
