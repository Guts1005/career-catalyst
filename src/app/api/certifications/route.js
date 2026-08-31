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
    
    const defaultCerts = [
      {
        id: 1,
        name: 'NVIDIA Certified Professional: LLM Inference & CUDA Optimization',
        provider: 'NVIDIA Deep Learning Institute',
        status: 'completed',
        progress: 100,
        priority: 'high',
        target_date: '2024-11-15',
        credential_id: 'NV-DLI-98214',
        credential_url: 'https://learn.nvidia.com',
        notes: 'Covers custom CUDA kernel optimization, Triton GPU programming, and low-precision FP8/INT4 quantization for LLM serving.',
      },
      {
        id: 2,
        name: 'AWS Certified Machine Learning – Specialty (MLS-C01)',
        provider: 'Amazon Web Services',
        status: 'completed',
        progress: 100,
        priority: 'high',
        target_date: '2024-08-20',
        credential_id: 'AWS-MLS-77402',
        credential_url: 'https://aws.amazon.com/certification',
        notes: 'Validated expertise in building, training, tuning, and deploying production ML models on Amazon SageMaker and distributed clusters.',
      },
      {
        id: 3,
        name: 'Deep Learning Specialization (5-Course Series)',
        provider: 'DeepLearning.AI / Coursera',
        status: 'completed',
        progress: 100,
        priority: 'medium',
        target_date: '2024-03-10',
        credential_id: 'COURSERA-DLAI-4491',
        credential_url: 'https://coursera.org',
        notes: 'Mastery in neural network architectures, backpropagation calculus, CNNs, Sequence Models, and hyperparameter tuning by Andrew Ng.',
      },
      {
        id: 4,
        name: 'TensorRT-LLM Performance Tuning Specialist',
        provider: 'NVIDIA Developer Program',
        status: 'in_progress',
        progress: 75,
        priority: 'high',
        target_date: '2026-09-30',
        credential_id: null,
        credential_url: null,
        notes: 'Advanced kernel fusion, in-flight batching, and KV-cache optimization on Hopper H100 and Blackwell architectures.',
      },
    ];

    const finalCerts = (certifications && certifications.length > 0) ? certifications : defaultCerts;
    return NextResponse.json(finalCerts);
  } catch (error) {
    console.error('Failed to fetch certifications, using defaults:', error);
    return NextResponse.json(defaultCerts);
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
