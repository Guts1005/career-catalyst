import { getDb } from '@/lib/db';
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
  ]
};

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track') || 'ml_system_design';

    const questions = MOCK_QUESTION_SETS[track] || MOCK_QUESTION_SETS.ml_system_design;
    const history = db.prepare('SELECT * FROM mock_interview_sessions ORDER BY completed_at DESC LIMIT 10').all();

    return NextResponse.json({ questions, history });
  } catch (error) {
    console.error('Failed to get mock interview questions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
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

    if (body.track && !validateEnum(body.track, ['ML System Design', 'Deep Learning Math', 'Behavioral & Leadership'])) {
      logSecurityEvent('BLOCK', 'Invalid track enum', { track: body.track });
      return NextResponse.json({ error: 'Invalid track enum' }, { status: 400 });
    }

    const { track, duration_minutes, answers } = body;

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

    const finalScore = answers?.length ? Math.round(totalScore / answers.length) : 75;

    const result = db.prepare(`
      INSERT INTO mock_interview_sessions (track, duration_minutes, score, feedback_json, questions_answered)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      track || 'ML System Design',
      duration_minutes || 15,
      finalScore,
      JSON.stringify(feedback),
      answers?.length || 1
    );

    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'Completed Mock Interview', 'mock_interview', result.lastInsertRowid, `${track} (${finalScore}% score)`
    );

    return NextResponse.json({ success: true, score: finalScore, feedback });
  } catch (error) {
    console.error('Failed to submit mock interview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
