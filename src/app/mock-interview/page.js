'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

const TRACKS = [
  { key: 'ml_system_design', icon: '🏛️', name: 'ML System Design', desc: 'RAG pipelines, low-latency streaming inference, feature stores, and scaling.' },
  { key: 'deep_learning_math', icon: '📐', name: 'Deep Learning & Math', desc: 'Backprop derivatives, attention complexity, loss functions, and optimization.' },
  { key: 'behavioral_leadership', icon: '👔', name: 'Behavioral & Leadership', desc: 'STAR method responses, trade-off communication, and stakeholder management.' }
];

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
    } catch (e) {
      console.error(e);
    }
  }, [selectedTrack]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Timer Countdown
  useEffect(() => {
    let timer = null;
    if (inProgress && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
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
    const qId = questions[currentIdx]?.id;
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitSimulation = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        response: userAnswers[q.id] || ''
      }));

      const res = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: TRACKS.find(t => t.key === selectedTrack)?.name || 'ML System Design',
          duration_minutes: 15,
          answers: formattedAnswers
        })
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

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🎙️ AI Mock Technical Interview Simulator</h1>
          <p className={styles.subtitle}>
            Practice live high-pressure technical rounds with real-time countdown timers and automated rubric evaluation.
          </p>
        </div>
        {!inProgress && (
          <button className="btn btn-primary" onClick={startSimulation}>
            ▶ Start 15-Min Simulation
          </button>
        )}
      </div>

      {/* Track Selection */}
      {!inProgress && !results && (
        <div className={styles.trackGrid}>
          {TRACKS.map(t => (
            <div
              key={t.key}
              className={`${styles.trackCard} ${selectedTrack === t.key ? styles.trackActive : ''}`}
              onClick={() => setSelectedTrack(t.key)}
            >
              <div className={styles.trackIcon}>{t.icon}</div>
              <div className={styles.trackName}>{t.name}</div>
              <div className={styles.trackDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Live Simulation Arena */}
      {inProgress && currentQ && (
        <div className={styles.simArena}>
          <div className={styles.arenaTop}>
            <div>
              <span className="tag">Question {currentIdx + 1} of {questions.length}</span>
              <strong style={{ marginLeft: '12px', color: 'var(--text-primary)' }}>
                {TRACKS.find(t => t.key === selectedTrack)?.name}
              </strong>
            </div>
            <div className={styles.timerPill}>
              ⏱️ {formatTimer(timeLeft)}
            </div>
          </div>

          <div className={styles.scenarioBox}>
            <h3 className={styles.scenarioTitle}>{currentQ.title}</h3>
            <p className={styles.scenarioText}>{currentQ.scenario}</p>
            <div className={styles.hintsBox}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>KEY CONCEPTS TO ADDRESS:</span>
              {currentQ.hints.map((h, i) => (
                <span key={i} className={styles.hintTag}>{h}</span>
              ))}
            </div>
          </div>

          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            YOUR DETAILED TECHNICAL RESPONSE (Type architecture, formulas, algorithms, or STAR structure):
          </label>
          <textarea
            className={styles.responseArea}
            placeholder="Structure your answer clearly. E.g. '1. Requirements & Bottlenecks... 2. Architecture & Data Flow... 3. Model Evaluation & Trade-offs'..."
            value={userAnswers[currentQ.id] || ''}
            onChange={(e) => handleTextChange(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
            >
              ← Previous Question
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentIdx(prev => prev + 1)}
              >
                Next Question →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleSubmitSimulation}
              >
                {submitting ? 'Evaluating...' : '✓ Finish & Grade Simulation'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results & Score Card */}
      {results && (
        <div className={styles.scoreCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '22px', color: 'var(--text-primary)', margin: 0 }}>Interview Score Report</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Evaluated against technical depth and rubric keywords</p>
            </div>
            <div className={styles.scoreVal}>{results.score}%</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.feedback?.map((fb, idx) => (
              <div key={idx} style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{fb.question}</strong>
                  <span className={`badge ${fb.score >= 70 ? 'badge-completed' : 'badge-in-progress'}`}>{fb.score}% Match</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--success)' }}>
                  ✓ Covered Concepts: {fb.matchedKeywords?.length ? fb.matchedKeywords.join(', ') : 'None detected'}
                </div>
                {fb.missingKeywords?.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '4px' }}>
                    ⚠️ Opportunities to elevate: Consider mentioning {fb.missingKeywords.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setResults(null)}>
              Start Another Round
            </button>
          </div>
        </div>
      )}

      {/* Historical Sessions Feed */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-title" style={{ marginBottom: '12px' }}>Recent Mock Interview History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((h) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{h.track}</strong>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{new Date(h.completed_at).toLocaleDateString()} • {h.duration_minutes} min</div>
                </div>
                <span className={`badge ${h.score >= 80 ? 'badge-completed' : 'badge-in-progress'}`}>
                  {h.score}% Score
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
