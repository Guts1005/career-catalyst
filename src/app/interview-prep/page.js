'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

const CATEGORIES = [
  'All',
  'Machine Learning',
  'Deep Learning',
  'Statistics & Math',
  'Python & SQL',
  'ML System Design'
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
      const url = selectedCategory === 'All' 
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
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Optimistic update
        setQuestions(questions.map(q => 
          q.id === questionId ? { ...q, user_status: newStatus } : q
        ));
        fetchQuestions();
      }
    } catch (e) {
      console.error('Error updating question status:', e);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return q.question.toLowerCase().includes(term) || (q.tags && q.tags.toLowerCase().includes(term));
  });

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="loadingSpinner" />
        <p>Loading Technical Question Bank...</p>
      </div>
    );
  }

  const masteryPercent = stats?.total_questions > 0 
    ? Math.round((stats.mastered_count / stats.total_questions) * 100) 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🧠 DS / ML Technical Interview Hub</h1>
          <p className={styles.subtitle}>
            Practice high-yield Machine Learning, Deep Learning, Statistics, and System Design interview questions.
          </p>
        </div>
      </div>

      {/* Progress Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
            📚
          </div>
          <div>
            <div className={styles.statVal}>{stats?.total_questions || 0}</div>
            <div className={styles.statLabel}>Total Core Questions</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
            🏆
          </div>
          <div>
            <div className={styles.statVal}>{stats?.mastered_count || 0} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({masteryPercent}%)</span></div>
            <div className={styles.statLabel}>Questions Mastered</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>
            🔄
          </div>
          <div>
            <div className={styles.statVal}>{stats?.reviewing_count || 0}</div>
            <div className={styles.statLabel}>In Active Review</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)' }}>
            🎯
          </div>
          <div>
            <div className={styles.statVal}>{stats?.unprepared_count || 0}</div>
            <div className={styles.statLabel}>To Practice</div>
          </div>
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
            >
              {cat}
            </button>
          ))}
        </div>

        <input 
          className="input" 
          style={{ maxWidth: '280px' }} 
          placeholder="Search by topic or keyword..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Question Cards */}
      <div className={styles.questionList}>
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          const diffClass = q.difficulty === 'easy' 
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
                    <span className={styles.categoryTag}>{q.category}</span>
                    <span className={`${styles.difficultyTag} ${diffClass}`}>{q.difficulty}</span>
                    {q.tags && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {q.tags}</span>}
                  </div>
                  <div className={styles.qTitle}>{q.question}</div>
                </div>
                <div className={`${styles.expandIndicator} ${isExpanded ? styles.expanded : ''}`}>
                  ▼
                </div>
              </div>

              {/* Reveal Answer Accordion */}
              {isExpanded && (
                <div className={styles.answerDrawer}>
                  <div className={styles.answerHeading}>Comprehensive Interview Answer</div>
                  <div className={styles.answerBody}>{q.answer}</div>

                  {q.key_takeaways && (
                    <div className={styles.takeawayBox}>
                      <div className={styles.takeawayTitle}>💡 Quick Interviewer Takeaways:</div>
                      <div className={styles.takeawayText}>{q.key_takeaways}</div>
                    </div>
                  )}

                  {q.code_snippet && (
                    <div>
                      <div className={styles.answerHeading}>Code / Implementation Snippet:</div>
                      <pre className={styles.codeBox}>{q.code_snippet}</pre>
                    </div>
                  )}

                  <div className={styles.statusBar}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Set Your Mastery Level:
                    </span>
                    <div className={styles.statusBtns}>
                      <button 
                        className={`${styles.statusBtn} ${q.user_status === 'unprepared' ? styles.activeUnprepared : ''}`}
                        onClick={() => handleUpdateStatus(q.id, 'unprepared')}
                      >
                        ⚠️ Needs Practice
                      </button>
                      <button 
                        className={`${styles.statusBtn} ${q.user_status === 'reviewing' ? styles.activeReviewing : ''}`}
                        onClick={() => handleUpdateStatus(q.id, 'reviewing')}
                      >
                        🔄 Reviewing
                      </button>
                      <button 
                        className={`${styles.statusBtn} ${q.user_status === 'mastered' ? styles.activeMastered : ''}`}
                        onClick={() => handleUpdateStatus(q.id, 'mastered')}
                      >
                        ✓ Mastered
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
