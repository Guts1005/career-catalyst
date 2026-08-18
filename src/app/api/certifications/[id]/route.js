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
    
    body = whitelistFields(body, 'certifications', '/api/certifications/[id]');
    body = sanitizeObject(body);
    
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
      status,
      progress,
      priority,
      deadline,
      notes,
      category,
      estimated_hours
    } = body;

    const { data: currentCert, error: fetchError } = await supabase.from('certifications').select('*').eq('id', id).single();
    if (fetchError || !currentCert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    const { data: updatedCert, error: updateError } = await supabase.from('certifications').update({
      name: name ?? currentCert.name,
      provider: provider ?? currentCert.provider,
      url: url ?? currentCert.url,
      status: status ?? currentCert.status,
      progress: progress ?? currentCert.progress,
      priority: priority ?? currentCert.priority,
      deadline: deadline ?? currentCert.deadline,
      notes: notes ?? currentCert.notes,
      category: category ?? currentCert.category,
      estimated_hours: estimated_hours ?? currentCert.estimated_hours,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();

    if (updateError) throw updateError;

    if (status === 'completed' && currentCert.status !== 'completed') {
      const certTitle = (name ?? currentCert.name).toLowerCase();

      // Intelligent Skill Auto-Leveling
      if (certTitle.includes('tensorflow') || certTitle.includes('deep learning')) {
        await supabase.rpc('auto_level_skill', { keyword: 'tensorflow', min_level: 80 });
        await supabase.rpc('auto_level_skill', { keyword: 'deep learning', min_level: 80 });
      }
      if (certTitle.includes('aws') || certTitle.includes('cloud') || certTitle.includes('azure')) {
        await supabase.rpc('auto_level_skill', { keyword: 'cloud', min_level: 80 });
        await supabase.rpc('auto_level_skill', { keyword: 'aws', min_level: 80 });
      }
      if (certTitle.includes('databricks') || certTitle.includes('data engineer')) {
        await supabase.rpc('auto_level_skill', { keyword: 'sql', min_level: 80 });
        await supabase.rpc('auto_level_skill', { keyword: 'spark', min_level: 80 });
      }
      if (certTitle.includes('pytorch')) {
        await supabase.rpc('auto_level_skill', { keyword: 'pytorch', min_level: 85 });
      }

      await supabase.from('activity_log').insert([{
        action: 'Completed certification (Auto-boosted related skills 🎯)', entity_type: 'certification', entity_id: id, entity_name: name ?? currentCert.name
      }]);
    } else if (progress !== currentCert.progress || status !== currentCert.status) {
       await supabase.from('activity_log').insert([{
        action: 'Updated certification progress', entity_type: 'certification', entity_id: id, entity_name: name ?? currentCert.name
      }]);
    }

    return NextResponse.json(updatedCert);
  } catch (error) {
    console.error('Failed to update certification:', error);
    return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    
    const { data: cert } = await supabase.from('certifications').select('name').eq('id', id).single();
    if (!cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from('certifications').delete().eq('id', id);
    if (deleteError) throw deleteError;
    
    await supabase.from('activity_log').insert([{
      action: 'Deleted certification', entity_type: 'certification', entity_id: id, entity_name: cert.name
    }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete certification:', error);
    return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
  }
}
