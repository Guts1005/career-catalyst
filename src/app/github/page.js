'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
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

export default function GithubAnalyzer() {
  const [username, setUsername] = useState('Guts1005');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
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
      if (!res.ok) throw new Error(data.error || 'Failed to analyze GitHub profile');

      setCurrentAnalysis(data);
      fetchHistory();
      showToast(`GitHub profile @${username} synchronized!`, 'success');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
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
                opacity: selectedLanguage && selectedLanguage !== lang ? 0.3 : 1.0,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
              title={`${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}% (Click to filter)`}
            />
          ))}
        </div>
        <div className={styles.languageLegend}>
          {sortedLangs.map(([lang, bytes]) => (
            <button
              key={lang}
              type="button"
              className={styles.legendItem}
              onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
              style={{
                background: selectedLanguage === lang ? 'var(--off-white)' : 'transparent',
                border: selectedLanguage === lang ? '1px solid var(--black)' : '1px solid transparent',
                padding: '3px 6px',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <span
                className={styles.legendColor}
                style={{ backgroundColor: languageColors[lang] || '#cccccc' }}
              />
              <span className={styles.legendLabel}>{lang}</span>
              <span className={styles.legendValue} style={{ fontFamily: 'var(--font-mono)' }}>
                {((bytes / totalBytes) * 100).toFixed(1)}%
              </span>
            </button>
          ))}
          {selectedLanguage && (
            <button
              type="button"
              onClick={() => setSelectedLanguage(null)}
              style={{ background: 'none', border: 'none', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', cursor: 'pointer' }}
            >
              [CLEAR FILTER]
            </button>
          )}
        </div>
      </div>
    );
  };

  const reposToDisplay = currentAnalysis?.top_repos?.filter((r) => {
    if (!selectedLanguage) return true;
    return r.language === selectedLanguage;
  }) || [];

  return (
    <div className={styles.container}>
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
          {loading ? 'Synchronizing Repositories...' : 'SYNC GITHUB PROFILE →'}
        </button>
      </form>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {currentAnalysis && (
        <div className={styles.resultsGrid}>
          {/* Profile Overview Card */}
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              {currentAnalysis.avatar_url && (
                <img
                  src={currentAnalysis.avatar_url}
                  alt={currentAnalysis.username}
                  className={styles.avatar}
                />
              )}
              <div className={styles.profileInfo}>
                <h2>{currentAnalysis.name || currentAnalysis.username}</h2>
                <p className={styles.bio}>{currentAnalysis.bio || 'Machine Learning Engineer & Open Source Contributor'}</p>
                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Public Repos</span>
                    <span className={styles.statValue}>{currentAnalysis.public_repos}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Stars</span>
                    <span className={styles.statValue}>{currentAnalysis.total_stars}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Followers</span>
                    <span className={styles.statValue}>{currentAnalysis.followers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          {currentAnalysis.languages && (
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>
                Programming Language Distribution {selectedLanguage && `(Filtered: ${selectedLanguage})`}
              </h3>
              {renderLanguageBar(currentAnalysis.languages)}
            </div>
          )}

          {/* Top Repositories */}
          {reposToDisplay.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>
                Repositories ({reposToDisplay.length})
              </h3>
              <div className={styles.repoList}>
                {reposToDisplay.map((repo) => (
                  <div key={repo.id} className={styles.repoItem}>
                    <div className={styles.repoDetails}>
                      <div className={styles.repoNameRow}>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.repoLink}
                        >
                          {repo.name}
                        </a>
                        {repo.language && (
                          <span
                            className={styles.languageTag}
                            style={{
                              backgroundColor: `${languageColors[repo.language] || '#cccccc'}20`,
                              color: languageColors[repo.language] || '#666',
                              borderColor: languageColors[repo.language] || '#cccccc',
                            }}
                          >
                            {repo.language}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className={styles.repoDescription}>{repo.description}</p>
                      )}
                      <div className={styles.repoStats}>
                        <span>⭐ {repo.stargazers_count || 0}</span>
                        <span>🍴 {repo.forks_count || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleImportRepo(repo)}
                      disabled={importingId === repo.id || importedRepos[repo.id]}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                    >
                      {importedRepos[repo.id] ? '✓ Synced' : importingId === repo.id ? 'Syncing...' : '+ Import to Portfolio'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
