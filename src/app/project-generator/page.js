'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { findBlueprintRecommendation, getBlueprintById } from '@/lib/gapBlueprintRegistry';

const DOMAINS = [
  { key: 'all', label: 'All Domains' },
  { key: 'llm_rag', label: 'Generative AI & LLMs' },
  { key: 'computer_vision', label: 'Computer Vision & Multimodal' },
  { key: 'mlops_engineering', label: 'MLOps & Distributed Systems' },
  { key: 'recsys_analytics', label: 'Recommendation Systems' },
];

function ProjectGeneratorContent() {
  const { refreshCareerState } = useCareer();
  const searchParams = useSearchParams();

  const gapParam = searchParams.get('gap');
  const blueprintParam = searchParams.get('blueprint');

  // Validate query context against registry
  const activeRecommendation = useMemo(() => {
    if (blueprintParam) {
      const byId = getBlueprintById(blueprintParam);
      if (byId) return byId;
    }
    if (gapParam) {
      const byGap = findBlueprintRecommendation(gapParam);
      if (byGap) return byGap;
    }
    return null;
  }, [gapParam, blueprintParam]);

  const [selectedDomain, setSelectedDomain] = useState(
    activeRecommendation ? activeRecommendation.domain : 'all'
  );
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingIndex, setImportingIndex] = useState(null);
  const [importedStatus, setImportedStatus] = useState({});

  // Sync domain if query parameter recommendation changes
  useEffect(() => {
    if (activeRecommendation && activeRecommendation.domain) {
      setSelectedDomain(activeRecommendation.domain);
    }
  }, [activeRecommendation]);

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
        chapter="SHOWCASE & LABS / 05"
        title={<>ARCHITECTURE<br />BLUEPRINTS.</>}
        subtitle="Production-grade ML architectures and STAR impact formulas ready to import directly into your portfolio."
      />

      {/* ─── Contextual Recommendation Banner (Connection A) ───────── */}
      {activeRecommendation && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--green-border, rgba(34, 197, 94, 0.4))',
            borderRadius: '6px',
            padding: '16px 20px',
            marginBottom: '20px',
            position: 'relative',
          }}
          role="region"
          aria-label="Contextual gap resolution banner"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎯 CONTEXTUAL GAP RESOLUTION BRIDGE
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              GAP: {activeRecommendation.skillName.toUpperCase()}
            </span>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '0 0 6px 0', lineHeight: 1.5 }}>
            Highlighted <strong>{activeRecommendation.blueprintName}</strong> because it directly addresses your <strong>{activeRecommendation.skillName}</strong> evidence gap.
          </p>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {activeRecommendation.reasonForRecommendation}
          </p>
        </div>
      )}

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
          {blueprints.map((bp, idx) => {
            const isRecommended =
              activeRecommendation &&
              (bp.name.toLowerCase() === activeRecommendation.blueprintName.toLowerCase() ||
                bp.name.toLowerCase().includes(activeRecommendation.blueprintName.toLowerCase()) ||
                activeRecommendation.blueprintName.toLowerCase().includes(bp.name.toLowerCase()));

            return (
              <div
                key={bp.name + idx}
                className={styles.blueprintCard}
                style={
                  isRecommended
                    ? {
                        border: '2px solid var(--green, #22c55e)',
                        background: 'var(--bg-surface)',
                        boxShadow: '0 0 24px rgba(34, 197, 94, 0.15)',
                      }
                    : {}
                }
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.cardCategory}>{bp.category}</div>
                      {isRecommended && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--green)',
                            background: 'var(--green-subtle, rgba(34, 197, 94, 0.1))',
                            border: '1px solid var(--green-border, rgba(34, 197, 94, 0.4))',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          ★ RECOMMENDED FOR YOUR GAP
                        </span>
                      )}
                    </div>
                    <h3 className={styles.cardTitle}>{bp.name}</h3>
                  </div>
                  <span className={styles.levelBadge}>{bp.level || 'Staff / Senior'}</span>
                </div>

                <p className={styles.summaryText}>{bp.summary}</p>

                {/* Milestones Preview */}
                {bp.milestones && (
                  <div style={{ marginBottom: '16px', background: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      KEY IMPLEMENTATION MILESTONES
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {bp.milestones.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                    className={`btn ${importedStatus[idx] ? 'btn-secondary' : isRecommended ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleImportToPortfolio(bp, idx)}
                    disabled={importingIndex === idx || importedStatus[idx]}
                    style={{ width: '100%', fontSize: '12.5px', padding: '10px 0', fontWeight: isRecommended ? 800 : 600 }}
                  >
                    {importedStatus[idx]
                      ? '✓ IMPORTED TO PORTFOLIO'
                      : importingIndex === idx
                      ? 'IMPORTING...'
                      : '+ IMPORT TO PORTFOLIO EVIDENCE'}
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

export default function ProjectGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="loading" style={{ minHeight: '60vh' }}>
          <div className="loadingSpinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>
            Loading System Blueprints...
          </p>
        </div>
      }
    >
      <ProjectGeneratorContent />
    </Suspense>
  );
}
