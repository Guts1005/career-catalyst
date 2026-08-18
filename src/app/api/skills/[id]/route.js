import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateEnum,
  validateRange,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    
    body = whitelistFields(body, 'skills', '/api/skills/[id]');
    body = sanitizeObject(body);
    
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

    const { current_level, target_level, importance } = body;
    
    const { data: skill } = await supabase.from('skills').select('name').eq('id', id).single();
    if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const updates = {};
    if (current_level !== undefined) updates.current_level = current_level;
    if (target_level !== undefined) updates.target_level = target_level;
    if (importance !== undefined) updates.importance = importance;
    
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase.from('skills').update(updates).eq('id', id);
      if (updateError) throw updateError;
      
      await supabase.from('activity_log').insert([{
        action: 'Update Skill', entity_type: 'skill', entity_id: id, entity_name: skill.name
      }]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    
    const { data: skill } = await supabase.from('skills').select('name').eq('id', id).single();
    if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const { error: deleteError } = await supabase.from('skills').delete().eq('id', id);
    if (deleteError) throw deleteError;
    
    await supabase.from('activity_log').insert([{
      action: 'Delete Skill', entity_type: 'skill', entity_id: id, entity_name: skill.name
    }]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
