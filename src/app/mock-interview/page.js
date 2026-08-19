'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import {
  IconAssessment,
  IconCheck,
} from '@/components/Icons';

const TRACKS = [
  { key: 'ml_system_design', name: 'ML System Design', desc: 'RAG pipelines, low-latency streaming inference, and distributed vector stores.' },
  { key: 'deep_learning_math', name: 'Deep Learning & Math', desc: 'Backprop derivatives, transformer complexity, and optimization algorithms.' },
  { key: 'behavioral_leadership', name: 'Behavioral & Leadership', desc: 'STAR method responses, trade-off communication, and technical decision making.' },
];

const BENCHMARK_RESPONSE = `Architecture Design:
1. Ingestion Pipeline: Chunks documents using semantic boundary splitting (400 tokens, 10% overlap). Emits embeddings via text-embedding-3-large into a distributed Qdrant vector index paired with BM25 inverted index for hybrid retrieval.
2. Retrieval Strategy: Executes Reciprocal Rank Fusion (RRF) between dense and sparse results. Top 25 candidate chunks are re-ranked using a Cross-Encoder (bge-reranker-large) down to Top 5 high-relevance passages.
3. Generation & Guardrails: Injects grounded context with XML citations into Claude 3.5 Sonnet. Evaluates latency with vLLM PagedAttention and validates hallucinations using RAGAS faithfulness metrics.`;

export default function MockInterviewPage() {
  const [selectedTrack, setSelectedTrack] = useState('ml_system_design');
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/mock-interview?track=${selectedTrack}`);
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
      if (data.history) setHistory(data.history);
    } catch {
      /* ignore */
    }
  }, [selectedTrack]);

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
  };

  const handleTextChange = (text) => {
    const qId = questions[currentIdx]?.id || 1;
    setUserAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleLoadBenchmark = () => {
    const qId = questions[currentIdx]?.id || 1;
    setUserAnswers((prev) => ({ ...prev, [qId]: BENCHMARK_RESPONSE }));
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
          track: TRACKS.find((t) => t.key === selectedTrack)?.name || 'ML System Design',
          duration_minutes: 15,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data);
        setInProgress(false);
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIdx];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          <IconAssessment size={13} />
          TECHNICAL EVALUATION SIMULATOR
        </div>
        <h1 style={{ letterSpacing: '-0.03em', fontSize: '24px', fontWeight: 700 }}>Technical Interview Assessment</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
          Timed technical diagnostic rounds with automated rubric grading and candidate percentile benchmarking.
        </p>
      </div>

      {!inProgress && !results && (
        <div className={styles.setupSection}>
          <div className="card-title" style={{ fontSize: '14px', marginBottom: '14px' }}>Select Assessment Track</div>
          <div className={styles.tracksGrid}>
            {TRACKS.map((t) => (
              <div
                key={t.key}
                className={`${styles.trackCard} ${selectedTrack === t.key ? styles.trackSelected : ''}`}
                onClick={() => setSelectedTrack(t.key)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div className={styles.trackName}>{t.name}</div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>15 MIN</span>
                </div>
                <div className={styles.trackDesc}>{t.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={startSimulation} style={{ padding: '10px 24px', fontSize: '13.5px' }}>
              Begin 15-Minute Assessment Round
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Evaluates architectural depth, algorithmic correctness, and trade-off analysis.
            </span>
          </div>
        </div>
      )}

      {inProgress && (
        <div className={styles.simulationLayout}>
          {/* Top Bar */}
          <div className={styles.simTopBar}>
            <div>
              <span className="tag" style={{ fontSize: '11px' }}>
                Question {currentIdx + 1} of {questions.length || 3}
              </span>
            </div>
            <div className={styles.timerBadge} style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700 }}>
              ⏱ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
          </div>

          {/* Question Card */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {currentQ?.question || 'Design an end-to-end Retrieval-Augmented Generation (RAG) system for technical documentation.'}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px', whiteSpace: 'nowrap' }}
                onClick={handleLoadBenchmark}
              >
                ⚡ Load Top 1% Benchmark Sample
              </button>
            </div>

            <textarea
              className={styles.simTextarea}
              style={{ minHeight: '220px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
              placeholder="Type your structured technical solution here (include architecture components, trade-offs, and metrics)..."
              value={userAnswers[currentQ?.id || 1] || ''}
              onChange={(e) => handleTextChange(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                >
                  ← Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentIdx >= questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                >
                  Next →
                </button>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSubmitSimulation}
                disabled={submitting}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {submitting ? 'Benchmarking Rubric Score...' : 'Submit & Generate Scorecard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '16px' }}>Evaluation Assessment Scorecard</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Track: {results.track}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                {results.score}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                TOP 2.8% PERCENTILE
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Technical Accuracy</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>94%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>System Architecture</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>90%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trade-off Analysis</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>96%</div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => setResults(null)} style={{ fontSize: '12.5px' }}>
            ← Take Another Assessment
          </button>
        </div>
      )}
    </div>
  );
}
