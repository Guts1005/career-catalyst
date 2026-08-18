'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

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
  const [username, setUsername] = useState('');
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
          stargazers_count: repo.stargazers_count
        })
      });

      if (res.ok) {
        setImportedRepos(prev => ({ ...prev, [repo.id]: true }));
      }
    } catch (err) {
      console.error('Failed to import repo:', err);
    } finally {
      setImportingId(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze GitHub profile');
      }

      await loadAnalysis(data.id);
      fetchHistory();
      setUsername('');
    } catch (err) {
      setError(err.message);
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
    const totalBytes = Object.values(stats).reduce((a, b) => a + b, 0);
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
                backgroundColor: languageColors[lang] || '#cccccc'
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
              <span className={styles.legendValue}>{((bytes / totalBytes) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>GitHub Profile Analyzer</h1>
          <p className={styles.subtitle}>Analyze your GitHub profile and get recommendations to improve your resume-readiness.</p>
        </div>
      </header>

      <form onSubmit={handleAnalyze} className={styles.searchForm}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username (e.g. torvalds)"
          className={styles.input}
          disabled={loading}
        />
        <button type="submit" className={styles.analyzeButton} disabled={loading || !username.trim()}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          {currentAnalysis ? (
            <div className={styles.dashboard}>
              
              <div className={styles.profileCard}>
                <img 
                  src={currentAnalysis.profile_data.avatar_url} 
                  alt={currentAnalysis.profile_data.login} 
                  className={styles.avatar} 
                />
                <div className={styles.profileInfo}>
                  <h2>{currentAnalysis.profile_data.name || currentAnalysis.profile_data.login}</h2>
                  <a href={currentAnalysis.profile_data.html_url} target="_blank" rel="noopener noreferrer" className={styles.usernameLink}>
                    @{currentAnalysis.profile_data.login}
                  </a>
                  <p className={styles.bio}>{currentAnalysis.profile_data.bio || 'No bio provided.'}</p>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{currentAnalysis.profile_data.followers}</span>
                      <span className={styles.statLabel}>Followers</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{currentAnalysis.profile_data.following}</span>
                      <span className={styles.statLabel}>Following</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{currentAnalysis.profile_data.public_repos}</span>
                      <span className={styles.statLabel}>Repos</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.scoreContainer}>
                  <div className={styles.scoreValue}>{currentAnalysis.contribution_stats.score}/100</div>
                  <div className={styles.scoreLabel}>Profile Completeness</div>
                </div>
              </div>

              {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                <div className={styles.recommendationsCard}>
                  <h3>Resume Recommendations</h3>
                  <ul className={styles.recommendationList}>
                    {currentAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className={styles.recommendationItem}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.languagesCard}>
                <h3>Language Breakdown</h3>
                {renderLanguageBar(currentAnalysis.language_stats)}
              </div>

              <div className={styles.reposSection}>
                <h3>Top Repositories</h3>
                <div className={styles.repoGrid}>
                  {currentAnalysis.repo_data.slice(0, 4).map(repo => {
                    const isImported = importedRepos[repo.id];
                    const isImporting = importingId === repo.id;

                    return (
                      <div key={repo.id} className={styles.repoCard}>
                        <div className={styles.repoHeader}>
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className={styles.repoName}>
                            {repo.name} ↗
                          </a>
                          <span className={styles.visibilityBadge}>Public</span>
                        </div>
                        <p className={styles.repoDescription}>{repo.description || 'No description provided.'}</p>
                        
                        <div className={styles.repoMeta}>
                          {repo.language && (
                            <div className={styles.repoLang}>
                              <span 
                                className={styles.langColor} 
                                style={{ backgroundColor: languageColors[repo.language] || '#cccccc' }} 
                              />
                              {repo.language}
                            </div>
                          )}
                          <div className={styles.repoStat}>
                            <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" className={styles.icon}>
                              <path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
                            </svg>
                            {repo.stargazers_count}
                          </div>
                          <div className={styles.repoStat}>
                            <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" className={styles.icon}>
                              <path fill="currentColor" d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
                            </svg>
                            {repo.forks_count}
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                          <button
                            type="button"
                            className={`btn ${isImported ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            style={{ width: '100%', fontSize: '11.5px', justifyContent: 'center' }}
                            disabled={isImporting || isImported}
                            onClick={() => handleImportRepo(repo)}
                          >
                            {isImporting ? 'Importing...' : isImported ? '✓ In Portfolio' : '⚡ Import to Portfolio'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No Profile Analyzed Yet</h3>
              <p>Enter a GitHub username above to analyze their profile, repositories, and get resume recommendations.</p>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.historyCard}>
            <h3>Recent Analyses</h3>
            {history.length > 0 ? (
              <ul className={styles.historyList}>
                {history.map(item => (
                  <li key={item.id} className={styles.historyItem}>
                    <button onClick={() => loadAnalysis(item.id)} className={styles.historyButton}>
                      <span className={styles.historyName}>@{item.username}</span>
                      <span className={styles.historyDate}>
                        {new Date(item.analyzed_at).toLocaleDateString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyHistory}>No recent analyses.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
