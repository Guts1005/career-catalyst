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
    
    const defaultPapers = [
      {
        id: 1,
        title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
        author: 'Tri Dao (Stanford University / Together AI)',
        url: 'https://arxiv.org/abs/2307.08691',
        type: 'article',
        topic: 'GPU Kernel Optimization',
        completed: 1,
        notes: 'arXiv:2307.08691. Evaluated on 8x NVIDIA H100 SXM5 GPUs. Demonstrates 73% peak FP16 TFLOPs utilization by parallelizing over sequence length in outer loops and minimizing HBM roundtrips.',
      },
      {
        id: 2,
        title: 'DeepSeek-V3 Technical Report',
        author: 'DeepSeek-AI Team',
        url: 'https://arxiv.org/abs/2412.19437',
        type: 'article',
        topic: 'Distributed LLM Training & MoE',
        completed: 1,
        notes: 'arXiv:2412.19437. 671B parameter Mixture-of-Experts with Multi-Head Latent Attention (MLA) and auxiliary-loss-free load balancing on 2048 H800 clusters.',
      },
      {
        id: 3,
        title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention',
        author: 'Woosuk Kwon et al. (UC Berkeley / LMSYS)',
        url: 'https://arxiv.org/abs/2309.06180',
        type: 'article',
        topic: 'Inference Serving & KV-Cache',
        completed: 1,
        notes: 'SOSP 2023 / arXiv:2309.06180. Virtual memory paging for dynamic KV cache allocations in vLLM, reducing GPU memory waste from 60–80% down to < 4%.',
      },
      {
        id: 4,
        title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
        author: 'Rafael Rafailov, Archit Sharma et al. (Stanford University)',
        url: 'https://arxiv.org/abs/2305.18290',
        type: 'article',
        topic: 'Post-Training Alignment',
        completed: 1,
        notes: 'NeurIPS 2023 / arXiv:2305.18290. Derives exact closed-form implicit reward function to optimize Bradley-Terry preference models without RL training loops.',
      },
      {
        id: 5,
        title: 'Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations',
        author: 'Philippe Tillet, H.T. Kung, David Cox (Harvard University / OpenAI)',
        url: 'https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf',
        type: 'article',
        topic: 'GPU Compilers & SIMD',
        completed: 0,
        notes: 'ACM MAPL 2019. High-performance C-like Python DSL and LLVM-based backend compiler for automated block-level memory coalescing and tensor core instruction scheduling.',
      },
      {
        id: 6,
        title: 'Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism',
        author: 'Mohammad Shoeybi et al. (NVIDIA Research)',
        url: 'https://arxiv.org/abs/1909.08053',
        type: 'article',
        topic: 'Distributed Systems',
        completed: 0,
        notes: 'arXiv:1909.08053. Tensor model parallelism (column-parallel & row-parallel GEMMs with All-Reduce) enabling multi-GPU scale across NVLink interconnects.',
      },
    ];

    const finalResources = (resources && resources.length > 0) ? resources : defaultPapers;
    return NextResponse.json(finalResources);
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
