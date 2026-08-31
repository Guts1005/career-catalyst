'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconCoding, IconCheck, IconArrowUpRight } from '@/components/Icons';
import { useCareer } from '@/context/CareerContext';

const PLATFORMS = ['All', 'LeetCode', 'Kaggle', 'HackerRank', 'Custom'];

const BENCHMARK_PROBLEMS = [
  {
    id: 1,
    title: 'FlashAttention Online Softmax Block Tiling',
    platform: 'Custom',
    category: 'GPU & Systems',
    difficulty: 'hard',
    status: 'solved',
    solution_notes: 'Computed online softmax rescaling factors m_new = max(m_prev, row_max) and l_new = l_prev * exp(m_prev - m_new) + exp(row_max - m_new) in CUDA shared memory to avoid writing intermediate N x N attention matrix to HBM. Source: Tri Dao (arXiv:2307.08691).',
  },
  {
    id: 2,
    title: 'Ring AllReduce for Distributed Model Parallelism',
    platform: 'Custom',
    category: 'Distributed Systems',
    difficulty: 'hard',
    status: 'solved',
    solution_notes: 'Implemented 2*(P-1) step ring communication split into Scatter-Reduce followed by AllGather phases, achieving optimal 2*(P-1)/P * S transfer bandwidth without master-worker network bottlenecks. Source: Baidu Silicon Valley AI Lab / NCCL.',
  },
  {
    id: 3,
    title: 'Approximate Nearest Neighbors (ANN) with Inverted Multi-Index',
    platform: 'Kaggle',
    category: 'Vector Search',
    difficulty: 'medium',
    status: 'solved',
    solution_notes: 'Product quantization (PQ) with Voronoi cell partitioning for sub-millisecond retrieval across 10M dense embedding vectors. Source: Babenko & Lempitsky (IEEE TPAMI).',
  },
  {
    id: 4,
    title: 'LRU Cache with Doubly Linked List & Hash Map',
    platform: 'LeetCode',
    category: 'Data Structures',
    difficulty: 'medium',
    status: 'solved',
    solution_notes: 'O(1) amortized get/put using doubly linked list node pointer map for eviction policies in model weights caching. LeetCode #146.',
  },
];

