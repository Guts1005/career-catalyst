'use client';

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import {
  resolveCompanyContext,
  prioritizeQuestions,
  getAllCompanyProfiles,
} from '@/lib/interviewIntelligenceRegistry';

const CATEGORIES = [
  'All',
  'ML System Design',
  'Distributed Systems',
  'Deep Learning & LLMs',
  'Python & Triton',
  'Statistics & Probability',
];

const BENCHMARK_QUESTIONS = [
  {
    id: 1,
    category: 'ML System Design',
    difficulty: 'hard',
    question: 'Explain the mathematical formulation of Online Softmax in FlashAttention-2 and how it avoids writing the N×N attention matrix to HBM.',
    answer: 'Online softmax maintains running max m_i = max(m_{i-1}, max(S_i)) and running sum l_i = l_{i-1} * exp(m_{i-1} - m_i) + sum(exp(S_i - m_i)). By rescaling the accumulated output O_i with exp(m_{i-1} - m_i), intermediate attention weights S = QK^T can be computed block by block directly inside fast on-chip SRAM without ever materializing the quadratic matrix in high-bandwidth memory (HBM).',
    user_status: 'mastered',
    user_notes: 'Tri Dao arXiv:2307.08691. Evaluated on 8x H100 SXM5 GPUs with 73% peak TFLOPs.',
    tags: 'PyTorch, CUDA, FlashAttention, Online Softmax, Anthropic, NVIDIA',
  },
  {
    id: 2,
    category: 'Distributed Systems',
    difficulty: 'hard',
    question: 'Compare Tensor Parallelism (Megatron-LM column/row linear) vs Pipeline Parallelism (1F1B) in distributed LLM training.',
    answer: 'Tensor parallelism splits weight matrices across GPUs within an NVLink node (column-parallel GEMM in first layer, row-parallel GEMM in second layer followed by an All-Reduce). Pipeline parallelism splits sequential layers across stages across slower network nodes with 1F1B (One-Forward-One-Backward) scheduling to minimize pipeline bubble memory overhead.',
    user_status: 'reviewing',
    user_notes: 'Shoeybi et al. (arXiv:1909.08053). Communication volume is 2x GEMM output size per layer.',
    tags: 'Distributed Systems, Megatron-LM, Tensor Parallelism, Anthropic, OpenAI',
  },
  {
    id: 3,
    category: 'Deep Learning & LLMs',
    difficulty: 'medium',
    question: 'How does Grouped-Query Attention (GQA) reduce KV-Cache memory consumption during multi-token autoregressive decoding?',
    answer: 'Multi-Head Attention (MHA) creates distinct K and V heads for every Q head, leading to huge KV-cache memory during long-context serving. Multi-Query Attention (MQA) collapses all K/V to 1 single head, hurting quality. GQA groups Q heads (e.g. 8 Q heads per 1 K/V head), achieving 8x reduction in KV cache memory bandwidth with negligible perplexity degradation.',
    user_status: 'mastered',
    user_notes: 'Adopted in LLaMA-3, Mistral-7B, and DeepSeek-V3.',
    tags: 'Transformer Architectures, GQA, KV-Cache, OpenAI, Meta',
  },
  {
    id: 4,
    category: 'Statistics & Probability',
    difficulty: 'hard',
    question: 'Derive the closed-form implicit reward equation for Direct Preference Optimization (DPO) starting from the Bradley-Terry preference model.',
    answer: 'Under the Bradley-Terry model p(y_w > y_l | x) = sigma(r(x, y_w) - r(x, y_l)). By reparameterizing the ground-truth reward r(x, y) = beta * log(pi_theta(y|x) / pi_ref(y|x)) + beta * log Z(x), the partition function Z(x) cancels out in the difference r(x, y_w) - r(x, y_l), yielding the exact objective without requiring an explicit reward model or reinforcement learning loop.',
    user_status: 'reviewing',
    user_notes: 'Rafailov et al. (Stanford University, NeurIPS 2023).',
    tags: 'RLHF, DPO, Post-Training RL, Anthropic, OpenAI',
  },
];

