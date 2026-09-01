'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useCareer } from '@/context/CareerContext';
import OnboardingModal from '@/components/OnboardingModal';

export default function HomePage() {
  const {
    readiness,
    nextBestAction,
    skills,
    projects,
    jobs,
    userProfile,
    demoPersonas,
    activePersonaId,
    selectPersona,
  } = useCareer();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // 4 Core Semantic Career Journey Portals (Linear/Vercel Bento Architecture)
  const portals = [
    {
      phaseNumber: '01',
      id: 'radar',
      phaseLabel: '01 • READINESS & RADAR',
      title: 'Competency Radar & Skill Gaps',
      description: 'Continuous diagnostic telemetry measuring GPU kernel optimization, distributed training scale, and target role deficit gaps.',
      score: readiness?.breakdown?.skills?.score || 66,
      weight: '30% Weight',
      stats: [
        { label: 'VERIFIED SKILLS', val: `${skills.filter((s) => s.evidence_level === 'VERIFIED').length} Skills` },
        { label: 'ACTIVE DEFICITS', val: `${readiness?.gaps?.length || 0} Gaps` },
      ],
      primaryLink: { label: 'Open Competency Radar →', href: '/skills' },
      secondaryLink: { label: 'Career Analytics ↗', href: '/analytics' },
    },
    {
      phaseNumber: '02',
      id: 'proof',
      phaseLabel: '02 • EVIDENCE & PROOF',
      title: 'Engineering Proof & Case Studies',
      description: 'Hopper H100 kernel latency benchmarks, verified milestones, systems coding ledger, and peer-reviewed arXiv research citations.',
      score: readiness?.breakdown?.portfolio?.score || 61,
      weight: '30% Weight',
      stats: [
        { label: 'SYSTEM PROJECTS', val: `${projects.length} Repos` },
        { label: 'P99 LATENCY', val: '< 13.8ms' },
      ],
      primaryLink: { label: 'Inspect Portfolio Proof →', href: '/projects' },
      secondaryLink: { label: 'Research Paper Library ↗', href: '/resources' },
    },
    {
      phaseNumber: '03',
      id: 'applications',
      phaseLabel: '03 • APPLICATIONS & RESUME',
      title: 'Application Pipeline & Resume Canvas',
      description: 'Connected job application kanban with ATS keyword matcher, STAR pitch studio, and live Overleaf LaTeX export canvas.',
      score: readiness?.breakdown?.resume?.score || 75,
      weight: '20% Weight',
      stats: [
        { label: 'ACTIVE PIPELINE', val: `${jobs.length} Roles` },
        { label: 'ATS MATCH RATE', val: '92% Average' },
      ],
      primaryLink: { label: 'Open Job Pipeline →', href: '/job-tracker' },
      secondaryLink: { label: 'ATS Matcher & Resume ↗', href: '/ats-checker' },
    },
    {
      phaseNumber: '04',
      id: 'interview',
      phaseLabel: '04 • INTERVIEWS & CLOSE',
      title: 'Interview Simulator & Compensation',
      description: 'Company-calibrated technical question banks, 15-minute system design simulator, and 4-year RSU equity waterfall scenario modeler.',
      score: readiness?.breakdown?.applications?.score || 51,
      weight: '20% Weight',
      stats: [
        { label: 'PRIORITY CALIBRATION', val: 'Anthropic' },
        { label: 'EQUITY MODEL', val: '4-Yr RSU Waterfall' },
      ],
      primaryLink: { label: 'Launch Question Bank →', href: '/interview-prep' },
      secondaryLink: { label: 'Equity & Comp Modeler ↗', href: '/salary-insights' },
    },
  ];

  return (
    <div className={styles.container}>
      {/* ─── Unified Top Executive Control Strip ─────────────────────── */}
      <header className={styles.topControlBar}>
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>HARDWARE VERIFIED • 8x H100 CLUSTER TELEMETRY</span>
        </div>

        <div className={styles.personaControls}>
          <span className={styles.personaLabel}>TRACK:</span>
          <div className={styles.personaSegmentedGroup}>
            {demoPersonas?.map((p) => {
              const isActive = activePersonaId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPersona(p.id)}
                  className={`${styles.personaPill} ${isActive ? styles.personaPillActive : ''}`}
                  aria-pressed={isActive}
                >
                  {p.badge} {p.personaName.split(' ')[0]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className={styles.calibrateBtn}
            title="Calibrate target role and candidate goals"
          >
            ⚙ CALIBRATE
          </button>
        </div>
      </header>

      {/* ─── Hero Executive Overview ─────────────────────────────────── */}
      <main className={styles.heroSection}>
        <div className={styles.heroIntro}>
          <div className={styles.systemBadge}>CATALYST OS v2.6 • CAREER OPERATING SYSTEM</div>
          <h1 className={styles.heroHeadline}>
            The Career Operating System for Systems Engineers.
          </h1>
          <p className={styles.heroSubtext}>
            Connect technical competency telemetry, Hopper H100 project evidence, active job pipeline rounds, and interview compensation into one unified intelligence engine.
          </p>
        </div>

        {/* ─── Bento Hero Summary Card (3-Column Executive Widget) ────── */}
        <section className={styles.heroCommandCard}>
          {/* Column 1: Candidate Track Identity */}
          <div className={styles.commandColIdentity}>
            <div className={styles.cardMicroLabel}>CANDIDATE PROFILE</div>
            <div className={styles.candidateName}>{userProfile?.name || 'SHARVIN NEVE'}</div>
            <div className={styles.targetRoleBadge}>
              TARGET: <strong>{readiness?.targetRoleTitle?.toUpperCase() || 'STAFF AI ENGINEER'}</strong>
            </div>
            <div className={styles.profileMetaList}>
              <span>• Domain: ML Systems & Distributed Training</span>
              <span>• Evidence: Triton Kernels & vLLM Serving</span>
            </div>
          </div>

          {/* Column 2: Total Readiness Gauge */}
          <div className={styles.commandColReadiness}>
            <div className={styles.cardMicroLabel}>TOTAL PROFILE READINESS</div>
            <div className={styles.readinessScoreNumber}>
              {readiness?.overallScore || 63}<span>%</span>
            </div>
            <div className={styles.readinessSubtext}>
              Calibrated against Frontier AI hiring bars
            </div>
            <div className={styles.readinessMiniBars}>
              <div className={styles.miniBar}>
                <div className={styles.miniBarLabel}>
                  <span>Radar (30%)</span>
                  <strong>{readiness?.breakdown?.skills?.score || 66}%</strong>
                </div>
                <div className={styles.miniBarTrack}>
                  <div className={styles.miniBarFill} style={{ width: `${readiness?.breakdown?.skills?.score || 66}%` }} />
                </div>
              </div>
              <div className={styles.miniBar}>
                <div className={styles.miniBarLabel}>
                  <span>Proof (30%)</span>
                  <strong>{readiness?.breakdown?.portfolio?.score || 61}%</strong>
                </div>
                <div className={styles.miniBarTrack}>
                  <div className={styles.miniBarFill} style={{ width: `${readiness?.breakdown?.portfolio?.score || 61}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Next Best Action Focus */}
          <div className={styles.commandColAction}>
            <div className={styles.actionHeaderRow}>
              <span className={styles.actionTag}>● NEXT BEST ACTION</span>
              <span className={styles.actionBadge}>{nextBestAction?.badge || 'HIGH PRIORITY'}</span>
            </div>
            <div className={styles.actionTitle}>
              {nextBestAction?.title || 'Prepare Technical System Design for Anthropic'}
            </div>
            <div className={styles.actionReason}>
              {nextBestAction?.reason || 'Upcoming technical interview round detected in Job Pipeline.'}
            </div>
            <div className={styles.actionButtonWrap}>
              <Link href={nextBestAction?.actionUrl || '/interview-prep'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px 16px', fontSize: '12.5px' }}>
                {nextBestAction?.actionLabel || 'EXECUTE ACTION →'}
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 4 Connected Career Journey Portals (Bento Grid) ────────── */}
        <section className={styles.portalsContainer} aria-label="Career Journey Portals">
          <div className={styles.portalsSectionHeader}>
            <div>
              <h2 className={styles.portalsSectionTitle}>Career Journey Portals</h2>
              <p className={styles.portalsSectionDesc}>
                Four integrated workspaces taking you from initial gap detection to verified portfolio proof, application conversion, and equity negotiation.
              </p>
            </div>
          </div>

          <div className={styles.portalsGrid}>
            {portals.map((p) => (
              <div key={p.id} className={styles.portalCard}>
                <div className={styles.portalHeader}>
                  <span className={styles.portalPhaseLabel}>{p.phaseLabel}</span>
                  <div className={styles.portalScorePill}>
                    <strong>{p.score}%</strong>
                    <small>{p.weight}</small>
                  </div>
                </div>

                <h3 className={styles.portalCardTitle}>{p.title}</h3>
                <p className={styles.portalCardDesc}>{p.description}</p>

                <div className={styles.portalStatsRow}>
                  {p.stats.map((stat, i) => (
                    <div key={i} className={styles.statItem}>
                      <span className={styles.statItemLabel}>{stat.label}</span>
                      <strong className={styles.statItemVal}>{stat.val}</strong>
                    </div>
                  ))}
                </div>

                <div className={styles.portalActionsGroup}>
                  <Link href={p.primaryLink.href} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', padding: '8px 14px' }}>
                    {p.primaryLink.label}
                  </Link>
                  <Link href={p.secondaryLink.href} className={styles.portalSecondaryAction}>
                    {p.secondaryLink.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Specialized Labs & Ecosystem Hub ───────────────────────── */}
        <footer className={styles.specializedHub}>
          <div className={styles.hubLabel}>SPECIALIZED TECHNICAL LABS & SHOWCASE</div>
          <div className={styles.hubLinks}>
            <Link href="/project-generator" className={styles.hubLinkItem}>
              <span>🚀 Architecture Blueprints</span>
              <small>Custom project generator with 1-click import</small>
            </Link>
            <Link href="/algorithm-sandbox" className={styles.hubLinkItem}>
              <span>⚡ Triton Latency Sandbox</span>
              <small>Interactive Hopper H100 batch latency model</small>
            </Link>
            <Link href="/portfolio/sharvin" className={styles.hubLinkItem}>
              <span>🌐 Public Portfolio Showcase</span>
              <small>Candidate portfolio viewable by recruiters</small>
            </Link>
          </div>
        </footer>
      </main>

      {/* Target Role & Track Calibration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
