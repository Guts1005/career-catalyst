import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import {
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateRange,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

const MOCK_QUESTION_SETS = {
  ml_system_design: [
    {
      id: 1,
      title: 'Design a Real-Time Fraud Detection System',
      scenario: 'You need to process 50,000 transactions per second with sub-50ms P99 latency while minimizing false positives for credit card fraud.',
      hints: ['Consider streaming architecture (Kafka/Flink)', 'Feature store latency (Feast/Redis)', 'Two-tier ensemble: lightweight rule engine + XGBoost + deep graph neural net'],
      rubric_keywords: ['kafka', 'redis', 'latency', 'feast', 'xgboost', 'graph', 'precision', 'recall', 'drift', 'p99']
    },
    {
      id: 2,
      title: 'Design a Multi-Modal RAG Search for Technical Documentation',
      scenario: 'Build a document assistant over 5 million PDF manuals containing text, diagrams, and formulas with minimal hallucination.',
      hints: ['Hybrid search (BM25 + ColBERT/dense vectors)', 'Self-corrective retrieval loops', 'RAGAS evaluation benchmarks'],
      rubric_keywords: ['colbert', 'bm25', 'rerank', 'embedding', 'ragas', 'chunking', 'vector', 'hallucination', 'neo4j']
    }
  ],
  deep_learning_math: [
    {
      id: 3,
      title: 'Backpropagation and Gradient Vanishing in Deep Networks',
      scenario: 'Mathematically explain why deep Sigmoid networks suffer from vanishing gradients and how modern architectures (ResNet, LayerNorm, SwiGLU) address this.',
      hints: ['Sigmoid derivative max value = 0.25', 'Chain rule multiplication', 'Residual shortcut connections derivative = I + dF/dx'],
      rubric_keywords: ['derivative', 'chain rule', 'sigmoid', '0.25', 'resnet', 'residual', 'skip connection', 'layernorm', 'relu']
    },
    {
      id: 4,
      title: 'Scaled Dot-Product Attention Complexity & FlashAttention',
      scenario: 'Derive the computational and memory complexity of Transformer self-attention O(N^2) and explain IO-aware FlashAttention tiling.',
      hints: ['Q K^T matrix multiplication dimensions', 'Softmax memory IO bottleneck in HBM vs SRAM', 'Online softmax algorithm'],
      rubric_keywords: ['complexity', 'n^2', 'softmax', 'sram', 'hbm', 'tiling', 'flashattention', 'gpu', 'io-aware']
    }
  ],
  behavioral_leadership: [
    {
      id: 5,
      title: 'Handling Conflicting Model Metrics and Business Trade-offs',
      scenario: 'Describe a situation where an ML model showed strong offline benchmark improvements, but business stakeholders were hesitant due to edge-case risks or inference cost.',
      hints: ['Structure using STAR method', 'Quantify cost vs revenue trade-offs', 'A/B testing and canary rollout with automated rollback'],
      rubric_keywords: ['situation', 'task', 'action', 'result', 'a/b test', 'canary', 'stakeholder', 'metric', 'cost', 'trade-off']
    }
  ],
  // ── Company-Calibrated Simulation Tracks (Connection D) ──
  anthropic: [
    {
      id: 101,
      title: 'Anthropic Systems Screen: Online Softmax & FlashAttention-2 SRAM Tiling',
      scenario: 'Architect a low-latency frontier serving pipeline utilizing FlashAttention-2 with Online Softmax SRAM tiling on 8x H100 GPUs, sustaining 6,000 req/sec with P99 < 20ms.',
      hints: ['Online Softmax running max/sum recurrence', 'Avoid quadratic N×N attention matrix in HBM', 'Overlap GPU computation with NCCL All-Reduce communications'],
      rubric_keywords: ['flashattention', 'sram', 'hbm', 'online softmax', 'tiling', 'vllm', 'pagedattention', 'p99', 'nccl', 'all-reduce']
    },
    {
      id: 102,
      title: 'Anthropic Distributed Infrastructure: Megatron-LM & Pipeline Parallelism',
      scenario: 'Compare Tensor Parallelism (column/row linear) vs Pipeline Parallelism (1F1B) across NVLink nodes when training a 70B parameter model.',
      hints: ['Tensor Parallel GEMM split and All-Reduce overhead', '1F1B bubble scheduling memory reduction', 'Activation checkpointing with ZeRO-3'],
      rubric_keywords: ['megatron', 'tensor parallelism', 'pipeline parallelism', '1f1b', 'bubble', 'nccl', 'all-reduce', 'bandwidth', 'nvlink']
    }
  ],
  nvidia: [
    {
      id: 201,
      title: 'NVIDIA GPU Systems Round: Custom Triton Kernel Optimization',
      scenario: 'Design and benchmark a custom Triton GPU kernel for online sequence tiling, eliminating shared memory bank conflicts and warp divergence.',
      hints: ['Thread block tile sizing for SRAM capacity', 'Memory coalescing across 128-byte transactions', 'FP16 and BF16 Tensor Core execution'],
      rubric_keywords: ['triton', 'warp', 'shared memory', 'bank conflict', 'coalesced', 'fp16', 'tensor core', 'sram', 'latency']
    },
    {
      id: 202,
      title: 'NVIDIA Inference Round: TensorRT-LLM & INT8/FP8 Quantization',
      scenario: 'Deploy a multi-GPU LLM inference gateway utilizing TensorRT-LLM and AWQ/FP8 weight-only quantization with continuous batching.',
      hints: ['Paged KV-cache memory management', 'Kernel fusion for RMSNorm + SwiGLU', 'Sub-15ms P99 latency bounds'],
      rubric_keywords: ['tensorrt', 'fp8', 'awq', 'quantization', 'kv-cache', 'latency', 'throughput', 'gemm', 'cuda']
    }
  ],
  openai: [
    {
      id: 301,
      title: 'OpenAI Infrastructure Screen: GQA KV-Cache & Multi-Node Training',
      scenario: 'Design a high-throughput transformer serving layer using Grouped-Query Attention (GQA) to cut KV-cache VRAM by 8x during autoregressive decoding.',
      hints: ['Multi-Head vs Multi-Query vs Grouped-Query Attention', 'Bandwidth-bound vs compute-bound regimes', 'FSDP and ZeRO memory partitioning'],
      rubric_keywords: ['gqa', 'kv-cache', 'distributed', 'fsdp', 'zero-3', 'bandwidth', 'transformer', 'gradient checkpointing']
    },
    {
      id: 302,
      title: 'OpenAI Alignment Screen: Direct Preference Optimization (DPO)',
      scenario: 'Derive the closed-form implicit reward equation for DPO and implement binary cross-entropy preference training bypassing PPO loops.',
      hints: ['Bradley-Terry preference formulation', 'Partition function cancellation', 'KL regularization with reference model'],
      rubric_keywords: ['dpo', 'rlhf', 'implicit reward', 'bradley-terry', 'partition function', 'loss', 'reference model', 'alignment']
    }
  ],
  databricks: [
    {
      id: 401,
      title: 'Databricks Lakehouse Screen: 10TB Streaming Architecture with Delta Lake & Photon',
      scenario: 'Architect an enterprise Lakehouse ingestion pipeline processing 100,000 events/sec with Delta Lake ACID guarantees and Photon vector engine acceleration.',
      hints: ['Structured Streaming with Kafka triggers', 'Z-Ordering and data skipping index', 'Liquid clustering vs static partitioning'],
      rubric_keywords: ['delta lake', 'spark', 'photon', 'acid', 'streaming', 'kafka', 'iceberg', 'partition pruning', 'z-order']
    }
  ]
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company')?.toLowerCase() || '';
  const track = searchParams.get('track') || 'ml_system_design';

  let questions = MOCK_QUESTION_SETS[track] || MOCK_QUESTION_SETS.ml_system_design;

  if (company && MOCK_QUESTION_SETS[company]) {
    questions = MOCK_QUESTION_SETS[company];
  }

  try {
    const supabase = getSupabase();
    const { data: history } = await supabase.from('mock_interview_sessions').select('*').order('completed_at', { ascending: false }).limit(10);
    return NextResponse.json({ questions, history: history || [] });
  } catch (error) {
    console.error('Failed to get mock interview history, returning questions:', error);
    return NextResponse.json({ questions, history: [] });
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

    body = whitelistFields(body, 'mock_interview', '/api/mock-interview');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['answers']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.duration_minutes !== undefined && !validateRange(body.duration_minutes, 5, 60)) {
      logSecurityEvent('BLOCK', 'Duration minutes out of range', { duration: body.duration_minutes });
      return NextResponse.json({ error: 'Duration minutes must be between 5 and 60' }, { status: 400 });
    }

    const { track, company, duration_minutes, answers } = body;

    let totalScore = 0;
    const feedback = [];

    // Analyze answers against rubric keywords
    const questionList = Object.values(MOCK_QUESTION_SETS).flat();

    if (Array.isArray(answers)) {
      answers.forEach(item => {
        const q = questionList.find(x => x.id === item.questionId);
        const text = (item.response || '').toLowerCase();
        let matchedCount = 0;

        if (q && q.rubric_keywords) {
          q.rubric_keywords.forEach(kw => {
            if (text.includes(kw)) matchedCount++;
          });
          const scorePercent = Math.min(100, Math.round((matchedCount / (q.rubric_keywords.length * 0.6)) * 100));
          totalScore += scorePercent;

          feedback.push({
            question: q.title,
            score: scorePercent,
            matchedKeywords: q.rubric_keywords.filter(kw => text.includes(kw)),
            missingKeywords: q.rubric_keywords.filter(kw => !text.includes(kw)).slice(0, 4)
          });
        }
      });
    }

    const finalScore = answers?.length ? Math.round(totalScore / answers.length) : 88;

    const { data: insert, error: insertError } = await supabase.from('mock_interview_sessions').insert([{
      track: track || (company ? `${company.toUpperCase()} Simulation` : 'ML System Design'),
      duration_minutes: duration_minutes || 15,
      score: finalScore,
      feedback_json: JSON.stringify(feedback),
      questions_answered: answers?.length || 1
    }]).select().single();
    if (insertError) throw insertError;

    await supabase.from('activity_log').insert([{
      action: 'Completed Mock Interview',
      entity_type: 'mock_interview',
      entity_id: insert.id,
      entity_name: `${track || company || 'ML Systems'} (${finalScore}% score)`
    }]);

    return NextResponse.json({ success: true, score: finalScore, feedback });
  } catch (error) {
    console.error('Failed to submit mock interview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
