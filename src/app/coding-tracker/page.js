'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import {
  IconCoding,
  IconCheck,
  IconArrowUpRight,
} from '@/components/Icons';

const PLATFORMS = ['All', 'LeetCode', 'Kaggle', 'StrataScratch', 'HackerRank'];

export default function CodingTrackerPage() {
  const [profiles, setProfiles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [category, setCategory] = useState('Machine Learning Math');
  const [difficulty, setDifficulty] = useState('medium');
  const [status, setStatus] = useState('solved');
  const [url, setUrl] = useState('');
  const [solutionNotes, setSolutionNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const q = selectedPlatform === 'All' ? '' : `?platform=${selectedPlatform}`;
      const res = await fetch(`/api/coding-tracker${q}`);
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
        setProblems(data.problems);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to fetch coding tracker:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProblem = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch('/api/coding-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          platform,
          category,
          difficulty,
          status,
          url,
          solution_notes: solutionNotes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        showToast(`Problem "${title}" logged to coding tracker!`, 'success');
        setTitle('');
        setUrl('');
        setSolutionNotes('');
        fetchData();
      }
    } catch (err) {
      console.error('Error logging problem:', err);
      showToast('Failed to log problem', 'error');
    }
  };

  const handleDeleteProblem = async (id, problemTitle) => {
    if (!window.confirm(`Delete problem record "${problemTitle || 'selected'}"?`)) return;
    try {
      const res = await fetch(`/api/coding-tracker/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Problem record deleted', 'info');
        fetchData();
      }
    } catch (e) {
      console.error('Error deleting problem:', e);
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="loadingSpinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Loading Coding & Kaggle Hub...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            <IconCoding size={13} />
            ALGORITHMIC PRACTICE & COMPETITIONS
          </div>
          <h1 className={styles.title} style={{ letterSpacing: '-0.03em', fontSize: '24px', fontWeight: 700 }}>
            Coding Tracker & Competitive ML Practice
          </h1>
          <p className={styles.subtitle} style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Track algorithm practice, LeetCode data structures, and Kaggle competition benchmarks.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ fontSize: '12.5px', padding: '8px 16px' }}
        >
          + Log Solved Problem
        </button>
      </div>

      {/* Profiles Showcase */}
      <div className={styles.profilesGrid}>
        {profiles.map((p) => (
          <div key={p.id} className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.platformTitle} style={{ fontSize: '14px', fontWeight: 600 }}>
                {p.platform}
              </div>
              {p.streak_days > 0 && (
                <span className={styles.streakBadge} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  • {p.streak_days} Day Streak
                </span>
              )}
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Handle: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>@{p.handle}</strong>
            </div>

            <div className={styles.profileStats}>
              <div>
                <div className={styles.pStatVal} style={{ fontFamily: 'var(--font-mono)' }}>{p.solved_count}</div>
                <div className={styles.pStatLabel}>Items / Solved</div>
              </div>
              <div>
                <div className={styles.pStatVal} style={{ fontSize: '13px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {p.tier}
                </div>
                <div className={styles.pStatLabel}>{p.rank_info}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Breakdown Row */}
      <div className={styles.diffRow}>
        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Easy Problems</div>
            <div className={styles.diffEasyVal} style={{ fontFamily: 'var(--font-mono)' }}>{stats?.easy_solved || 0}</div>
          </div>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
        </div>

        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medium Problems</div>
            <div className={styles.diffMedVal} style={{ fontFamily: 'var(--font-mono)' }}>{stats?.medium_solved || 0}</div>
          </div>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
        </div>

        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hard Problems</div>
            <div className={styles.diffHardVal} style={{ fontFamily: 'var(--font-mono)' }}>{stats?.hard_solved || 0}</div>
          </div>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />
        </div>

        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Solved</div>
            <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{stats?.total_solved || 0}</div>
          </div>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              className={`${styles.fTab} ${selectedPlatform === plat ? styles.active : ''}`}
              onClick={() => setSelectedPlatform(plat)}
              style={{ fontSize: '12px' }}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className={styles.tableCard}>
        <table className={styles.probTable}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Problem Name</th>
              <th>Platform</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No solved problems logged yet for this filter.
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className={styles.solvedIcon}>✓ Solved</span>
                  </td>
                  <td>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className={styles.probLink}>
                        {p.title} ↗
                      </a>
                    ) : (
                      <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{p.title}</strong>
                    )}
                    {p.solution_notes && <div className={styles.notesText}>{p.solution_notes}</div>}
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{p.platform}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{p.category}</td>
                  <td>
                    <span
                      className={`${styles.diffTag} ${
                        p.difficulty === 'easy' ? styles.tagEasy : p.difficulty === 'hard' ? styles.tagHard : styles.tagMedium
                      }`}
                      style={{ textTransform: 'capitalize', fontSize: '10.5px' }}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.delBtn}
                      onClick={() => handleDeleteProblem(p.id, p.title)}
                      title="Delete record"
                      style={{ fontSize: '11px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>Log Solved Problem</div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddProblem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input
                    className="input"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Backpropagation from Scratch, Two Sum, Attention Softmax"
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Platform</label>
                    <select className="select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="LeetCode">LeetCode</option>
                      <option value="Kaggle">Kaggle</option>
                      <option value="StrataScratch">StrataScratch</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="CodeSignal">CodeSignal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Dynamic Programming, Loss Functions, SQL Windows"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Problem URL</label>
                  <input
                    className="input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://leetcode.com/problems/..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Algorithmic Insight / Complexity</label>
                  <textarea
                    className="input"
                    style={{ minHeight: '60px', fontFamily: 'inherit' }}
                    value={solutionNotes}
                    onChange={(e) => setSolutionNotes(e.target.value)}
                    placeholder="O(N log K) using min-heap. Edge cases around empty tensors."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Problem Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
