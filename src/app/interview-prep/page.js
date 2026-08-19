'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import {
  IconInterview,
  IconCheck,
} from '@/components/Icons';

const CATEGORIES = [
  'All',
  'Machine Learning',
  'Deep Learning',
  'Statistics & Math',
  'Python & SQL',
  'ML System Design',
];

export default function InterviewPrepPage() {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

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

  const handleUpdateStatus = async (questionId, newStatus) => {
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
        showToast(
          newStatus === 'mastered'
            ? 'Solution marked as Mastered!'
            : `Question status updated to ${newStatus.toUpperCase()}`,
          'info'
        );
        fetchQuestions();
      }
    } catch (e) {
      console.error('Error updating question status:', e);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return q.question.toLowerCase().includes(term) || (q.tags && q.tags.toLowerCase().includes(term));
  });

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="loadingSpinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Loading Technical Question Bank...</p>
      </div>
    );
  }

  const masteryPercent =
    stats?.total_questions > 0
      ? Math.round((stats.mastered_count / stats.total_questions) * 100)
      : 0;

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 07"
        title={<>QUESTION<br />BANK.</>}
        subtitle="A structured index of technical problems across Machine Learning, Transformer architectures, and System Design."
      />

      {/* Progress Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)' }}>{stats?.total_questions || 0}</div>
          <div className={styles.statLabel}>Core Problems</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
            {stats?.mastered_count || 0} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({masteryPercent}%)</span>
          </div>
          <div className={styles.statLabel}>Mastered Solutions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
            {stats?.reviewing_count || 0}
          </div>
          <div className={styles.statLabel}>In Active Review</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.unprepared_count || 0}
          </div>
          <div className={styles.statLabel}>Unprepared</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: '12px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          className="input"
          style={{ maxWidth: '280px', fontSize: '12.5px' }}
          placeholder="Filter by keyword or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Question Cards */}
      <div className={styles.questionList}>
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          const diffClass =
            q.difficulty === 'easy'
              ? styles.diffEasy
              : q.difficulty === 'hard'
              ? styles.diffHard
              : styles.diffMedium;

          return (
            <div key={q.id} className={styles.qCard}>
              <div
                className={styles.qCardHeader}
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
              >
                <div>
                  <div className={styles.qMeta}>
                    <span className={styles.categoryTag} style={{ fontSize: '11px' }}>{q.category}</span>
                    <span className={`${styles.difficultyTag} ${diffClass}`} style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
                      {q.difficulty}
                    </span>
                    {q.tags && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {q.tags}</span>}
                  </div>
                  <h3 className={styles.qTitle} style={{ fontSize: '14px', marginTop: '6px' }}>{q.question}</h3>
                </div>

                <div className={styles.qStatusWrap} onClick={(e) => e.stopPropagation()}>
                  <select
                    className={styles.statusSelect}
                    value={q.user_status || 'unprepared'}
                    onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                    style={{ fontSize: '11.5px' }}
                  >
                    <option value="unprepared">Unprepared</option>
                    <option value="reviewing">In Review</option>
                    <option value="mastered">✓ Mastered</option>
                  </select>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.qCardBody}>
                  <div className={styles.answerSection}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Structured Model Solution & Key Trade-offs:
                    </div>
                    <div className={styles.answerText} style={{ fontSize: '13px', lineHeight: 1.6 }}>
                      {q.answer}
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
