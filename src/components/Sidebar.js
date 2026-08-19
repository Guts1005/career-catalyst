'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import OnboardingModal from '@/components/OnboardingModal';
import { useCareer } from '@/context/CareerContext';
import {
  IconDashboard,
  IconAnalytics,
  IconResume,
  IconCoverLetter,
  IconJobs,
  IconInterview,
  IconAssessment,
  IconCertifications,
  IconProjects,
  IconBlueprints,
  IconCoding,
  IconSandbox,
  IconSkills,
  IconResources,
  IconSalary,
  IconATS,
  IconGitHub,
  IconPortfolio,
} from './Icons';

const NAV_SECTIONS = [
  {
    title: 'INDEX',
    items: [
      { href: '/', label: 'Overview', icon: IconDashboard },
      { href: '/analytics', label: 'Career Analytics', icon: IconAnalytics },
    ],
  },
  {
    title: 'OPPORTUNITIES',
    items: [
      { href: '/job-tracker', label: 'Pipeline & Kanban', icon: IconJobs },
      { href: '/salary-insights', label: 'Salary Intelligence', icon: IconSalary },
      { href: '/cover-letter', label: 'Cover Pitch Studio', icon: IconCoverLetter },
      { href: '/ats-checker', label: 'ATS Scanner', icon: IconATS },
    ],
  },
  {
    title: 'TECHNICAL CORE',
    items: [
      { href: '/mock-interview', label: 'Mock Assessment', icon: IconAssessment },
      { href: '/interview-prep', label: 'Question Bank', icon: IconInterview },
      { href: '/algorithm-sandbox', label: 'Math Sandbox', icon: IconSandbox },
      { href: '/coding-tracker', label: 'Coding Ledger', icon: IconCoding },
      { href: '/skills', label: 'Skill Gap Map', icon: IconSkills },
    ],
  },
  {
    title: 'PORTFOLIO & PROOF',
    items: [
      { href: '/projects', label: 'Case Studies', icon: IconProjects },
      { href: '/project-generator', label: 'System Blueprints', icon: IconBlueprints },
      { href: '/certifications', label: 'Certifications', icon: IconCertifications },
      { href: '/resources', label: 'Reading Index', icon: IconResources },
      { href: '/resume-builder', label: 'ATS Resume', icon: IconResume },
      { href: '/github', label: 'GitHub Sync', icon: IconGitHub },
      { href: '/portfolio/sharvin', label: 'Public Portfolio', icon: IconPortfolio },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { readiness } = useCareer();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
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
          padding: '24px 16px',
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
              marginBottom: '24px',
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
            style={{
              width: '100%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '8px 10px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TARGET TRACK ⚙
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              {readiness?.targetRoleTitle || 'ML Engineer'}
            </span>
          </button>

          {/* Navigation Sections */}
          <nav>
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-mono)',
                    paddingLeft: '8px',
                  }}
                >
                  {section.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 8px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          background: isActive ? 'var(--bg-subtle)' : 'transparent',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '13px',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icon size={15} style={{ opacity: isActive ? 1 : 0.6 }} />
                          {item.label}
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
            ))}
          </nav>
        </div>

        {/* Unified Readiness Status Ledger + Theme Switcher */}
        <div
          style={{
            padding: '14px 6px 0 6px',
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
          >
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Readiness Score
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
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
