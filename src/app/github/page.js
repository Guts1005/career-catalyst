'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { IconGitHub, IconCheck, IconArrowUpRight } from '@/components/Icons';

const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  TypeScript: '#3178c6',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'Jupyter Notebook': '#DA5B0B',
  R: '#198CE7',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#F05138',
  Shell: '#89e051',
};

const DEFAULT_GITHUB_ANALYSIS = {
  profile: {
    login: 'Guts1005',
    name: 'Sharvin Patel',
    avatar_url: 'https://avatars.githubusercontent.com/u/10000000?v=4',
    html_url: 'https://github.com/Guts1005',
    bio: 'Machine Learning Systems Engineer | PyTorch, Triton GPU Kernels, Distributed Model Serving',
    public_repos: 12,
    followers: 84,
    following: 32,
  },
  stats: {
    total_stars: 48,
    total_forks: 14,
    primary_language: 'Python',
    language_breakdown: {
      Python: 65,
      'C++': 20,
      JavaScript: 10,
      Rust: 5,
    },
  },
  repos: [
    {
      id: 101,
      name: 'career-catalyst',
      description: 'Production Career Operating System for ML & Systems Engineers built with Next.js 16, Supabase, and GPU Telemetry.',
      html_url: 'https://github.com/Guts1005/career-catalyst',
      language: 'JavaScript',
      stargazers_count: 34,
      forks_count: 8,
      updated_at: '2026-08-20',
    },
    {
      id: 102,
      name: 'triton-flash-attention-tuner',
      description: 'Custom OpenAI Triton kernel suite benchmarking Online Softmax vs Eager PyTorch Attention across 8x H100 GPUs.',
      html_url: 'https://github.com/Guts1005/triton-flash-attention-tuner',
      language: 'Python',
      stargazers_count: 12,
      forks_count: 4,
      updated_at: '2026-08-18',
    },
    {
      id: 103,
      name: 'distributed-moe-nccl',
      description: 'High-performance Mixture of Experts (MoE) parameter sharding and All-to-All NCCL communication kernels.',
      html_url: 'https://github.com/Guts1005/distributed-moe-nccl',
      language: 'C++',
      stargazers_count: 9,
      forks_count: 2,
      updated_at: '2026-08-10',
    },
  ],
};

