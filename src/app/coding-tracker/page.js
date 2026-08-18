'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

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
          solution_notes: solutionNotes
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setUrl('');
        setSolutionNotes('');
        fetchData();
      }
    } catch (err) {
      console.error('Error logging problem:', err);
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Delete this problem record?')) return;
    try {
      const res = await fetch(`/api/coding-tracker/${id}`, { method: 'DELETE' });
      if (res.ok) {
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
        <p>Loading Coding & Kaggle Hub...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⚔️ Coding Practice & Kaggle Arena</h1>
          <p className={styles.subtitle}>
            Track competitive machine learning competitions, Kaggle notebooks, LeetCode algorithms, and SQL practice.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Log Solved Problem
        </button>
      </div>

      {/* Profiles Showcase */}
      <div className={styles.profilesGrid}>
        {profiles.map((p) => (
          <div key={p.id} className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.platformTitle}>
                <span>{p.platform === 'Kaggle' ? '🏅' : p.platform === 'LeetCode' ? '💻' : '📊'}</span>
                {p.platform}
              </div>
              {p.streak_days > 0 && (
                <span className={styles.streakBadge}>
                  🔥 {p.streak_days} Day Streak
                </span>
              )}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Handle: <strong style={{ color: 'var(--text-primary)' }}>@{p.handle}</strong>
            </div>

            <div className={styles.profileStats}>
              <div>
                <div className={styles.pStatVal}>{p.solved_count}</div>
                <div className={styles.pStatLabel}>Items / Solved</div>
              </div>
              <div>
                <div className={styles.pStatVal} style={{ fontSize: '14px', marginTop: '4px' }}>
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
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Easy Problems</div>
            <div className={styles.diffEasyVal}>{stats?.easy_solved || 0}</div>
          </div>
          <span style={{ fontSize: '20px' }}>🟢</span>
        </div>

        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medium Problems</div>
            <div className={styles.diffMedVal}>{stats?.medium_solved || 0}</div>
          </div>
          <span style={{ fontSize: '20px' }}>🟡</span>
        </div>

        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hard / Advanced</div>
            <div className={styles.diffHardVal}>{stats?.hard_solved || 0}</div>
          </div>
          <span style={{ fontSize: '20px' }}>🔴</span>
        </div>

        <div className={styles.diffPill}>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Solved</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)' }}>{stats?.total_solved || 0}</div>
          </div>
          <span style={{ fontSize: '20px' }}>⚡</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {PLATFORMS.map((plat) => (
          <button
            key={plat}
            className={`tab ${selectedPlatform === plat ? 'active' : ''}`}
            onClick={() => setSelectedPlatform(plat)}
          >
            {plat}
          </button>
        ))}
      </div>

      {/* Problem Log Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.problemTable}>
          <thead>
            <tr>
              <th>Problem / Challenge</th>
              <th>Platform</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No problems found for this platform.
                </td>
              </tr>
            ) : (
              problems.map((prob) => (
                <tr key={prob.id}>
                  <td>
                    <div className={styles.problemTitle}>
                      {prob.url ? (
                        <a href={prob.url} target="_blank" rel="noopener noreferrer">
                          {prob.title} ↗
                        </a>
                      ) : (
                        prob.title
                      )}
                    </div>
                    {prob.solution_notes && (
                      <div className={styles.notesSnippet}>
                        💡 {prob.solution_notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="tag">{prob.platform}</span>
                  </td>
                  <td>{prob.category}</td>
                  <td>
                    <span className={`badge badge-${prob.difficulty === 'easy' ? 'low' : prob.difficulty === 'medium' ? 'medium' : 'high'}`}>
                      {prob.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${prob.status === 'solved' ? 'badge-completed' : 'badge-in-progress'}`}>
                      {prob.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.actionBtn} onClick={() => handleDeleteProblem(prob.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Problem Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Log Solved Problem / Challenge</div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddProblem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Problem / Challenge Title *</label>
                  <input 
                    className="input" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Implement Transformer Attention from Scratch"
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
                      <option value="Codeforces">Codeforces</option>
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
                  <label className="form-label">Category / Domain</label>
                  <input 
                    className="input" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    placeholder="e.g. Machine Learning Math, SQL, NLP"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem URL</label>
                  <input 
                    className="input" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Takeaway / Solution Notes</label>
                  <textarea 
                    className="textarea" 
                    rows={2} 
                    value={solutionNotes} 
                    onChange={(e) => setSolutionNotes(e.target.value)} 
                    placeholder="Core algorithm insight, time complexity, or trick..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