function InterviewPrepContent() {
  const router = useRouter();
  const { activeInterviews, readiness, logRejectionFeedback, refreshCareerState } = useCareer();
  const searchParams = useSearchParams();

  const companyParam = searchParams.get('company') || '';
  const roleParam = searchParams.get('role') || '';
  const stageParam = searchParams.get('stage') || '';
  const topicParam = searchParams.get('topic') || '';

  // Active Company Selection State (URL param takes precedence, else fallback to first active interview)
  const [selectedCompany, setSelectedCompany] = useState(companyParam);

  useEffect(() => {
    if (companyParam) {
      setSelectedCompany(companyParam);
    }
  }, [companyParam]);

  // Resolve Context
  const activeContext = useMemo(() => {
    if (selectedCompany) {
      return resolveCompanyContext(selectedCompany, roleParam, stageParam);
    }
    if (activeInterviews && activeInterviews.length > 0) {
      const topInterview = activeInterviews[0];
      return resolveCompanyContext(topInterview.company, topInterview.role, topInterview.status);
    }
    return null;
  }, [selectedCompany, roleParam, stageParam, activeInterviews]);

  const [questions, setQuestions] = useState(BENCHMARK_QUESTIONS);
  const [stats, setStats] = useState({ total_questions: 4, mastered_count: 2, reviewing_count: 2, unprepared_count: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState(topicParam || '');
  const searchInputRef = useRef(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const url =
        selectedCategory === 'All'
          ? '/api/interview-prep'
          : `/api/interview-prep?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setStats(data.stats);
      } else {
        setQuestions(BENCHMARK_QUESTIONS);
        setStats({ total_questions: 4, mastered_count: 2, reviewing_count: 2, unprepared_count: 0 });
      }
    } catch (e) {
      console.error('Failed to load interview questions:', e);
      setQuestions(BENCHMARK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateStatus = async (questionId, newStatus, questionCategory) => {
    try {
      const res = await fetch(`/api/interview-prep/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setQuestions(
          questions.map((q) =>
            q.id === questionId ? { ...q, user_status: newStatus } : q
          )
        );

        if (newStatus === 'needs_review' && questionCategory) {
          logRejectionFeedback(null, 'Interview Practice Deficit', questionCategory);
          showToast(`Marked for Review: Added "${questionCategory}" to your high-priority Skill Gaps!`, 'info');
        } else {
          showToast(
            newStatus === 'mastered'
              ? 'Solution marked as Mastered!'
              : `Question status updated to ${newStatus.toUpperCase()}`,
            'info'
          );
        }
        fetchQuestions();
        refreshCareerState();
      }
    } catch (e) {
      console.error('Error updating question status:', e);
    }
  };

  // Prioritize Questions using Connection C Model
  const prioritizedQuestionList = useMemo(() => {
    const candidateGaps = readiness?.gaps || [];
    if (activeContext && activeContext.isMatched) {
      return prioritizeQuestions(questions, activeContext, candidateGaps);
    }
    return questions.map((q) => ({
      ...q,
      priorityScore: 0,
      isCompanyPriority: false,
    }));
  }, [questions, activeContext, readiness]);

  const filteredQuestions = useMemo(() => {
    return prioritizedQuestionList.filter((q) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        q.question.toLowerCase().includes(term) ||
        (q.tags && q.tags.toLowerCase().includes(term)) ||
        (q.category && q.category.toLowerCase().includes(term))
      );
    });
  }, [prioritizedQuestionList, search]);

  const handleSelectCompanyContext = (compName) => {
    setSelectedCompany(compName);
    if (compName) {
      router.push(`/interview-prep?company=${encodeURIComponent(compName)}`);
    } else {
      router.push('/interview-prep');
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="ASSESSMENT MASTERY / 07"
        title={<>TECHNICAL INTERVIEW<br />QUESTION BANK.</>}
        subtitle="Architectural trade-off questions, latency bounds, and distributed training invariants tailored to active pipelines."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              MASTERED: {stats?.mastered || questions.filter((q) => q.user_status === 'mastered').length} / {stats?.total || questions.length}
            </span>
          </div>
        }
      />

      {/* ─── Active Interview Context Switcher Bar (Connection C) ─── */}
      {activeInterviews && activeInterviews.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            background: 'var(--bg-surface)',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
          role="region"
          aria-label="Active Interview Pipeline Context"
        >
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple, #a855f7)', fontWeight: 800 }}>
            ⚡ ACTIVE INTERVIEW PIPELINES:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {activeInterviews.map((ai) => {
              const isActive =
                activeContext &&
                activeContext.companyName.toLowerCase() === ai.company.toLowerCase();
              return (
                <button
                  key={ai.id}
                  type="button"
                  onClick={() => handleSelectCompanyContext(ai.company)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 10px',
                    borderColor: isActive ? 'var(--purple)' : 'var(--border)',
                    background: isActive ? 'var(--purple, #a855f7)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                  }}
                  aria-label={`Calibrate questions for ${ai.company} interview`}
                >
                  🎯 {ai.company.toUpperCase()} ({ai.status.toUpperCase()})
                </button>
              );
            })}
            {selectedCompany && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleSelectCompanyContext('')}
                style={{ fontSize: '11px', color: 'var(--text-muted)' }}
              >
                Clear Context ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Contextual Interview Intelligence Banner (Connection C) ─── */}
      {activeContext && activeContext.isMatched && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--purple, #a855f7)',
            borderLeft: '4px solid var(--purple, #a855f7)',
            padding: '16px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
            position: 'relative',
          }}
          role="region"
          aria-label={`Active interview preparation context for ${activeContext.companyName}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎯 CONTEXTUAL INTERVIEW INTELLIGENCE • {activeContext.companyName.toUpperCase()}
            </span>
            {activeContext.profile && (
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {activeContext.profile.badge} • {activeContext.roleTitle || 'ML Systems Engineer'}
              </span>
            )}
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
            Calibrated for upcoming <strong>{activeContext.companyName}</strong> {activeContext.stageName || 'Technical Interview'} round. High-probability questions matching their engineering focus have been prioritized at the top of your question bank.
          </p>

          {activeContext.focusTopics.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                PRIORITY FOCUS TOPICS:
              </span>
              {activeContext.focusTopics.map((topic) => (
                <span
                  key={topic}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: 'var(--purple, #a855f7)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontWeight: 600,
                  }}
                >
                  ✓ {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Streamlined Inline Question Summary */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px' }}>
          QUESTIONS: <strong style={{ color: 'var(--text-primary)' }}>{questions.length}</strong>
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', background: 'var(--green-subtle)', border: '1px solid var(--green-border)', padding: '4px 10px', borderRadius: '4px' }}>
          MASTERED: <strong>{questions.filter((q) => q.user_status === 'mastered').length}</strong>
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--amber)', background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', padding: '4px 10px', borderRadius: '4px' }}>
          NEEDS REVIEW: <strong>{questions.filter((q) => q.user_status === 'needs_review').length}</strong>
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', background: 'var(--purple-subtle)', border: '1px solid var(--purple-border)', padding: '4px 10px', borderRadius: '4px' }}>
          COMPANY PRIORITIES: <strong>{prioritizedQuestionList.filter((q) => q.isCompanyPriority).length}</strong>
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.pill} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or tags... (/)"
            style={{ fontSize: '12.5px', paddingRight: '30px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px', padding: '1px 5px' }}>
            /
          </span>
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className={styles.questionList}>
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id || idx}
              className={styles.questionCard}
              onClick={() => setExpandedId(isExpanded ? null : q.id)}
              style={
                q.isCompanyPriority
                  ? {
                      borderLeft: '4px solid var(--purple, #a855f7)',
                      background: 'var(--bg-surface)',
                    }
                  : {}
              }
            >
              <div className={styles.questionTop}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className={styles.questionCategory}>
                      0{idx + 1} • {q.category || 'ML System Design'}
                    </div>
                    {q.isCompanyPriority && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--purple)',
                          background: 'rgba(168, 85, 247, 0.12)',
                          border: '1px solid rgba(168, 85, 247, 0.35)',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        ★ HIGH PROBABILITY FOR {activeContext?.companyName.toUpperCase() || 'TARGET'}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.questionTitle}>{q.question}</h3>
                  {q.matchReason && (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
                      💡 {q.matchReason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: q.user_status === 'mastered' ? 'var(--green-subtle)' : 'var(--bg-subtle)',
                      color: q.user_status === 'mastered' ? 'var(--green)' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {q.user_status ? q.user_status.toUpperCase() : 'UNATTEMPTED'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.answerBlock} onClick={(e) => e.stopPropagation()}>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Architectural Solution & Key Invariants
                    </div>
                    <p style={{ margin: 0 }}>{q.answer}</p>
                  </div>

                  {q.user_notes && (
                    <div style={{ marginBottom: '14px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Empirical Benchmark Artifacts / Citations
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{q.user_notes}</p>
                    </div>
                  )}

                  {/* Peer-Reviewed Research Paper Citation (Connection G) */}
                  {q.citedPaper && (
                    <div style={{
                      marginBottom: '14px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderLeft: '3px solid var(--blue)',
                      padding: '12px 14px',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ maxWidth: '560px' }}>
                        <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase' }}>
                          📄 Peer-Reviewed Research Paper Citation
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {q.citedPaper.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {q.citedPaper.authors} ({q.citedPaper.year}) • {q.citedPaper.takeaway}
                        </div>
                      </div>
                      <Link
                        href={`/resources?paper=${encodeURIComponent(q.citedPaper.title)}&arxiv=${q.citedPaper.arxivId || ''}&from=interview-prep`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '5px 10px', borderColor: 'var(--blue)', color: 'var(--blue)', whiteSpace: 'nowrap' }}
                      >
                        📖 READ PAPER IN LIBRARY →
                      </Link>
                    </div>
                  )}

                  {/* Connected Feedback Triggers */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Mark Mastery Level:
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleUpdateStatus(q.id, 'needs_review', q.category)}
                        style={{ fontSize: '11px', color: 'var(--amber)' }}
                      >
                        Needs Review (! Flag Gap)
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(q.id, 'mastered', q.category)}
                        style={{ fontSize: '11px' }}
                      >
                        ✓ Mark Mastered
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="loadingSpinner" /><p>Calibrating Question Bank...</p></div>}>
      <InterviewPrepContent />
    </Suspense>
  );
}
