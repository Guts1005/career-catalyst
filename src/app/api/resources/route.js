import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import {
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  validateRange,
  validateLength,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const topic = searchParams.get('topic');
    const completed = searchParams.get('completed');
    
    let query = supabase.from('resources').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }
    if (completed !== null) {
      query = query.eq('completed', parseInt(completed, 10));
    }
    
    const { data: resources, error: queryError } = await query.order('created_at', { ascending: false });
    if (queryError) throw queryError;
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
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

    body = whitelistFields(body, 'resources', '/api/resources');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['title']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.type && !validateEnum(body.type, ['course', 'book', 'tutorial', 'video', 'article', 'podcast', 'tool'])) {
      logSecurityEvent('BLOCK', 'Invalid type enum', { type: body.type });
      return NextResponse.json({ error: 'Invalid type enum' }, { status: 400 });
    }

    const { title, url, type, topic, completed = 0, rating, notes } = body;
    
    const { data: newResource, error: insertError } = await supabase.from('resources').insert([{
      title,
      url: url || null,
      type: type || 'course',
      topic: topic || null,
      completed: completed ? 1 : 0,
      rating: rating || null,
      notes: notes || null
    }]).select().single();
    
    if (insertError) throw insertError;
    
    const insertedId = newResource.id;
    
    // Log activity
    await supabase.from('activity_log').insert([{
      action: 'added',
      entity_type: 'resource',
      entity_id: insertedId,
      entity_name: title
    }]);
    
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}
