'use client';

import Link from 'next/link';
import styles from './GapBlueprintCard.module.css';
import { findBlueprintRecommendation } from '@/lib/gapBlueprintRegistry';

/**
 * @component GapBlueprintCard
 * @description Renders a structured, explainable recommendation bridging a calculated skill deficit
 * to an actionable engineering architecture blueprint in Catalyst OS.
 */
export default function GapBlueprintCard({ gap, compact = false }) {
  if (!gap) return null;

  const searchKey = typeof gap === 'string' ? gap : (gap.name || gap.skillName || gap.id || '');
  const mapping = findBlueprintRecommendation(searchKey);

  const gapName = typeof gap === 'string' ? gap : (gap.name || gap.skillName || 'Competency Gap');
  const deltaVal = typeof gap === 'object' ? (gap.delta || (gap.target && gap.current ? gap.target - gap.current : null)) : null;
  const currentVal = typeof gap === 'object' ? gap.current : null;
  const targetVal = typeof gap === 'object' ? gap.target : null;

  if (!mapping) {
    if (compact) return null;
    return (
      <div className={styles.card} role="region" aria-label="Skill Gap Notice">
        <div className={styles.badgeRow}>
          <span className={styles.gapBadge}>COMPETENCY GAP: {gapName}</span>
          {deltaVal !== null && <span className={styles.defPill}>Δ -{deltaVal}%</span>}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          No focused blueprint is currently mapped to this competency gap. Explore the general blueprint catalog.
        </div>
        <div style={{ marginTop: '12px' }}>
          <Link href="/project-generator" className="btn btn-secondary btn-sm">
            EXPLORE BLUEPRINTS →
          </Link>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Link
          href={mapping.destination}
          className="btn btn-secondary btn-sm"
          aria-label={`View recommended blueprint ${mapping.blueprintName} to resolve ${mapping.skillName} gap`}
          style={{ fontSize: '11px', padding: '4px 10px', textDecoration: 'none' }}
        >
          🚀 BUILD {mapping.blueprintName.slice(0, 22)}... →
        </Link>
      </div>
    );
  }

  return (
    <div
      className={styles.card}
      role="region"
      aria-label={`Actionable blueprint recommendation for ${mapping.skillName}`}
    >
      <div className={styles.badgeRow}>
        <span className={styles.gapBadge}>
          COMPETENCY DEFICIT IDENTIFIED
        </span>
        <span className={styles.defPill}>
          {currentVal !== null && targetVal !== null
            ? `CURRENT: ${currentVal}% • TARGET: ${targetVal}% (Δ -${deltaVal || (targetVal - currentVal)}%)`
            : `TARGET DEFICIT (Δ -${deltaVal || 20}%)`}
        </span>
      </div>

      {/* 1. WHAT is weak? */}
      <h3 className={styles.whatIsWeak}>
        {mapping.skillName}
      </h3>

      {/* 2. WHY does it matter? */}
      <p className={styles.whyItMatters}>
        {mapping.whyItMatters}
      </p>

      {/* 3. WHAT should I build? */}
      <div className={styles.blueprintBox}>
        <span className={styles.blueprintLabel}>
          RECOMMENDED ARCHITECTURE BLUEPRINT
        </span>
        <div className={styles.blueprintTitle}>
          {mapping.blueprintName}
        </div>
        <p className={styles.blueprintReason}>
          {mapping.reasonForRecommendation}
        </p>
      </div>

      {/* 4. WHAT will improve? */}
      <div className={styles.impactRow}>
        <div>
          <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            EXPECTED EVIDENCE IMPACT
          </span>
          <div className={styles.impactTags}>
            {mapping.evidenceImpact.map((tag) => (
              <span key={tag} className={styles.impactTag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={mapping.destination}
          className={`btn btn-primary ${styles.ctaLink}`}
          aria-label={`View recommended architecture blueprint ${mapping.blueprintName} for ${mapping.skillName}`}
        >
          VIEW BLUEPRINT & SPECS →
        </Link>
      </div>
    </div>
  );
}
