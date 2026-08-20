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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let query = supabase.from('interview_questions').select('*, user_question_progress(status, notes, last_reviewed_at)');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'All') {
      query = query.eq('difficulty', difficulty.toLowerCase());
    }

    const { data: rawQuestions, error: questionsError } = await query.order('id', { ascending: true });
    if (questionsError) throw questionsError;

    const questions = rawQuestions.map(q => {
      const progress = Array.isArray(q.user_question_progress) ? q.user_question_progress[0] : q.user_question_progress;
      const { user_question_progress, ...rest } = q;
      return {
        ...rest,
        user_status: progress?.status || 'unprepared',
        user_notes: progress?.notes || null,
        last_reviewed_at: progress?.last_reviewed_at || null
      };
    });

    // Compute stats
    const { data: allQuestionsForStats, error: statsError } = await supabase
      .from('interview_questions')
      .select('id, user_question_progress(status)');
    
    if (statsError) throw statsError;

    const stats = {
      total_questions: allQuestionsForStats.length,
      mastered_count: 0,
      reviewing_count: 0,
      unprepared_count: 0
    };

    const defaultQuestions = [
      {
        id: 1,
        category: 'ML System Design',
        difficulty: 'hard',
        question: 'Explain the mathematical formulation of Online Softmax in FlashAttention-2 and how it avoids writing the N×N attention matrix to HBM.',
        answer: 'Online softmax maintains running max m_i = max(m_{i-1}, max(S_i)) and running sum l_i = l_{i-1} * exp(m_{i-1} - m_i) + sum(exp(S_i - m_i)). By rescaling the accumulated output O_i with exp(m_{i-1} - m_i), intermediate attention weights S = QK^T can be computed block by block directly inside fast on-chip SRAM without ever materializing the quadratic matrix in high-bandwidth memory (HBM).',
        user_status: 'mastered',
        user_notes: 'Tri Dao arXiv:2307.08691. Evaluated on 8x H100 SXM5 GPUs with 73% peak TFLOPs.',
      },
      {
        id: 2,
        category: 'Distributed Systems',
        difficulty: 'hard',
        question: 'Compare Tensor Parallelism (Megatron-LM column/row linear) vs Pipeline Parallelism (1F1B) in distributed LLM training.',
        answer: 'Tensor parallelism splits weight matrices across GPUs within an NVLink node (column-parallel GEMM in first layer, row-parallel GEMM in second layer followed by an All-Reduce). Pipeline parallelism splits sequential layers across stages across slower network nodes with 1F1B (One-Forward-One-Backward) scheduling to minimize pipeline bubble memory overhead.',
        user_status: 'reviewing',
        user_notes: 'Shoeybi et al. (arXiv:1909.08053). Communication volume is 2x GEMM output size per layer.',
      },
      {
        id: 3,
        category: 'Deep Learning Architecture',
        difficulty: 'medium',
        question: 'How does Grouped-Query Attention (GQA) reduce KV-Cache memory consumption during multi-token autoregressive decoding?',
        answer: 'Multi-Head Attention (MHA) creates distinct K and V heads for every Q head, leading to huge KV-cache memory during long-context serving. Multi-Query Attention (MQA) collapses all K/V to 1 single head, hurting quality. GQA groups Q heads (e.g. 8 Q heads per 1 K/V head), achieving 8x reduction in KV cache memory bandwidth with negligible perplexity degradation.',
        user_status: 'mastered',
        user_notes: 'Adopted in LLaMA-3, Mistral-7B, and DeepSeek-V3.',
      },
      {
        id: 4,
        category: 'Mathematical Foundations',
        difficulty: 'hard',
        question: 'Derive the closed-form implicit reward equation for Direct Preference Optimization (DPO) starting from the Bradley-Terry preference model.',
        answer: 'Under the Bradley-Terry model p(y_w > y_l | x) = sigma(r(x, y_w) - r(x, y_l)). By reparameterizing the ground-truth reward r(x, y) = beta * log(pi_theta(y|x) / pi_ref(y|x)) + beta * log Z(x), the partition function Z(x) cancels out in the difference r(x, y_w) - r(x, y_l), yielding the exact objective without requiring an explicit reward model or reinforcement learning loop.',
        user_status: 'reviewing',
        user_notes: 'Rafailov et al. (Stanford University, NeurIPS 2023).',
      },
    ];

    const finalQuestions = (questions && questions.length > 0) ? questions : defaultQuestions;
    const finalStats = (allQuestionsForStats && allQuestionsForStats.length > 0) ? stats : { total_questions: 4, mastered_count: 2, reviewing_count: 2, unprepared_count: 0 };

    return NextResponse.json({ questions: finalQuestions, stats: finalStats });
  } catch (error) {
    console.error('Failed to get interview questions:', error);
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

    body = whitelistFields(body, 'interview_prep', '/api/interview-prep');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['question', 'answer']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.difficulty && !validateEnum(body.difficulty, ['easy', 'medium', 'hard'])) {
      logSecurityEvent('BLOCK', 'Invalid difficulty enum', { difficulty: body.difficulty });
      return NextResponse.json({ error: 'Invalid difficulty enum' }, { status: 400 });
    }

    const { category, difficulty, question, answer, key_takeaways, code_snippet, tags } = body;

    const { data: newQuestion, error: insertError } = await supabase.from('interview_questions').insert([{
      category: category || 'Machine Learning',
      difficulty: difficulty || 'medium',
      question,
      answer,
      key_takeaways: key_takeaways || '',
      code_snippet: code_snippet || '',
      tags: tags || ''
    }]).select().single();
    
    if (insertError) throw insertError;

    await supabase.from('user_question_progress').insert([{
      question_id: newQuestion.id,
      status: 'unprepared'
    }]);

    return NextResponse.json({ id: newQuestion.id, message: 'Question created' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
