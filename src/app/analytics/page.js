'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { IconAnalytics } from '@/components/Icons';

const TRAJECTORY_STAGES = [
  { id: 'foundation', label: 'FOUNDATION', desc: 'Core CS, Linear Algebra & Probability', status: 'completed', link: '/resources' },
  { id: 'applied', label: 'APPLIED ML', desc: 'PyTorch, Model Training & Evaluation', status: 'completed', link: '/skills' },
  { id: 'portfolio', label: 'PORTFOLIO', desc: 'Production Systems & Multi-Modal RAG', status: 'active', link: '/projects', current: true },
  { id: 'pipeline', label: 'APPLICATIONS', desc: 'Target Lab Pipeline & ATS Matching', status: 'pending', link: '/job-tracker' },
  { id: 'interviews', label: 'INTERVIEWS', desc: 'System Design & Assessment Mastery', status: 'pending', link: '/interview-prep' },
];

export default function AnalyticsPage() {
  const { readiness, nextBestAction, skills, projects, jobs, targetRole, userProfile } = useCareer();
  const [selectedTrajectory, setSelectedTrajectory] = useState('portfolio');
  const [nextMoveExpanded, setNextMoveExpanded] = useState(false);

  // Group skills by category for visualization
  const skillsByCategory = useMemo(() => {
    const map = {};
    skills.forEach((s) => {
      const cat = s.category || 'Core';
      if (!map[cat]) map[cat] = { total: 0, count: 0, max: 0 };
      map[cat].total += s.current_level || 50;
      map[cat].count += 1;
      map[cat].max = Math.max(map[cat].max, s.current_level || 50);
    });
    return Object.entries(map).map(([category, data]) => ({
      category,
      avg: Math.round(data.total / data.count),
      count: data.count,
    }));
  }, [skills]);

  // Pipeline funnel stats
  const pipelineFunnel = useMemo(() => {
    return [
      { stage: 'Wishlist', count: jobs.filter((j) => j.status === 'wishlist').length || 1, color: 'var(--text-muted)' },
      { stage: 'Applied', count: jobs.filter((j) => j.status === 'applied').length || 1, color: 'var(--blue)' },
      { stage: 'Assessment / OA', count: jobs.filter((j) => j.status === 'oa').length || 1, color: 'var(--amber)' },
      { stage: 'Technical Rounds', count: jobs.filter((j) => ['interview', 'final'].includes(j.status)).length || 1, color: 'var(--purple)' },
      { stage: 'Offers / Decided', count: jobs.filter((j) => j.status === 'offer').length || 0, color: 'var(--green)' },
    ];
  }, [jobs]);

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="INDEX / 02"
        title={<>CAREER<br />ANALYTICS.</>}
        subtitle={`Real-time telemetry, pipeline conversion velocity, and competency progression calibrated for ${readiness?.targetRoleTitle || 'ML Engineer'}.`}
      />

      {/* ─── Hero Readiness & Interactive Trajectory ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '8px' }}>
        {/* Animated Score Block */}
        <div className={styles.card} style={{ position: 'relative' }}>
          <div className={styles.cardHeader}>
            <h2 style={{ color: 'var(--text-primary)' }}>Career Readiness Index</h2>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LIVE TELEMETRY</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '8px 0' }}>
            <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1, color: 'var(--text-primary)' }}>
              {readiness?.overallScore || 84}%
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Calibrated against hiring standards for <strong>{readiness?.targetRoleTitle || 'Machine Learning Engineer'}</strong>.
            </div>
          </div>

          <div className={styles.barTrack} style={{ height: '4px', background: 'var(--bg-subtle)' }}>
            <div className={styles.barFill} style={{ width: `${readiness?.overallScore || 84}%`, background: 'var(--text-primary)', transition: 'width 0.8s ease' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span>BASELINE 50%</span>
            <span>TARGET 100%</span>
          </div>
        </div>

        {/* Interactive "Your Next Move" */}
        {nextBestAction && (
          <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className={styles.cardHeader}>
                <h2 style={{ color: 'var(--text-primary)' }}>Recommended Next Move</h2>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', background: 'var(--green-subtle)', border: '1px solid var(--green-border)', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
                  {nextBestAction.badge}
                </span>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {nextBestAction.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {nextBestAction.reason}
                </div>
              </div>

              {nextMoveExpanded && (
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>Expected ROI:</strong> {nextBestAction.impact} • <strong>Estimated Time:</strong> {nextBestAction.effort}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setNextMoveExpanded(!nextMoveExpanded)}
                style={{ background: 'transparent', border: 'none', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {nextMoveExpanded ? 'LESS DETAILS ↑' : 'WHY THIS? ↓'}
              </button>
              <Link href={nextBestAction.actionUrl} className="btn btn-primary btn-sm">
                {nextBestAction.actionLabel}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── Interactive Career Trajectory ─────────────────────────── */}
      <div className={styles.card} style={{ margin: '8px 0' }}>
        <div className={styles.cardHeader}>
          <h2 style={{ color: 'var(--text-primary)' }}>Career Progression Trajectory</h2>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CURRENT STAGE: PORTFOLIO & PROOF</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {TRAJECTORY_STAGES.map((stg, i) => {
            const isSelected = selectedTrajectory === stg.id;
            return (
              <div
                key={stg.id}
                onClick={() => setSelectedTrajectory(stg.id)}
                style={{
                  padding: '14px',
                  background: isSelected ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    0{i + 1} • {stg.label}
                  </span>
                  {stg.status === 'completed' && <span style={{ color: 'var(--green)', fontSize: '11px' }}>✓</span>}
                  {stg.status === 'active' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue)' }} />}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {stg.desc}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Link href={stg.link} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                    OPEN STAGE →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Category Mastery & Pipeline Funnel ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '8px' }}>
        {/* Category Competency Balances */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 style={{ color: 'var(--text-primary)' }}>Competency Balance by Discipline</h2>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RADAR DATA</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {skillsByCategory.map((cat) => (
              <div key={cat.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cat.category}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cat.avg}% Avg ({cat.count} Skills)</span>
                </div>
                <div className={styles.barTrack} style={{ height: '6px', background: 'var(--bg-subtle)' }}>
                  <div className={styles.barFill} style={{ width: `${cat.avg}%`, background: 'var(--text-primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Velocity Funnel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 style={{ color: 'var(--text-primary)' }}>Opportunity Conversion Funnel</h2>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{jobs.length} TOTAL TARGETS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {pipelineFunnel.map((item) => (
              <div key={item.stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{item.stage}</span>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: item.color }}>
                  {item.count} Active
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Link href="/job-tracker" className="btn btn-secondary btn-sm">
              MANAGE PIPELINE →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
