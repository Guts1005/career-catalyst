'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { IconInterview, IconCheck } from '@/components/Icons';

const CATEGORIES = [
  'All',
  'ML System Design',
  'Distributed Systems',
  'Deep Learning & LLMs',
  'Python & Triton',
  'Statistics & Probability',
];

function InterviewPrepContent() {
  const { logRejectionFeedback, refreshCareerState } = useCareer();
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get('company') || '';
  const initialTopic = searchParams.get('topic') || '';

  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState(initialCompany || initialTopic || '');
  const searchInputRef = useRef(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const url =
        selectedCategory === 'All'
          ? '/api/interview-prep'
          : `/api/interview-prep?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to load interview questions:', e);
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

  const filteredQuestions = questions.filter((q) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return q.question.toLowerCase().includes(term) || (q.tags && q.tags.toLowerCase().includes(term)) || (q.category && q.category.toLowerCase().includes(term));
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 04"
        title={<>SYSTEM DESIGN &<br />QUESTION BANK.</>}
        subtitle="Architectural trade-off questions, latency bounds, and distributed training invariants."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              MASTERED: {stats?.mastered || 0} / {stats?.total || questions.length}
            </span>
          </div>
        }
      />

      {/* Contextual Company or Topic Target Banner */}
      {initialCompany && (
        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderLeft: '3px solid var(--purple)', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            🎯 Calibrated for upcoming <strong>{initialCompany}</strong> technical round.
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSearch('')}
            style={{ fontSize: '11px' }}
          >
            Clear Filter ✕
          </button>
        </div>
      )}

      {/* Stats KPI Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{questions.length}</div>
          <div className={styles.statLabel}>Available Problems</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ color: 'var(--green)' }}>
            {questions.filter((q) => q.user_status === 'mastered').length}
          </div>
          <div className={styles.statLabel}>Mastered Solutions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ color: 'var(--amber)' }}>
            {questions.filter((q) => q.user_status === 'needs_review').length}
          </div>
          <div className={styles.statLabel}>Needs Review</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ color: 'var(--blue)' }}>
            {questions.filter((q) => q.user_status === 'attempted').length}
          </div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
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
            >
              <div className={styles.questionTop}>
                <div>
                  <div className={styles.questionCategory}>
                    0{idx + 1} • {q.category || 'ML System Design'}
                  </div>
                  <h3 className={styles.questionTitle}>{q.question}</h3>
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

                  {q.key_points && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Core Checklist / Discussion Points
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {q.key_points.split(',').map((pt) => (
                          <span key={pt} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '3px', color: 'var(--text-secondary)' }}>
                            • {pt.trim()}
                          </span>
                        ))}
                      </div>
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
