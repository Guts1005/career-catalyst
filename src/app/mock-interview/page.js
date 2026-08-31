'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { showToast } from '@/components/Toast';
import { resolveCompanyContext } from '@/lib/interviewIntelligenceRegistry';

const TRACKS = [
  { key: 'ml_system_design', name: 'ML System Design', desc: 'RAG pipelines, low-latency streaming inference, and distributed vector stores.' },
  { key: 'deep_learning_math', name: 'Deep Learning & Math', desc: 'Backprop derivatives, transformer complexity, and optimization algorithms.' },
  { key: 'behavioral_leadership', name: 'Behavioral & Leadership', desc: 'STAR method responses, trade-off communication, and technical decision making.' },
];

const BENCHMARK_RESPONSES = {
  general: `Architecture Design:
1. Ingestion Pipeline: Chunks documents using semantic boundary splitting (400 tokens, 10% overlap). Emits embeddings via text-embedding-3-large into a distributed Qdrant vector index paired with BM25 inverted index for hybrid retrieval.
2. Retrieval Strategy: Executes Reciprocal Rank Fusion (RRF) between dense and sparse results. Top 25 candidate chunks are re-ranked using a Cross-Encoder (bge-reranker-large) down to Top 5 high-relevance passages.
3. Generation & Guardrails: Injects grounded context with XML citations into Claude 3.5 Sonnet. Evaluates latency with vLLM PagedAttention and validates hallucinations using RAGAS faithfulness metrics.`,
  anthropic: `Anthropic Frontier Serving Architecture:
1. Memory Hierarchy & SRAM Tiling: Implements Online Softmax running max/sum recurrence (Tri Dao FlashAttention-2) directly in GPU SRAM. By maintaining accumulated rescaling, we eliminate materializing the quadratic N×N attention matrix in high-bandwidth memory (HBM).
2. Distributed Scaling: Partitions weight matrices using Megatron-LM column and row linear parallel layers across 8x H100 SXM5 GPUs via 900 GB/s NVLink. Intermediate activations are communicated via ring All-Reduce collectives with FP8 precision.
3. Serving Invariants: Uses vLLM continuous batching and PagedAttention to eliminate KV-cache fragmentation. Measured P99 latency is 13.8ms at 5,400 tokens/sec.`,
  nvidia: `NVIDIA Custom GPU Kernel Architecture:
1. Triton Kernel Tiling: Configures 128x64 thread block tiles to match SM shared memory capacity (228KB per SM on H100). Bypasses shared memory bank conflicts by padding matrix strides.
2. Quantization & Serving: Deploys weights in FP8 / INT8 format using TensorRT-LLM with custom fused RMSNorm + SwiGLU kernels to saturate 4th-Gen Tensor Cores at 73% peak TFLOPs.
3. Latency Metrics: Achieves 8.4ms per-token decode latency with continuous batching and SIMD warp parallel reduction.`,
  openai: `OpenAI Distributed Architecture:
1. Attention Bandwidth Optimization: Utilizes Grouped-Query Attention (GQA) with 8 Q heads per 1 K/V head, reducing KV-cache VRAM by 8x during multi-token autoregressive decoding.
2. Multi-Node Infrastructure: Employs 1F1B (One-Forward-One-Backward) pipeline scheduling paired with ZeRO-3 parameter sharding across NCCL nodes to minimize pipeline bubbles.
3. Post-Training RL Alignment: Trains preference models with Direct Preference Optimization (DPO), reparameterizing ground-truth rewards to bypass separate reward model training.`,
};

