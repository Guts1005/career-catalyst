'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconInterview, IconCheck } from '@/components/Icons';

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

      {/* Progress KPIs */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)' }}>{stats?.total_questions || 0}</div>
          <div className={styles.statLabel}>Core Problems</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
            {stats?.mastered_count || 0} <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>({masteryPercent}%)</span>
          </div>
          <div className={styles.statLabel}>Mastered Solutions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statVal} style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
            {stats?.reviewing_count || 0}
          </div>
          <div className={styles.statLabel}>In Active Review</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filterSection}>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.catBtn} ${selectedCategory === cat ? styles.catActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <input
            ref={searchInputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search problems by keyword or concept... (/)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Question List */}
      <div className={styles.questionList}>
        {filteredQuestions.length === 0 ? (
          <div className={styles.emptyState}>No matching questions found in category.</div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} className={`${styles.questionCard} ${isExpanded ? styles.cardExpanded : ''}`}>
                <div
                  className={styles.cardHeader}
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.qLeft}>
                    <span className={styles.qIndex} style={{ fontFamily: 'var(--font-mono)' }}>
                      0{idx + 1}
                    </span>
                    <div>
                      <div className={styles.qTitle}>{q.question}</div>
                      <div className={styles.qMeta}>
                        <span className={`${styles.difficultyBadge} ${styles[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                        <span className={styles.metaCategory}>{q.category}</span>
                        {q.tags && (
                          <span className={styles.metaTags}>
                            {q.tags.split(',').map((t) => (
                              <span key={t} className={styles.tag}>
                                {t.trim()}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.qRight}>
                    <span className={`${styles.statusPill} ${styles[q.user_status || 'unseen']}`}>
                      {q.user_status === 'mastered' ? '● MASTERED' : q.user_status === 'reviewing' ? '● REVIEWING' : '○ PRACTICE'}
                    </span>
                    <button className={styles.expandToggle} type="button">
                      {isExpanded ? '↑ LESS' : '↓ EXAMINE'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.cardBody}>
                    <div className={styles.answerSection}>
                      <div className={styles.sectionHeader}>TECHNICAL SOLUTION & SYSTEM ARCHITECTURE</div>
                      <div className={styles.answerContent}>{q.answer}</div>
                    </div>

                    <div className={styles.actionRow}>
                      <div className={styles.statusButtons}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginRight: '8px' }}>
                          UPDATE STATUS:
                        </span>
                        <button
                          className={`btn ${q.user_status === 'mastered' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => handleUpdateStatus(q.id, 'mastered')}
                        >
                          ✓ Mastered
                        </button>
                        <button
                          className={`btn ${q.user_status === 'reviewing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => handleUpdateStatus(q.id, 'reviewing')}
                        >
                          Reviewing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
