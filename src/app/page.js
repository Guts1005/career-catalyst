'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import { useCareer } from '@/context/CareerContext';
import OnboardingModal from '@/components/OnboardingModal';
import LiveTelemetryTicker from '@/components/LiveTelemetryTicker';
import BenchmarkLatencyVisualizer from '@/components/BenchmarkLatencyVisualizer';

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

  // Quick 30-Second Diagnostic Widget State
  const [diagStep, setDiagStep] = useState(1);
  const [diagFramework, setDiagFramework] = useState('PyTorch / Triton');
  const [diagDistributed, setDiagDistributed] = useState('Multi-Node / FSDP');
  const [diagCompGoal, setDiagCompGoal] = useState('$250k - $350k');
  const [diagScore, setDiagScore] = useState(null);

  const handleRunDiagnostic = () => {
    let score = 75;
    if (diagFramework === 'PyTorch / Triton') score += 12;
    if (diagDistributed === 'Multi-Node / FSDP') score += 10;
    setDiagScore(score);
    showToast(`Diagnostic Complete: Calibrated ${score}% Initial Readiness!`, 'success');
  };

  const topCompetencies = skills.slice(0, 4);

  return (
    <div className={styles.landingRoot}>
      {/* ─── Real-Time Live Telemetry Ticker Bar ────────────────────── */}
      <LiveTelemetryTicker />

      {/* ─── Interactive Persona Switcher Banner ─────────────────────── */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            EXPLORE CANDIDATE PERSONAS:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {demoPersonas?.map((p) => {
            const isActive = activePersonaId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`tag ${isActive ? 'active' : ''}`}
                onClick={() => selectPersona(p.id)}
                style={{
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-inverse)' : 'var(--bg-subtle)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-primary)',
                  border: `1px solid ${isActive ? 'var(--bg-inverse)' : 'var(--border)'}`,
                  fontSize: '11.5px',
                  padding: '6px 12px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.badge} ({p.personaName.split(' ')[0]})
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroMetaTop}>
          <span>CAREER INTELLIGENCE PLATFORM</span>
          <span>{readiness?.targetRoleTitle?.toUpperCase() || 'MACHINE LEARNING & SYSTEMS'}</span>
          <span>EST. 2026</span>
        </div>

        <div className={styles.heroMain}>
          <div>
            <h1 className={styles.heroDisplayTitle}>
              BUILD<br />
              YOUR<br />
              FUTURE.
            </h1>
          </div>

          <div className={styles.heroSubtitleBlock}>
            <p className={styles.heroDescription}>
              A rigorous, connected Career Operating System for Technical Engineers. Unify your competencies, track job pipeline velocity, and build verifiable portfolio evidence.
            </p>

            <div className={styles.heroCtaGroup}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsOnboardingOpen(true)}
                style={{ padding: '12px 24px', fontSize: '13.5px' }}
              >
                CALIBRATE CAREER GOALS ⚙
              </button>
              <Link href="/job-tracker" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                VIEW PIPELINE ({jobs.length} SAVED)
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.heroMetaBottom}>
          <span>{userProfile?.name?.toUpperCase() || 'SHARVIN NEVE'}</span>
          <span>TARGET: {readiness?.targetRoleTitle?.toUpperCase() || 'ML ENGINEER'}</span>
          <span>SCROLL FOR NARRATIVE ↓</span>
        </div>
      </section>

      {/* ─── Chapter 01: KNOW (Readiness & Unified Telemetry) ───────── */}
      <section className={styles.narrativeSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumber}>01 — KNOW</div>
            <h2 className={styles.chapterHeading}>
              KNOW<br />
              WHERE<br />
              YOU STAND.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescription}>
              Career advancement begins with unvarnished telemetry. Evaluate your technical readiness against actual hiring rubrics calibrated specifically for your target role.
            </p>
          </div>
        </div>

        <div className={styles.knowGrid}>
          <div className={styles.bigStatBlock}>
            <div className={styles.statHugeNumber}>{readiness?.overallScore || 84}%</div>
            <div className={styles.statHugeLabel}>
              {readiness?.targetRoleTitle || 'Machine Learning Engineer'} Profile Readiness
            </div>
          </div>

          <div className={styles.strengthList}>
            {topCompetencies.map((s) => (
              <div key={s.id || s.name} className={styles.strengthRow}>
                <span style={{ fontWeight: 600 }}>{s.name}</span>
                <span className="tabular-num" style={{ color: 'var(--text-muted)' }}>
                  {s.current_level}% Mastery ({s.evidence_level || 'VERIFIED'})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Quick 30-Second Diagnostic Interactive Widget ────────── */}
        <div style={{ marginTop: '36px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ⚡ 30-SECOND RAPID TECHNICAL DIAGNOSTIC
            </span>
            {diagScore && (
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 800 }}>
                ✓ DIAGNOSED READINESS: {diagScore}%
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Primary Core Framework
              </label>
              <select className="select" value={diagFramework} onChange={(e) => setDiagFramework(e.target.value)} style={{ width: '100%' }}>
                <option value="PyTorch / Triton">PyTorch & Custom Triton</option>
                <option value="TensorFlow / JAX">TensorFlow & JAX</option>
                <option value="Scikit-Learn / Classical">Scikit-Learn & Classical ML</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Distributed Training Scale
              </label>
              <select className="select" value={diagDistributed} onChange={(e) => setDiagDistributed(e.target.value)} style={{ width: '100%' }}>
                <option value="Multi-Node / FSDP">Multi-Node (FSDP / Megatron)</option>
                <option value="Single-Node / Multi-GPU">Single-Node (DDP / 8x GPU)</option>
                <option value="Single GPU / Cloud API">Single GPU / Colab / APIs</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Target Compensation Tier
              </label>
              <select className="select" value={diagCompGoal} onChange={(e) => setDiagCompGoal(e.target.value)} style={{ width: '100%' }}>
                <option value="$250k - $350k">$250,000 - $350,000+ (Staff/Principal)</option>
                <option value="$180k - $250k">$180,000 - $250,000 (Senior ML)</option>
                <option value="$120k - $180k">$120,000 - $180,000 (Core Engineer)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRunDiagnostic}
              style={{ fontSize: '12px', padding: '8px 18px' }}
            >
              RUN RAPID DIAGNOSTIC →
            </button>
          </div>
        </div>

        {/* ─── Next Best Action Card (Core Intelligence Loop) ───────── */}
        {nextBestAction && (
          <div style={{ marginTop: '36px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '24px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ● YOUR NEXT BEST ACTION
              </span>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                {nextBestAction.badge}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-primary)' }}>
              {nextBestAction.title}
            </h3>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {nextBestAction.reason}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-muted)' }}>EXPECTED IMPACT: <strong style={{ color: 'var(--text-primary)' }}>{nextBestAction.impact}</strong></span>
                <span style={{ color: 'var(--text-muted)' }}>ESTIMATED EFFORT: <strong style={{ color: 'var(--text-primary)' }}>{nextBestAction.effort}</strong></span>
              </div>

              <Link href={nextBestAction.actionUrl} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '12.5px' }}>
                {nextBestAction.actionLabel}
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ─── Chapter 02: PROVE (Project Ledger & Verification) ──────── */}
      <section className={styles.narrativeSectionDark}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumber} style={{ color: 'var(--text-muted)' }}>02 — PROVE</div>
            <h2 className={styles.chapterHeading} style={{ color: 'var(--text-primary)' }}>
              PROOF<br />
              BEATS<br />
              CREDENTIALS.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescription} style={{ color: 'var(--text-secondary)' }}>
              Recruiters ignore generic buzzwords. They look for verifiable code, latency benchmarks, and production deployment invariants.
            </p>
          </div>
        </div>

        {/* ─── Interactive Inference Benchmark Visualizer ───────────── */}
        <BenchmarkLatencyVisualizer />

        <div className={styles.projectLedger}>
          {projects.slice(0, 3).map((p, idx) => (
            <div key={p.id || idx} className={styles.projectLedgerItem} style={{ borderBottom: '1px solid var(--border)' }}>
              <div className={styles.projectLedgerIndex}>0{idx + 1}</div>
              <div className={styles.projectLedgerContent}>
                <div className={styles.projectLedgerTitle}>{p.name}</div>
                <div className={styles.projectLedgerDesc}>{p.description}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {(p.technologies || 'PyTorch, Docker').split(',').map((tech) => (
                    <span key={tech} style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '3px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.projectLedgerLink}>
                <Link href="/projects" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                  VIEW CASE STUDY →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Chapter 03: CONVERT (Application Opportunities) ────────── */}
      <section className={styles.narrativeSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumber}>03 — CONVERT</div>
            <h2 className={styles.chapterHeading}>
              EXECUTE<br />
              THE<br />
              SEARCH.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescription}>
              A targeted funnel tracking interview rounds, compensation benchmarks, and hiring milestones across frontier AI labs.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.slice(0, 3).map((j) => (
            <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{j.company}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '8px' }}>— {j.role}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>
                  {j.match_score || 92}% MATCH
                </span>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {j.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Link href="/job-tracker" className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
            VIEW FULL PIPELINE KANBAN →
          </Link>
        </div>
      </section>

      {/* Onboarding & Calibration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
