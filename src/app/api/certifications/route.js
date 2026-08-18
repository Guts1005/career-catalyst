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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = supabase.from('certifications').select('*');
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data: certifications, error } = await query;
    if (error) throw error;
    
    return NextResponse.json(certifications || []);
  } catch (error) {
    console.error('Failed to fetch certifications:', error);
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 });
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
    
    body = whitelistFields(body, 'certifications', '/api/certifications');
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
    if (body.priority !== undefined && !validateEnum(body.priority, ['low', 'medium', 'high'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'priority' });
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }
    if (body.progress !== undefined && !validateRange(body.progress, 0, 100)) {
      logSecurityEvent('BLOCK', 'INVALID_RANGE', { field: 'progress' });
      return NextResponse.json({ error: 'Invalid progress' }, { status: 400 });
    }
    
    const {
      name,
      provider,
      url,
      status = 'planned',
      progress = 0,
      priority = 'medium',
      deadline,
      notes,
      category,
      estimated_hours
    } = body;

    const { data: result, error: insertError } = await supabase.from('certifications').insert([{
      name, provider, url, status, progress, priority, deadline, notes, category, estimated_hours
    }]).select().single();

    if (insertError) throw insertError;

    const action = 'Created certification';
    await supabase.from('activity_log').insert([{
      action, entity_type: 'certification', entity_id: result.id, entity_name: name
    }]);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create certification:', error);
    return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
  }
}
