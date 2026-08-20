'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import {
  IconBlueprints,
  IconCheck,
  IconArrowUpRight,
} from '@/components/Icons';

const DOMAINS = [
  { key: 'all', label: 'All Domains' },
  { key: 'llm_rag', label: 'Generative AI & LLMs' },
  { key: 'computer_vision', label: 'Computer Vision & Multimodal' },
  { key: 'mlops_engineering', label: 'MLOps & Distributed Systems' },
  { key: 'recsys_analytics', label: 'Recommendation Systems' },
];

export default function ProjectGeneratorPage() {
  const { refreshCareerState } = useCareer();
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
        showToast(`Blueprint "${bp.name}" imported to portfolio case studies!`, 'success');
        refreshCareerState();
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
        chapter="PORTFOLIO & PROOF / 07"
        title={<>SYSTEM<br />BLUEPRINTS.</>}
        subtitle="Production-grade ML architectures and STAR impact formulas ready to import directly into your portfolio."
      />

      {/* Domain Selection Bar */}
      <div className={styles.domainTabs}>
        {DOMAINS.map((d) => (
          <button
            key={d.key}
            type="button"
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
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Generating System Blueprints...</p>
        </div>
      ) : (
        <div className={styles.blueprintsGrid}>
          {blueprints.map((bp, idx) => (
            <div key={bp.name + idx} className={styles.blueprintCard}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardCategory}>{bp.category}</div>
                  <h3 className={styles.cardTitle}>{bp.name}</h3>
                </div>
                <span className={styles.levelBadge}>{bp.level || 'Staff / Senior'}</span>
              </div>

              <p className={styles.summaryText}>{bp.summary}</p>

              {/* STAR Framework Breakdown */}
              <div className={styles.starBox}>
                <div className={styles.starSection}>
                  <span className={styles.starTag}>SITUATION & TASK</span>
                  <p>{bp.situation}</p>
                </div>
                <div className={styles.starSection}>
                  <span className={styles.starTag}>ACTION & ARCHITECTURE</span>
                  <p>{bp.action}</p>
                </div>
                <div className={styles.starSection}>
                  <span className={styles.starTag} style={{ color: 'var(--green)' }}>RESULT & MEASURED IMPACT</span>
                  <p>{bp.result}</p>
                </div>
              </div>

              {/* Tech Stack */}
              <div className={styles.techList}>
                {bp.tech_stack.split(',').map((tech) => (
                  <span key={tech} className={styles.techTag}>
                    {tech.trim()}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={`btn ${importedStatus[idx] ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleImportToPortfolio(bp, idx)}
                  disabled={importingIndex === idx || importedStatus[idx]}
                  style={{ width: '100%', fontSize: '12.5px', padding: '10px 0' }}
                >
                  {importedStatus[idx] ? '✓ IMPORTED TO PORTFOLIO' : importingIndex === idx ? 'IMPORTING...' : '+ IMPORT TO PORTFOLIO EVIDENCE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
