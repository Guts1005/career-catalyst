'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

const DOMAINS = [
  { key: 'all', label: 'All Domains', icon: '🌐' },
  { key: 'llm_rag', label: 'Generative AI & LLMs', icon: '🤖' },
  { key: 'computer_vision', label: 'Computer Vision', icon: '👁️' },
  { key: 'mlops_engineering', label: 'MLOps & Pipelines', icon: '⚙️' },
  { key: 'recsys_analytics', label: 'Recommendation Systems', icon: '🎯' },
];

export default function ProjectGeneratorPage() {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingIndex, setImportingIndex] = useState(null);
  const [importedStatus, setImportedStatus] = useState({});

  const fetchBlueprints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/project-generator?domain=${selectedDomain}`);
      const data = await res.json();
      if (data.projects) {
        setBlueprints(data.projects);
      }
    } catch (e) {
      console.error('Failed to load blueprints:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedDomain]);

  useEffect(() => {
    fetchBlueprints();
  }, [fetchBlueprints]);

  const handleImportToPortfolio = async (bp, idx) => {
    setImportingIndex(idx);
    try {
      const res = await fetch('/api/project-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bp.name,
          category: bp.category,
          summary: bp.summary,
          tech_stack: bp.tech_stack,
          impact: bp.impact,
          milestones: bp.milestones
        })
      });

      if (res.ok) {
        setImportedStatus(prev => ({ ...prev, [idx]: true }));
      }
    } catch (e) {
      console.error('Failed to import project:', e);
    } finally {
      setImportingIndex(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>💡 AI Project Blueprint & STAR Bullet Generator</h1>
          <p className={styles.subtitle}>
            Explore production-grade DS/ML project architectures with pre-crafted STAR resume bullets ready to add to your portfolio.
          </p>
        </div>
      </div>

      {/* Domain Selection Bar */}
      <div className={styles.domainTabs}>
        {DOMAINS.map(d => (
          <button
            key={d.key}
            className={`${styles.domainTab} ${selectedDomain === d.key ? styles.active : ''}`}
            onClick={() => setSelectedDomain(d.key)}
          >
            <span>{d.icon}</span> {d.label}
          </button>
        ))}
      </div>

      {/* Blueprints Display */}
      {loading ? (
        <div className="loading" style={{ minHeight: '40vh' }}>
          <div className="loadingSpinner" />
          <p>Generating project blueprints...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {blueprints.map((bp, idx) => {
            const isImported = importedStatus[idx];
            const isImporting = importingIndex === idx;

            return (
              <div key={idx} className={styles.blueprintCard}>
                <div>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.cardCategory}>{bp.category}</span>
                      <h3 className={styles.cardTitle}>{bp.name}</h3>
                    </div>
                    <span className={`${styles.difficultyBadge} ${bp.difficulty === 'Advanced' ? styles.diffAdv : styles.diffInt}`}>
                      {bp.difficulty}
                    </span>
                  </div>

                  <p className={styles.cardSummary}>{bp.summary}</p>
                </div>

                <div className={styles.metaBox}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Tech Stack:</span>
                    <span className={styles.metaVal}>{bp.tech_stack}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Datasets:</span>
                    <span className={styles.metaVal}>{bp.dataset}</span>
                  </div>
                </div>

                {/* STAR Method Resume Bullets */}
                <div className={styles.starSection}>
                  <div className={styles.starTitle}>
                    <span>⭐</span> Resume-Ready STAR Bullet Points:
                  </div>
                  <ul className={styles.starList}>
                    {bp.star_bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className={styles.starItem}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardActions}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    🎯 Impact Metric: <strong style={{ color: 'var(--text-primary)' }}>{bp.impact}</strong>
                  </div>

                  <button
                    className={`btn ${isImported ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    disabled={isImporting || isImported}
                    onClick={() => handleImportToPortfolio(bp, idx)}
                  >
                    {isImporting ? 'Adding...' : isImported ? '✓ Added to Portfolio' : '+ Add to Portfolio'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