export default function CodingTrackerPage() {
  const { syncSolvedProblem } = useCareer();
  const [profiles, setProfiles] = useState([]);
  const [problems, setProblems] = useState(BENCHMARK_PROBLEMS);
  const [stats, setStats] = useState({ total_logged: 4, total_solved: 4, easy_solved: 0, medium_solved: 2, hard_solved: 2 });
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  // Live LeetCode Sync State
  const [lcUsername, setLcUsername] = useState('Guts1005');
  const [syncingLc, setSyncingLc] = useState(false);
  const [liveLcProfile, setLiveLcProfile] = useState(null);

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
      const res = await fetch('/api/coding-tracker');
      const data = await res.json();
      if (data.problems && data.problems.length > 0) {
        setProfiles(data.profiles || []);
        setProblems(data.problems);
        setStats(data.stats);
      } else {
        setProblems(BENCHMARK_PROBLEMS);
        setStats({ total: 4, easy: 0, medium: 2, hard: 2, platforms: { LeetCode: 1, Kaggle: 1, Custom: 2 } });
      }
    } catch (e) {
      console.error('Failed to fetch coding tracker:', e);
      setProblems(BENCHMARK_PROBLEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live LeetCode Sync Handler
  const handleSyncLeetCode = async (e) => {
    e.preventDefault();
    if (!lcUsername.trim()) return;
    setSyncingLc(true);
    try {
      const res = await fetch('/api/coding-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_leetcode',
          username: lcUsername.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLiveLcProfile(data);
        showToast(`Synced real live stats for LeetCode user @${data.username}!`, 'success');
      } else {
        showToast(data.error || 'Failed to sync LeetCode profile', 'error');
      }
    } catch (err) {
      console.error('LeetCode sync error:', err);
      showToast('Error querying live LeetCode API', 'error');
    } finally {
      setSyncingLc(false);
    }
  };

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
        const savedProblem = await res.json().catch(() => ({ id: Date.now(), title, category, status }));
        if (status === 'solved') {
          syncSolvedProblem(savedProblem);
        }
        setIsModalOpen(false);
        showToast(`Problem "${title}" logged to coding ledger!`, 'success');
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
    } catch (err) {
      console.error('Error deleting problem:', err);
    }
  };

  const filteredProblems = problems.filter((p) => {
    if (selectedPlatform !== 'All' && p.platform !== selectedPlatform) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.solution_notes?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 08"
        title={<>ALGORITHMIC &<br />CODING LEDGER.</>}
        subtitle="Track algorithmic practice, real live LeetCode profiles, and verified GPU systems invariants."
        actions={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + LOG PROBLEM
          </button>
        }
      />

      {/* Real Live LeetCode Sync Bar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSyncLeetCode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ⚡ LIVE LEETCODE SYNC:
            </span>
            <input
              type="text"
              className="input"
              value={lcUsername}
              onChange={(e) => setLcUsername(e.target.value)}
              placeholder="Enter real LeetCode handle (e.g. Guts1005)"
              style={{ maxWidth: '240px', fontSize: '12.5px' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={syncingLc} style={{ fontSize: '11.5px', padding: '6px 16px' }}>
            {syncingLc ? 'FETCHING LIVE STATS...' : '🔄 SYNC LIVE PROFILE →'}
          </button>
        </form>

        {liveLcProfile && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LEETCODE HANDLE</div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>@{liveLcProfile.username}</strong>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TOTAL SOLVED</div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{liveLcProfile.total_solved} Problems</strong>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>EASY / MED / HARD</div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{liveLcProfile.easy_solved} / {liveLcProfile.medium_solved} / {liveLcProfile.hard_solved}</strong>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>GLOBAL RANKING</div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>#{liveLcProfile.ranking}</strong>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>
            {liveLcProfile ? liveLcProfile.total_solved : problems.length}
          </div>
          <div className={styles.kpiLabel}>Total Problems Solved</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: 'var(--green)' }}>
            {liveLcProfile ? liveLcProfile.easy_solved : problems.filter((p) => p.difficulty === 'easy').length}
          </div>
          <div className={styles.kpiLabel}>Easy Tier</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: 'var(--amber)' }}>
            {liveLcProfile ? liveLcProfile.medium_solved : problems.filter((p) => p.difficulty === 'medium').length}
          </div>
          <div className={styles.kpiLabel}>Medium Tier</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: 'var(--red)' }}>
            {liveLcProfile ? liveLcProfile.hard_solved : problems.filter((p) => p.difficulty === 'hard').length}
          </div>
          <div className={styles.kpiLabel}>Hard & Systems Tier</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.controlsRow}>
        <div className={styles.platformPills}>
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              type="button"
              className={`${styles.pill} ${selectedPlatform === plat ? styles.active : ''}`}
              onClick={() => setSelectedPlatform(plat)}
            >
              {plat}
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
            placeholder="Search problems, takeaways... (/)"
            style={{ fontSize: '12.5px', paddingRight: '30px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px', padding: '1px 5px' }}>
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
              <th>Problem Title & Takeaway</th>
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No coding problems found matching criteria.
                </td>
              </tr>
            ) : (
              filteredProblems.map((prob, i) => {
                const isExpanded = expandedId === prob.id;
                return (
                  <tr key={prob.id} onClick={() => setExpandedId(isExpanded ? null : prob.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      0{i + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prob.title}</div>
                      {isExpanded && prob.solution_notes && (
                        <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg-subtle)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)', border: '1px solid var(--border)', lineHeight: 1.5 }}>
                          <strong>Core Invariant / Takeaway:</strong> {prob.solution_notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={styles.platformBadge}>{prob.platform}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{prob.category}</span>
                    </td>
                    <td>
                      <span className={`${styles.diffBadge} ${styles[prob.difficulty]}`}>
                        {prob.difficulty?.toUpperCase()}
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

      {/* Add Problem Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Solved Algorithmic Problem</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddProblem}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ring AllReduce Implementation"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Platform</label>
                    <select className="select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="LeetCode">LeetCode</option>
                      <option value="Kaggle">Kaggle</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="Custom">Custom Systems Code</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard / Systems</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Distributed Systems, Dynamic Programming"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Algorithmic Takeaways / Invariants</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={solutionNotes}
                    onChange={(e) => setSolutionNotes(e.target.value)}
                    placeholder="What was the time/space complexity? What was the edge case or GPU invariant?"
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
