'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconCoding, IconCheck, IconArrowUpRight } from '@/components/Icons';

const PLATFORMS = ['All', 'LeetCode', 'Kaggle', 'StrataScratch', 'HackerRank'];

export default function CodingTrackerPage() {
  const [profiles, setProfiles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

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

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !isModalOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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

  const filteredProblems = problems.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.platform?.toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 10"
        title={<>CODING<br />LEDGER.</>}
        subtitle="A developer activity journal tracking competitive coding, algorithmic mastery, and platform progress."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            + LOG SOLVED PROBLEM
          </button>
        }
      />

      {/* Profiles Showcase */}
      <div className={styles.profilesGrid}>
        {profiles.map((p) => (
          <div key={p.id} className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.platformTitle} style={{ fontSize: '14px', fontWeight: 700 }}>
                {p.platform}
              </div>
              {p.streak_days > 0 && (
                <span className={styles.streakBadge} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  ● {p.streak_days} Day Streak
                </span>
              )}
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--gray-600)' }}>
              Handle: <strong style={{ color: 'var(--black)', fontFamily: 'var(--font-mono)' }}>@{p.handle}</strong>
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

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px 0', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn ${selectedPlatform === p ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setSelectedPlatform(p)}
              style={{ textTransform: 'uppercase' }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', maxWidth: '280px', width: '100%' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems... (/)"
            style={{ fontSize: '12px', paddingRight: '28px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '7px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)' }}>
            /
          </span>
        </div>
      </div>

      {/* Problems Ledger Table */}
      <div className={styles.tableCard}>
        <table className={styles.problemTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Problem Title</th>
              <th>Platform</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>
                  No coding problems logged in this category.
                </td>
              </tr>
            ) : (
              filteredProblems.map((prob, i) => {
                const isExpanded = expandedId === prob.id;
                return (
                  <tr key={prob.id} onClick={() => setExpandedId(isExpanded ? null : prob.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-400)' }}>
                      0{i + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--black)' }}>{prob.title}</div>
                      {isExpanded && prob.solution_notes && (
                        <div style={{ marginTop: '8px', padding: '8px', background: 'var(--off-white)', borderRadius: '4px', fontSize: '12px', color: 'var(--gray-600)', border: '1px solid var(--gray-100)' }}>
                          <strong>Solution Takeaway:</strong> {prob.solution_notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={styles.platformBadge}>{prob.platform}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{prob.category}</span>
                    </td>
                    <td>
                      <span className={`${styles.diffBadge} ${styles[prob.difficulty]}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className={styles.solvedBadge}>✓ SOLVED</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteProblem(prob.id, prob.title)}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Solved Problem</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddProblem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 146. LRU Cache / Gradient Descent Optimizer"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Platform</label>
                    <select className="input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="LeetCode">LeetCode</option>
                      <option value="Kaggle">Kaggle</option>
                      <option value="StrataScratch">StrataScratch</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category / Domain</label>
                  <input
                    type="text"
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Transformers / Graph BFS / Two-Pointers"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Algorithm Notes & Invariants</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={solutionNotes}
                    onChange={(e) => setSolutionNotes(e.target.value)}
                    placeholder="O(1) dictionary + doubly linked list invariant..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
