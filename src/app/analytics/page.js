'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import PageHeader from '@/components/PageHeader';
import { IconAnalytics } from '@/components/Icons';

const TRAJECTORY_STAGES = [
  { id: 'foundation', label: 'FOUNDATION', desc: 'Core CS, Linear Algebra & Probability', status: 'completed', link: '/resources' },
  { id: 'applied', label: 'APPLIED ML', desc: 'PyTorch, Model Training & Evaluation', status: 'completed', link: '/skills' },
  { id: 'portfolio', label: 'PORTFOLIO', desc: 'Production Systems & Multi-Modal RAG', status: 'active', link: '/projects', current: true },
  { id: 'pipeline', label: 'APPLICATIONS', desc: 'Target Lab Pipeline & ATS Matching', status: 'pending', link: '/job-tracker' },
  { id: 'interviews', label: 'INTERVIEWS', desc: 'System Design & Assessment Mastery', status: 'pending', link: '/interview-prep' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedTrajectory, setSelectedTrajectory] = useState('portfolio');
  const [nextMoveExpanded, setNextMoveExpanded] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);

        // Animate readiness score 0 -> target
        const target = json.overall?.readinessScore || 84;
        let start = 0;
        const duration = 800;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setAnimatedScore(target);
            clearInterval(timer);
          } else {
            setAnimatedScore(Math.round(start));
          }
        }, stepTime);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Compiling telemetry metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!data || data.overall.totalItems === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>No Data Yet</h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '13.5px', marginBottom: '16px' }}>
          Start tracking your certifications, projects, and skills to see your career analytics here.
        </p>
        <Link href="/skills" className="btn btn-primary">
          INITIALIZE SKILLS →
        </Link>
      </div>
    );
  }

  const chartColors = ['#0A0A0A', '#2563EB', '#6F6F6B', '#16A34A', '#D97706', '#8C8C88'];

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="INDEX / 02"
        title={<>CAREER<br />ANALYTICS.</>}
        subtitle="A structured overview of pipeline velocity, skill progress, and certification milestones."
      />

      {/* ─── Hero Readiness & Interactive Trajectory ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '8px' }}>
        {/* Animated Score Block */}
        <div className={styles.card} style={{ position: 'relative' }}>
          <div className={styles.cardHeader}>
            <h2>Career Readiness Index</h2>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>LIVE TELEMETRY</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '8px 0' }}>
            <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1, color: 'var(--black)' }}>
              {animatedScore}%
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--gray-600)', lineHeight: 1.4 }}>
              Profile covers majority requirements for senior AI/ML roles.
            </div>
          </div>

          <div className={styles.barTrack} style={{ height: '4px', background: 'var(--gray-100)' }}>
            <div className={styles.barFill} style={{ width: `${animatedScore}%`, transition: 'width 0.8s ease' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginTop: '8px' }}>
            <span>BASELINE 50%</span>
            <span>TARGET 100%</span>
          </div>
        </div>

        {/* Interactive "Your Next Move" */}
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className={styles.cardHeader}>
              <h2>Recommended Next Move</h2>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--red)', background: 'var(--red-subtle)', padding: '2px 6px', borderRadius: '3px', fontWeight: 700 }}>
                HIGH IMPACT
              </span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--black)' }}>
                Complete Triton GPU Kernel Project
              </div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '4px' }}>
                Closes your highest priority skill gap (+12% profile readiness).
              </div>
            </div>

            {nextMoveExpanded && (
              <div style={{ marginTop: '12px', padding: '10px', background: 'var(--off-white)', borderRadius: '4px', border: '1px solid var(--gray-200)', fontSize: '12px', color: 'var(--black)', lineHeight: 1.5 }}>
                <strong>Why this?</strong> Triton kernel programming is required for 84% of your saved Staff & Senior ML roles. Estimated time: 8 hours.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
            <button
              type="button"
              onClick={() => setNextMoveExpanded(!nextMoveExpanded)}
              style={{ background: 'transparent', border: 'none', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', cursor: 'pointer' }}
            >
              {nextMoveExpanded ? 'LESS DETAILS ↑' : 'WHY THIS? ↓'}
            </button>
            <Link href="/projects" className="btn btn-primary btn-sm">
              START PROJECT →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Interactive Career Trajectory ─────────────────────────── */}
      <div className={styles.card} style={{ margin: '8px 0' }}>
        <div className={styles.cardHeader}>
          <h2>Career Progression Trajectory</h2>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>CURRENT STAGE: PORTFOLIO</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {TRAJECTORY_STAGES.map((stg, i) => {
            const isSelected = selectedTrajectory === stg.id;
            return (
              <Link
                key={stg.id}
                href={stg.link}
                onClick={() => setSelectedTrajectory(stg.id)}
                style={{
                  textDecoration: 'none',
                  padding: '14px',
                  borderRadius: '4px',
                  background: isSelected ? 'var(--off-white)' : 'var(--white)',
                  border: isSelected ? '1px solid var(--black)' : '1px solid var(--gray-100)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: stg.status === 'completed' ? 'var(--green)' : stg.status === 'active' ? 'var(--blue)' : 'var(--gray-400)', fontWeight: 700 }}>
                    {stg.status === 'completed' ? '✓ VERIFIED' : stg.status === 'active' ? '● CURRENT' : '○ PENDING'}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)' }}>0{i+1}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--black)' }}>
                  {stg.label}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--gray-500)', lineHeight: 1.4 }}>
                  {stg.desc}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Blocks */}
      <div className={styles.gridTop}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Total Verified Items</h2>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statValue}>{data.overall.totalItems}</div>
            <div className={styles.statLabel}>
              <span>{data.overall.completedItems} Completed</span>
              {data.overall.totalItems - data.overall.completedItems} In Progress
            </div>
          </div>
          <div className={styles.barChart}>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(data.overall.completedItems / Math.max(1, data.overall.totalItems)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Skills Mastered</h2>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statValue}>{data.skills.mastered}</div>
            <div className={styles.statLabel}>
              <span>of {data.skills.total} Skills</span>
              {data.skills.needsImprovement} Priority Deltas
            </div>
          </div>
          <div className={styles.barChart}>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(data.skills.mastered / Math.max(1, data.skills.total)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Projects Shipped</h2>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statValue}>{data.projects.completed}</div>
            <div className={styles.statLabel}>
              <span>of {data.projects.total} Architectures</span>
              {data.projects.in_progress} In Development
            </div>
          </div>
          <div className={styles.barChart}>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(data.projects.completed / Math.max(1, data.projects.total)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
