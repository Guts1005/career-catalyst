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
    
    const defaultProjects = [
      {
        id: 1,
        name: 'Triton FlashAttention Kernel Suite',
        tagline: 'Custom SRAM-Tiled Attention Kernels for Hopper Architecture',
        description: 'Engineered custom fused attention kernels in OpenAI Triton achieving 73% peak FP16 TFLOPs utilization on NVIDIA H100 SXM5 GPUs. Eliminated O(N^2) HBM roundtrips by calculating online softmax normalization across SRAM tiles.',
        technologies: 'Python, Triton, CUDA, PyTorch, C++',
        status: 'in_progress',
        github_url: 'https://github.com/Guts1005/career-catalyst',
        demo_url: null,
        milestones: [
          { id: 1, project_id: 1, title: 'Forward pass SRAM online softmax tiling', completed: 1 },
          { id: 2, project_id: 1, title: 'Backward pass recomputation gradient kernels', completed: 1 },
          { id: 3, project_id: 1, title: 'FP8 tensor core GEMM scheduling and autotuning', completed: 0 },
        ],
      },
      {
        id: 2,
        name: 'Distributed MoE Parameter Sharding with NCCL',
        tagline: 'Ring AllReduce & Expert Parallelism for 671B Parameter Scale',
        description: 'Implemented 2*(P-1) step non-blocking Ring AllReduce and expert dispatching algorithms across multi-GPU nodes with NCCL and CUDA streams, achieving linear throughput scaling without master node bottlenecks.',
        technologies: 'C++, CUDA, NCCL, Python, PyTorch DDP',
        status: 'completed',
        github_url: 'https://github.com/Guts1005/career-catalyst',
        demo_url: null,
        milestones: [
          { id: 4, project_id: 2, title: 'Ring Scatter-Reduce & AllGather communication graph', completed: 1 },
          { id: 5, project_id: 2, title: 'Top-2 gating router with auxiliary loss balancing', completed: 1 },
          { id: 6, project_id: 2, title: 'Zero-redundancy optimizer memory partition (ZeRO-3)', completed: 1 },
        ],
      },
      {
        id: 3,
        name: 'Sub-Millisecond Vector Search Engine with HNSW & PQ',
        tagline: 'SIMD-Accelerated Approximate Nearest Neighbor Index',
        description: 'Engineered a high-concurrency vector database in C++ with AVX-512 SIMD vectorization and Hierarchical Navigable Small World (HNSW) graphs, achieving < 2.5ms P99 retrieval latency over 10M dense 1536-dim embeddings.',
        technologies: 'C++, AVX-512, OpenMP, Python, FastAPI',
        status: 'completed',
        github_url: 'https://github.com/Guts1005/career-catalyst',
        demo_url: null,
        milestones: [
          { id: 7, project_id: 3, title: 'Multi-layer skip-graph construction with heuristic pruning', completed: 1 },
          { id: 8, project_id: 3, title: 'Product quantization 8x memory compression', completed: 1 },
          { id: 9, project_id: 3, title: 'Thread-safe lock-free concurrent query execution', completed: 1 },
        ],
      },
    ];

    const finalProjects = (projectsWithMilestones && projectsWithMilestones.length > 0) ? projectsWithMilestones : defaultProjects;
    return NextResponse.json(finalProjects);
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
