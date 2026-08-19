'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import {
  IconGitHub,
  IconCheck,
  IconArrowUpRight,
} from '@/components/Icons';

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

export default function GithubAnalyzer() {
  const [username, setUsername] = useState('Guts1005');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze GitHub profile');
      }

      await loadAnalysis(data.id);
      showToast(`GitHub profile @${username.trim()} synced!`, 'success');
      fetchHistory();
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'GitHub sync failed', 'error');
    } finally {
      setLoading(false);
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

  const renderLanguageBar = (stats) => {
    const totalBytes = Object.values(stats || {}).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) return null;

    const sortedLangs = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    return (
      <div className={styles.languageContainer}>
        <div className={styles.languageBar}>
          {sortedLangs.map(([lang, bytes]) => (
            <div
              key={lang}
              className={styles.languageSegment}
              style={{
                width: `${(bytes / totalBytes) * 100}%`,
                backgroundColor: languageColors[lang] || '#cccccc',
              }}
              title={`${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`}
            />
          ))}
        </div>
        <div className={styles.languageLegend}>
          {sortedLangs.map(([lang, bytes]) => (
            <div key={lang} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: languageColors[lang] || '#cccccc' }}
              />
              <span className={styles.legendLabel}>{lang}</span>
              <span className={styles.legendValue} style={{ fontFamily: 'var(--font-mono)' }}>
                {((bytes / totalBytes) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <PageHeader
        chapter="TECHNICAL CORE / 11"
        title={<>GITHUB<br />CODE SYNC.</>}
        subtitle="Analyze public repositories, evaluate programming language distributions, and import top projects into your verified portfolio."
      />

      <form onSubmit={handleAnalyze} className={styles.searchForm}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username (e.g. Guts1005)"
          className={styles.input}
          disabled={loading}
          style={{ fontSize: '13px' }}
        />
        <button type="submit" className={styles.analyzeButton} disabled={loading || !username.trim()} style={{ fontSize: '12.5px', padding: '8px 18px' }}>
          {loading ? 'Analyzing Repositories...' : 'Sync GitHub Profile'}
        </button>
      </form>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          {currentAnalysis ? (
            <div className={styles.dashboard}>
              <div className={styles.profileCard}>
                <img
                  src={currentAnalysis.profile_data?.avatar_url}
                  alt={currentAnalysis.profile_data?.login}
                  className={styles.avatar}
                />
                <div className={styles.profileInfo}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{currentAnalysis.profile_data?.name || currentAnalysis.profile_data?.login}</h2>
                  <a
                    href={currentAnalysis.profile_data?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.usernameLink}
                    style={{ fontSize: '12.5px', color: 'var(--accent)' }}
                  >
                    @{currentAnalysis.profile_data?.login} ↗
                  </a>
                  <p className={styles.bio} style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {currentAnalysis.profile_data?.bio || 'Machine Learning & Deep Learning Engineer.'}
                  </p>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue} style={{ fontFamily: 'var(--font-mono)' }}>{currentAnalysis.profile_data?.followers || 0}</span>
                      <span className={styles.statLabel}>Followers</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue} style={{ fontFamily: 'var(--font-mono)' }}>{currentAnalysis.profile_data?.following || 0}</span>
                      <span className={styles.statLabel}>Following</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue} style={{ fontFamily: 'var(--font-mono)' }}>{currentAnalysis.profile_data?.public_repos || 0}</span>
                      <span className={styles.statLabel}>Public Repos</span>
                    </div>
                  </div>
                </div>

                <div className={styles.scoreContainer}>
                  <div className={styles.scoreValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 800 }}>
                    {currentAnalysis.contribution_stats?.score || 88}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                  <div className={styles.scoreLabel}>Portfolio Completeness</div>
                </div>
              </div>

              {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                <div className={styles.recommendationsCard}>
                  <h3 style={{ fontSize: '13.5px', marginBottom: '10px' }}>Resume & Portfolio Optimizations</h3>
                  <ul className={styles.recommendationList}>
                    {currentAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className={styles.recommendationItem} style={{ fontSize: '12.5px' }}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.languagesCard}>
                <h3 style={{ fontSize: '13.5px', marginBottom: '10px' }}>Codebase Language Distribution</h3>
                {renderLanguageBar(currentAnalysis.language_stats)}
              </div>

              <div className={styles.reposSection}>
                <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Featured Repositories</h3>
                <div className={styles.repoGrid}>
                  {currentAnalysis.repo_data?.slice(0, 4).map((repo) => {
                    const isImported = importedRepos[repo.id];
                    const isImporting = importingId === repo.id;

                    return (
                      <div key={repo.id} className={styles.repoCard}>
                        <div className={styles.repoHeader}>
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className={styles.repoName} style={{ fontSize: '13.5px', fontWeight: 600 }}>
                            {repo.name} ↗
                          </a>
                          <span className={styles.visibilityBadge} style={{ fontSize: '10px' }}>Public</span>
                        </div>
                        <p className={styles.repoDescription} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {repo.description || 'Production machine learning and data engineering repository.'}
                        </p>

                        <div className={styles.repoMeta}>
                          {repo.language && (
                            <div className={styles.repoLang} style={{ fontSize: '11.5px' }}>
                              <span
                                className={styles.langColor}
                                style={{ backgroundColor: languageColors[repo.language] || '#cccccc' }}
                              />
                              {repo.language}
                            </div>
                          )}
                          <div className={styles.repoStat} style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                            ★ {repo.stargazers_count || 0}
                          </div>
                        </div>

                        <button
                          onClick={() => handleImportRepo(repo)}
                          disabled={isImported || isImporting}
                          className={`${styles.importButton} ${isImported ? styles.imported : ''}`}
                          style={{ fontSize: '11.5px', padding: '5px 10px', marginTop: '10px', width: '100%' }}
                        >
                          {isImported ? '✓ Synced to Portfolio' : isImporting ? 'Syncing...' : '+ 1-Click Sync to Projects'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState} style={{ padding: '40px 20px', textAlign: 'center' }}>
              <IconGitHub size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>No GitHub Data Synced Yet</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter your GitHub handle above and click "Sync GitHub Profile" to evaluate repository metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