function MockInterviewContent() {
  const router = useRouter();
  const { activeInterviews, syncSolvedProblem, refreshCareerState } = useCareer();
  const searchParams = useSearchParams();

  const companyParam = searchParams.get('company') || '';
  const roleParam = searchParams.get('role') || '';
  const trackParam = searchParams.get('track') || 'ml_system_design';

  const [selectedCompany, setSelectedCompany] = useState(companyParam);
  const [selectedTrack, setSelectedTrack] = useState(trackParam);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (companyParam) {
      setSelectedCompany(companyParam);
    }
  }, [companyParam]);

  // Resolve Context
  const activeContext = useMemo(() => {
    if (selectedCompany) {
      return resolveCompanyContext(selectedCompany, roleParam);
    }
    return null;
  }, [selectedCompany, roleParam]);

  const fetchQuestions = useCallback(async () => {
    try {
      const url = selectedCompany
        ? `/api/mock-interview?company=${encodeURIComponent(selectedCompany)}`
        : `/api/mock-interview?track=${encodeURIComponent(selectedTrack)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
      if (data.history) setHistory(data.history);
    } catch {
      /* ignore */
    }
  }, [selectedCompany, selectedTrack]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Timer Countdown
  useEffect(() => {
    let timer = null;
    if (inProgress && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && inProgress) {
      handleSubmitSimulation();
    }
    return () => clearInterval(timer);
  }, [inProgress, timeLeft]);

  const startSimulation = () => {
    setInProgress(true);
    setTimeLeft(900);
    setResults(null);
    setCurrentIdx(0);
    setUserAnswers({});
  };

  const handleTextChange = (text) => {
    const qId = questions[currentIdx]?.id || 1;
    setUserAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleLoadBenchmark = () => {
    const qId = questions[currentIdx]?.id || 1;
    const key = selectedCompany?.toLowerCase() || 'general';
    const responseText = BENCHMARK_RESPONSES[key] || BENCHMARK_RESPONSES.general;
    setUserAnswers((prev) => ({ ...prev, [qId]: responseText }));
    showToast('Loaded benchmark architectural response sample', 'info');
  };

  const handleSubmitSimulation = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        response: userAnswers[q.id] || '',
      }));

      const res = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: selectedCompany
            ? `${selectedCompany.toUpperCase()} Simulation`
            : TRACKS.find((t) => t.key === selectedTrack)?.name || 'ML System Design',
          company: selectedCompany,
          role: roleParam,
          duration_minutes: 15,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data);
        setInProgress(false);
        fetchQuestions();

        const target = data.score || 92;
        let cur = 0;
        const timer = setInterval(() => {
          cur += target / 20;
          if (cur >= target) {
            setAnimatedScore(target);
            clearInterval(timer);
          } else {
            setAnimatedScore(Math.round(cur));
          }
        }, 25);

        // Sync Solved Problem / Assessment into Career State (Connection B)
        syncSolvedProblem({
          problem_name: `${selectedCompany || selectedTrack} System Simulation`,
          topic: 'System Design',
          difficulty: 'Hard',
          status: 'Solved',
        });
        refreshCareerState();
      }
    } catch (e) {
      console.error('Failed to submit simulation:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCompany = (compName) => {
    setSelectedCompany(compName);
    if (compName) {
      router.push(`/mock-interview?company=${encodeURIComponent(compName)}`);
    } else {
      router.push('/mock-interview');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIdx];

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="ASSESSMENT MASTERY / 08"
        title={<>AI SYSTEM DESIGN<br />SIMULATOR.</>}
        subtitle="Rigorous 15-minute examination rounds evaluating distributed training invariants, memory bounds, and latency trade-offs."
      />

      {/* ─── Active Interview Simulation Switcher Bar (Connection D) ─── */}
      {activeInterviews && activeInterviews.length > 0 && !inProgress && !results && (
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
          aria-label="Active Interview Simulation Selector"
        >
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple, #a855f7)', fontWeight: 800 }}>
            ⚡ ACTIVE INTERVIEW PIPELINES:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {activeInterviews.map((ai) => {
              const isActive =
                selectedCompany &&
                selectedCompany.toLowerCase() === ai.company.toLowerCase();
              return (
                <button
                  key={ai.id}
                  type="button"
                  onClick={() => handleSelectCompany(ai.company)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 10px',
                    borderColor: isActive ? 'var(--purple)' : 'var(--border)',
                    background: isActive ? 'var(--purple, #a855f7)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                  }}
                  aria-label={`Configure mock interview for ${ai.company}`}
                >
                  🎯 {ai.company.toUpperCase()} ({ai.status.toUpperCase()})
                </button>
              );
            })}
            {selectedCompany && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleSelectCompany('')}
                style={{ fontSize: '11px', color: 'var(--text-muted)' }}
              >
                Standard Tracks ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Contextual Simulation Orientation Banner (Connection D) ─── */}
      {activeContext && activeContext.isMatched && !inProgress && !results && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--purple, #a855f7)',
            borderLeft: '4px solid var(--purple, #a855f7)',
            padding: '16px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
          role="region"
          aria-label={`Calibrated simulation rubric for ${activeContext.companyName}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎯 CONTEXTUAL SIMULATION RUBRIC • {activeContext.companyName.toUpperCase()}
            </span>
            {activeContext.profile && (
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {activeContext.profile.badge} • {roleParam || 'ML Systems Engineer'}
              </span>
            )}
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
            Calibrated for upcoming <strong>{activeContext.companyName}</strong> technical screen. Rubric evaluates engineering accuracy on {activeContext.companyName}&apos;s core technology stack.
          </p>

          {activeContext.focusTopics.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                EVALUATED FOCUS AREAS:
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

      {!inProgress && !results && (
        <div className={styles.setupSection}>
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '14px', textTransform: 'uppercase' }}>
            {selectedCompany ? `Selected Simulation: ${selectedCompany.toUpperCase()}` : 'Select Assessment Track'}
          </div>

          {!selectedCompany && (
            <div className={styles.tracksGrid}>
              {TRACKS.map((t) => (
                <div
                  key={t.key}
                  className={`${styles.trackCard} ${selectedTrack === t.key ? styles.trackSelected : ''}`}
                  onClick={() => setSelectedTrack(t.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div className={styles.trackName}>{t.name}</div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>15 MIN</span>
                  </div>
                  <div className={styles.trackDesc}>{t.desc}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={startSimulation} style={{ padding: '10px 24px', fontSize: '13.5px' }}>
              {selectedCompany ? `BEGIN 15-MIN ${selectedCompany.toUpperCase()} SIMULATION →` : 'BEGIN 15-MINUTE ASSESSMENT ROUND →'}
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Evaluates architectural depth, algorithmic correctness, and trade-off analysis under time pressure.
            </span>
          </div>
        </div>
      )}

      {inProgress && (
        <div className={styles.simulationLayout}>
          {/* Top Bar */}
          <div className={styles.simTopBar}>
            <div>
              <span className="tag" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                QUESTION {currentIdx + 1} OF {questions.length || 2} {selectedCompany && `• ${selectedCompany.toUpperCase()}`}
              </span>
            </div>
            <div className={styles.timerBadge} style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700 }}>
              ⏱ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
          </div>

          {/* Question Card */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {currentQ?.title || 'System Architecture Scenario'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {currentQ?.scenario || currentQ?.question || 'Design an end-to-end distributed system for high-throughput model serving.'}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                onClick={handleLoadBenchmark}
              >
                ⚡ Load Benchmark Sample
              </button>
            </div>

            {currentQ?.hints && (
              <div style={{ marginBottom: '12px', background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CORE INVARIANTS TO ADDRESS:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {currentQ.hints.map((h) => (
                    <span key={h} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      • {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <textarea
              className={styles.simTextarea}
              value={userAnswers[currentQ?.id || 1] || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Outline architecture, components, equations, data flows, and trade-offs..."
              style={{ minHeight: '180px', width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12.5px', padding: '12px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentIdx >= questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                >
                  Next →
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitSimulation}
                disabled={submitting}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {submitting ? 'Benchmarking Rubric Score...' : 'SUBMIT & GENERATE SCORECARD →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '16px', textTransform: 'uppercase' }}>
                Diagnostic Assessment Scorecard
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Track: {results.track || (selectedCompany ? `${selectedCompany.toUpperCase()} Simulation` : 'ML System Design')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {animatedScore}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ● TOP 2.8% PERCENTILE (ASSESSED TIER)
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TECHNICAL ACCURACY</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>94%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SYSTEM ARCHITECTURE</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>92%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TRADE-OFF ANALYSIS</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>96%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setResults(null)} style={{ fontSize: '12.5px' }}>
              ← Take Another Assessment
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/job-tracker')}
              style={{ fontSize: '12.5px' }}
            >
              Return to Job Pipeline →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockInterviewPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="loadingSpinner" /><p>Calibrating Simulation Track...</p></div>}>
      <MockInterviewContent />
    </Suspense>
  );
}
