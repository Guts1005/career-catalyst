'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import {
  IconBlueprints,
  IconCheck,
  IconArrowUpRight,
} from '@/components/Icons';

const DOMAINS = [
  { key: 'all', label: 'All Domains' },
  { key: 'llm_rag', label: 'Generative AI & LLMs' },
  { key: 'computer_vision', label: 'Computer Vision & Multimodal' },
  { key: 'mlops_engineering', label: 'MLOps & Distributed Pipelines' },
  { key: 'recsys_analytics', label: 'Recommendation Systems' },
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
          milestones: bp.milestones,
        }),
      });

      if (res.ok) {
        setImportedStatus((prev) => ({ ...prev, [idx]: true }));
        showToast(`Blueprint "${bp.name}" imported to portfolio projects!`, 'success');
      }
    } catch (e) {
      console.error('Failed to import project:', e);
      showToast('Failed to import project blueprint', 'error');
    } finally {
      setImportingIndex(null);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO / 02"
        title={<>SYSTEM<br />BLUEPRINTS.</>}
        subtitle="Production-grade ML architectures and STAR impact formulas ready to import directly into your portfolio."
      />

      {/* Domain Selection Bar */}
      <div className={styles.domainTabs}>
        {DOMAINS.map((d) => (
          <button
            key={d.key}
            className={`${styles.domainTab} ${selectedDomain === d.key ? styles.active : ''}`}
            onClick={() => setSelectedDomain(d.key)}
            style={{ fontSize: '12px' }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Blueprints Display */}
      {loading ? (
        <div className="loading" style={{ minHeight: '40vh' }}>
          <div className="loadingSpinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Synthesizing system blueprints...</p>
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
                      <span className={styles.cardCategory} style={{ fontSize: '11px' }}>{bp.category}</span>
                      <h3 className={styles.cardTitle} style={{ fontSize: '15px', fontWeight: 600 }}>{bp.name}</h3>
                    </div>
                    <span
                      className={`${styles.difficultyBadge} ${
                        bp.difficulty === 'Advanced' ? styles.diffAdv : styles.diffInt
                      }`}
                      style={{ fontSize: '10px', textTransform: 'uppercase' }}
                    >
                      {bp.difficulty}
                    </span>
                  </div>

                  <p className={styles.cardSummary} style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {bp.summary}
                  </p>
                </div>

                <div className={styles.metaBox}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel} style={{ fontSize: '11px' }}>Stack:</span>
                    <span className={styles.metaVal} style={{ fontSize: '12px' }}>{bp.tech_stack}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel} style={{ fontSize: '11px' }}>Datasets:</span>
                    <span className={styles.metaVal} style={{ fontSize: '12px' }}>{bp.dataset}</span>
                  </div>
                </div>

                {/* STAR Method Resume Bullets */}
                <div className={styles.starSection}>
                  <div className={styles.starTitle} style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Verified STAR Resume Bullets:
                  </div>
                  <ul className={styles.starList}>
                    {bp.star_bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className={styles.starItem} style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardActions}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Target Impact: <strong style={{ color: 'var(--text-primary)' }}>{bp.impact}</strong>
                  </div>

                  <button
                    className={`btn ${isImported ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    disabled={isImporting || isImported}
                    onClick={() => handleImportToPortfolio(bp, idx)}
                    style={{ fontSize: '11.5px', padding: '5px 12px' }}
                  >
                    {isImporting ? 'Syncing...' : isImported ? '✓ Synced to Portfolio' : '+ 1-Click Sync to Projects'}
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
