'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useCareer } from '@/context/CareerContext';
import OnboardingModal from '@/components/OnboardingModal';
import LiveTelemetryTicker from '@/components/LiveTelemetryTicker';
import OrientationBanner from '@/components/OrientationBanner';

export default function HomePage() {
  const {
    readiness,
    nextBestAction,
    targetRole,
    skills,
    projects,
    jobs,
    userProfile,
    demoPersonas,
    activePersonaId,
    selectPersona,
  } = useCareer();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handleReopenGuide = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('catalyst:reopen-orientation'));
    }
  };

  // 4 Cohesive Career Journey Portals
  const portals = [
    {
      phaseNumber: '01',
      id: 'radar',
      tag: 'PHASE 01 • DIAGNOSTICS',
      title: 'Readiness & Competency Radar',
      desc: 'Evaluate verified skills, multi-factor telemetry, and target role skill deficits.',
      score: readiness?.breakdown?.skills?.score || 66,
      weight: '30% Weight',
      primaryAction: { label: 'Open Competency Radar →', href: '/skills' },
      secondaryAction: { label: 'Career Analytics Telemetry ↗', href: '/analytics' },
      meta: `${skills.filter((s) => s.evidence_level === 'VERIFIED').length} Verified Skills • ${readiness?.gaps?.length || 0} Deficits`,
    },
    {
      phaseNumber: '02',
      id: 'proof',
      tag: 'PHASE 02 • EVIDENCE',
      title: 'Engineering Proof & Portfolio',
      desc: 'Hopper H100 benchmarks, verified code milestones, and peer-reviewed research papers.',
      score: readiness?.breakdown?.portfolio?.score || 61,
      weight: '30% Weight',
      primaryAction: { label: 'Inspect Portfolio Proof →', href: '/projects' },
      secondaryAction: { label: 'Research Paper Library ↗', href: '/resources' },
      meta: `${projects.length} System Case Studies • P99 < 15ms Latency`,
    },
    {
      phaseNumber: '03',
      id: 'applications',
      tag: 'PHASE 03 • CONVERT',
      title: 'Job Pipeline & Resume Canvas',
      desc: 'ATS keyword matcher, tailored STAR pitches, and real-time Overleaf LaTeX resume canvas.',
      score: readiness?.breakdown?.resume?.score || 75,
      weight: '20% Weight',
      primaryAction: { label: 'Open Job Pipeline →', href: '/job-tracker' },
      secondaryAction: { label: 'ATS Matcher & Resume Canvas ↗', href: '/ats-checker' },
      meta: `${jobs.length} Active Target Roles • 92% Average Match`,
    },
    {
      phaseNumber: '04',
      id: 'interview',
      tag: 'PHASE 04 • CLOSE',
      title: 'Interviews & Compensation',
      desc: 'Company-calibrated question bank, 15-min system design simulations, and 4-year RSU modeler.',
      score: readiness?.breakdown?.applications?.score || 51,
      weight: '20% Weight',
      primaryAction: { label: 'Launch Question Bank →', href: '/interview-prep' },
      secondaryAction: { label: 'Equity & Compensation Modeler ↗', href: '/salary-insights' },
      meta: 'Anthropic Priority Prep • Top 10% Benchmark Comp',
    },
  ];

  return (
    <div className={styles.container}>
      {/* ─── Real-Time Live Telemetry Ticker Bar ────────────────────── */}
      <LiveTelemetryTicker />

      {/* ─── Interactive Persona Switcher Toolbar ───────────────────── */}
      <div className={styles.personaBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={styles.personaLabel}>
            EXPLORE CANDIDATE TRACKS:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {demoPersonas?.map((p) => {
            const isActive = activePersonaId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.personaBtn} ${isActive ? styles.personaBtnActive : ''}`}
                onClick={() => selectPersona(p.id)}
                aria-pressed={isActive}
              >
                {p.badge} ({p.personaName.split(' ')[0]})
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleReopenGuide}
            aria-label="Reopen Catalyst OS orientation guide"
            className={styles.guideBtn}
          >
            🧭 GUIDE
          </button>
        </div>
      </div>

      {/* ─── Lightweight Non-Intrusive Orientation Banner ─────────── */}
      <div style={{ padding: '0 clamp(16px, 3vw, 40px)', marginTop: '16px' }}>
        <OrientationBanner
          nextBestAction={nextBestAction}
          onOpenCalibration={() => setIsOnboardingOpen(true)}
        />
      </div>

      {/* ─── Executive Overview Hero Hub ────────────────────────────── */}
      <main className={styles.mainContent}>
        <section className={styles.commandHero}>
          <div className={styles.heroIdentity}>
            <div className={styles.heroMicroTag}>
              CATALYST OS v2.6 • CAREER OPERATING SYSTEM
            </div>
            <h1 className={styles.heroCandidateName}>
              {userProfile?.name || 'SHARVIN NEVE'}
            </h1>
            <div className={styles.heroRoleTarget}>
              TARGET ROLE: <strong>{readiness?.targetRoleTitle?.toUpperCase() || 'STAFF AI ENGINEER'}</strong>
            </div>
            <p className={styles.heroSummaryText}>
              A unified engineering workspace connecting competency telemetry, verifiable code evidence, active hiring pipeline rounds, and interview compensation scenarios.
            </p>
            <div className={styles.heroActionRow}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsOnboardingOpen(true)}
                style={{ fontSize: '13px', padding: '10px 20px' }}
              >
                ⚙ CALIBRATE CAREER TRACK
              </button>
              <Link href="/job-tracker" className="btn btn-secondary" style={{ fontSize: '13px', padding: '10px 18px' }}>
                VIEW PIPELINE ({jobs.length} ACTIVE)
              </Link>
            </div>
          </div>

          <div className={styles.heroReadinessCard}>
            <div className={styles.readinessHeader}>
              <span className={styles.readinessTag}>TOTAL PROFILE READINESS</span>
              <span className={styles.readinessStatus}>CALIBRATED</span>
            </div>
            <div className={styles.readinessScoreVal}>
              {readiness?.overallScore || 63}%
            </div>
            <div className={styles.readinessTrackLabel}>
              Calibrated against Frontier AI hiring standards
            </div>

            <div className={styles.readinessBars}>
              <div className={styles.miniBarRow}>
                <span>Radar & Skills (30%)</span>
                <strong>{readiness?.breakdown?.skills?.score || 66}%</strong>
              </div>
              <div className={styles.miniBarTrack}>
                <div className={styles.miniBarFill} style={{ width: `${readiness?.breakdown?.skills?.score || 66}%` }} />
              </div>

              <div className={styles.miniBarRow}>
                <span>Portfolio Proof (30%)</span>
                <strong>{readiness?.breakdown?.portfolio?.score || 61}%</strong>
              </div>
              <div className={styles.miniBarTrack}>
                <div className={styles.miniBarFill} style={{ width: `${readiness?.breakdown?.portfolio?.score || 61}%` }} />
              </div>

              <div className={styles.miniBarRow}>
                <span>Resume Match (20%)</span>
                <strong>{readiness?.breakdown?.resume?.score || 75}%</strong>
              </div>
              <div className={styles.miniBarTrack}>
                <div className={styles.miniBarFill} style={{ width: `${readiness?.breakdown?.resume?.score || 75}%` }} />
              </div>

              <div className={styles.miniBarRow}>
                <span>Pipeline Velocity (20%)</span>
                <strong>{readiness?.breakdown?.applications?.score || 51}%</strong>
              </div>
              <div className={styles.miniBarTrack}>
                <div className={styles.miniBarFill} style={{ width: `${readiness?.breakdown?.applications?.score || 51}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Prominent Next Best Action Recommendation ───────────── */}
        {nextBestAction && (
          <section className={styles.nextActionCard} aria-label="Next Best Action Recommendation">
            <div className={styles.nextActionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.actionLiveDot}>●</span>
                <span className={styles.nextActionHeading}>RECOMMENDED NEXT BEST ACTION</span>
              </div>
              <span className={styles.actionBadge}>{nextBestAction.badge}</span>
            </div>

            <div className={styles.nextActionBody}>
              <div>
                <h2 className={styles.nextActionTitle}>{nextBestAction.title}</h2>
                <p className={styles.nextActionReason}>{nextBestAction.reason}</p>
              </div>

              <div className={styles.nextActionFooter}>
                <div className={styles.actionMetrics}>
                  <span>IMPACT: <strong style={{ color: 'var(--text-primary)' }}>{nextBestAction.impact}</strong></span>
                  <span>EFFORT: <strong style={{ color: 'var(--text-primary)' }}>{nextBestAction.effort}</strong></span>
                </div>
                <Link href={nextBestAction.actionUrl} className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '12.5px' }}>
                  {nextBestAction.actionLabel}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ─── 4 Structured Career Journey Portals (2x2 Grid) ──────── */}
        <section className={styles.portalsSection} aria-label="Connected Career Portals">
          <div className={styles.portalsHeader}>
            <div className={styles.portalsTitle}>CAREER OPERATING SYSTEM JOURNEY PORTALS</div>
            <div className={styles.portalsSubtitle}>Select any connected stage to view dedicated workflows, tests, and evidence.</div>
          </div>

          <div className={styles.portalsGrid}>
            {portals.map((p) => (
              <div key={p.id} className={styles.portalCard}>
                <div className={styles.portalTop}>
                  <span className={styles.portalBadge}>{p.tag}</span>
                  <div className={styles.portalScoreBadge}>
                    <span>{p.score}%</span>
                    <small>{p.weight}</small>
                  </div>
                </div>

                <h3 className={styles.portalTitle}>{p.title}</h3>
                <p className={styles.portalDesc}>{p.desc}</p>

                <div className={styles.portalMeta}>
                  {p.meta}
                </div>

                <div className={styles.portalActions}>
                  <Link href={p.primaryAction.href} className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                    {p.primaryAction.label}
                  </Link>
                  <Link href={p.secondaryAction.href} className={styles.portalSecondaryLink}>
                    {p.secondaryAction.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Secondary Specialized Labs Hub Strip ──────────────────── */}
        <section className={styles.labsSection}>
          <div className={styles.labsTitle}>SPECIALIZED TECHNICAL LABS & SHOWCASE:</div>
          <div className={styles.labsLinks}>
            <Link href="/project-generator" className={styles.labLink}>
              🚀 Architecture Blueprints
            </Link>
            <Link href="/algorithm-sandbox" className={styles.labLink}>
              ⚡ Triton Latency Sandbox
            </Link>
            <Link href="/portfolio/sharvin" className={styles.labLink}>
              🌐 Public Portfolio Showcase
            </Link>
          </div>
        </section>
      </main>

      {/* Onboarding & Target Role Calibration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