export default function GithubAnalyzer() {
  const { refreshCareerState } = useCareer();
  const [username, setUsername] = useState('Guts1005');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(DEFAULT_GITHUB_ANALYSIS);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [importedRepos, setImportedRepos] = useState({});
  const [importingId, setImportingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/github');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0 && !currentAnalysis) {
          loadAnalysis(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAnalysis = async (id) => {
    try {
      const res = await fetch(`/api/github/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportRepo = async (repo) => {
    setImportingId(repo.id);
    try {
      const res = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
        }),
      });

      if (res.ok) {
        setImportedRepos((prev) => ({ ...prev, [repo.id]: true }));
        showToast(`Repository "${repo.name}" synced to portfolio!`, 'success');
        refreshCareerState();
      }
    } catch (err) {
      console.error('Failed to import repo:', err);
      showToast('Failed to sync repository', 'error');
    } finally {
      setImportingId(null);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze GitHub profile');

      setCurrentAnalysis(data);
      fetchHistory();
      showToast(`GitHub profile @${username} analyzed successfully!`, 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = currentAnalysis?.repos
    ? selectedLanguage
      ? currentAnalysis.repos.filter((r) => r.language === selectedLanguage)
      : currentAnalysis.repos
    : [];

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO & PROOF / 09"
        title={<>GITHUB SYNC &<br />CODEBASE EVIDENCE.</>}
        subtitle="Analyze public repositories, evaluate language distributions, and import verified codebase artifacts into your career graph."
      />

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className={styles.inputCard}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              @
            </span>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. Guts1005)"
              style={{ paddingLeft: '32px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: '44px', padding: '0 24px' }}>
            {loading ? 'ANALYZING REPOSITORIES...' : 'SYNC CODEBASE PROOF →'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ padding: '14px', background: 'var(--red-subtle)', border: '1px solid var(--red-border)', borderRadius: '6px', color: 'var(--red)', fontSize: '13px', marginTop: '16px' }}>
          {error}
        </div>
      )}

      {/* Profile Overview Card */}
      {currentAnalysis && (
        <div className={styles.analysisGrid}>
          {/* User Profile Card */}
          <div className={styles.profileCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {currentAnalysis.profile.avatar_url && (
                <img
                  src={currentAnalysis.profile.avatar_url}
                  alt={currentAnalysis.profile.login}
                  className={styles.avatar}
                />
              )}
              <div>
                <h3 className={styles.profileName}>{currentAnalysis.profile.name || currentAnalysis.profile.login}</h3>
                <a
                  href={currentAnalysis.profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.profileLogin}
                >
                  @{currentAnalysis.profile.login} ↗
                </a>
              </div>
            </div>

            {currentAnalysis.profile.bio && <p className={styles.bio}>{currentAnalysis.profile.bio}</p>}

            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{currentAnalysis.profile.public_repos}</div>
                <div className={styles.statLbl}>Repositories</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{currentAnalysis.profile.followers}</div>
                <div className={styles.statLbl}>Followers</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{currentAnalysis.profile.total_stars || 0}</div>
                <div className={styles.statLbl}>Total Stars</div>
              </div>
            </div>

            {/* Language Distribution */}
            {currentAnalysis.languages && currentAnalysis.languages.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div className={styles.subHeading}>Language Distribution</div>
                <div className={styles.langBar}>
                  {currentAnalysis.languages.map((l) => (
                    <div
                      key={l.language}
                      style={{
                        width: `${l.percentage}%`,
                        background: languageColors[l.language] || '#999',
                        height: '100%',
                      }}
                      title={`${l.language}: ${l.percentage}%`}
                    />
                  ))}
                </div>

                <div className={styles.langPills}>
                  <button
                    type="button"
                    className={`${styles.langPill} ${!selectedLanguage ? styles.active : ''}`}
                    onClick={() => setSelectedLanguage(null)}
                  >
                    All ({currentAnalysis.repos?.length || 0})
                  </button>
                  {currentAnalysis.languages.map((l) => (
                    <button
                      key={l.language}
                      type="button"
                      className={`${styles.langPill} ${selectedLanguage === l.language ? styles.active : ''}`}
                      onClick={() => setSelectedLanguage(selectedLanguage === l.language ? null : l.language)}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: languageColors[l.language] || '#999',
                          marginRight: '6px',
                        }}
                      />
                      {l.language} ({l.percentage}%)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Repositories List */}
          <div className={styles.reposSection}>
            <div className={styles.reposHeader}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                Public Repositories ({filteredRepos.length})
              </h3>
            </div>

            <div className={styles.repoGrid}>
              {filteredRepos.map((repo) => (
                <div key={repo.id} className={styles.repoCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.repoName}
                    >
                      {repo.name} ↗
                    </a>
                    {repo.stargazers_count > 0 && (
                      <span className={styles.starBadge}>
                        ★ {repo.stargazers_count}
                      </span>
                    )}
                  </div>

                  <p className={styles.repoDesc}>{repo.description || 'No description provided.'}</p>

                  <div className={styles.repoFooter}>
                    {repo.language && (
                      <span className={styles.repoLang}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: languageColors[repo.language] || '#999',
                            marginRight: '6px',
                          }}
                        />
                        {repo.language}
                      </span>
                    )}

                    <button
                      type="button"
                      className={`btn btn-sm ${importedRepos[repo.id] ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleImportRepo(repo)}
                      disabled={importingId === repo.id || importedRepos[repo.id]}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {importedRepos[repo.id] ? '✓ SYNCED' : importingId === repo.id ? 'SYNCING...' : '+ SYNC TO PORTFOLIO'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
