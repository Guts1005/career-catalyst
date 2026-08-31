'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import OnboardingModal from '@/components/OnboardingModal';
import { useCareer } from '@/context/CareerContext';
import { NAVIGATION_PHASES, SECONDARY_NAV_ITEMS } from '@/config/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { readiness, userProfile } = useCareer();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 110,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '6px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'none',
        }}
        className="sidebar-mobile-toggle"
        aria-label="Toggle Navigation"
      >
        MENU
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.6)',
            zIndex: 99,
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Primary Career Navigation"
        style={{
          width: 'var(--sidebar-width)',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 14px',
          overflowY: 'auto',
          zIndex: 50,
        }}
      >
        <div>
          {/* Brand Header */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              textDecoration: 'none',
              marginBottom: '18px',
              paddingLeft: '4px',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              CATALYST OS
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              v2.6
            </span>
          </Link>

          {/* Calibrate Target Role Trigger */}
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            aria-label="Calibrate candidate track and target role"
            style={{
              width: '100%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '7px 9px',
              marginBottom: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {userProfile?.name || 'CANDIDATE'} • TRACK ⚙
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              {readiness?.targetRoleTitle || 'ML Engineer'}
            </span>
          </button>

          {/* ─── Semantic 4-Phase Career Journey Navigation ─────────── */}
          <nav aria-label="Career Journey Stages">
            {NAVIGATION_PHASES.map((phase) => (
              <div key={phase.id} style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 6px',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {phase.phaseNumber} — {phase.title}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {phase.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          background: isActive ? 'var(--bg-subtle)' : 'transparent',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '12.5px',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <Icon size={14} style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.label}
                          </span>
                        </span>
                        {isActive && (
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: 'var(--text-primary)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ─── Secondary Showcase & Technical Labs ──────────────── */}
            <div style={{ marginBottom: '14px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  padding: '0 6px',
                  marginBottom: '6px',
                }}
              >
                SHOWCASE & LABS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        background: isActive ? 'var(--bg-subtle)' : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '12px',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <Icon size={13} style={{ opacity: isActive ? 1 : 0.55, flexShrink: 0 }} />
                        <span>{item.label}</span>
                      </span>
                      {isActive && (
                        <span
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'var(--text-primary)',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Unified Readiness Status Ledger + Theme Switcher */}
        <div
          style={{
            padding: '12px 4px 0 4px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            onClick={() => setIsOnboardingOpen(true)}
            style={{ cursor: 'pointer' }}
            title="Click to calibrate career goals"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOnboardingOpen(true);
              }
            }}
          >
            <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Readiness Score
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {readiness?.overallScore || 84}%
            </div>
          </div>

          <ThemeToggle />
        </div>
      </aside>

      {/* Onboarding & Calibration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </>
  );
}
