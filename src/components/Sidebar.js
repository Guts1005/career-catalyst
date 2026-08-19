'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      { href: '/cover-letter', label: 'Cover Pitch', icon: IconCoverLetter },
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
      { href: '/projects', label: 'Projects', icon: IconProjects },
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
  const [readinessScore, setReadinessScore] = useState(0);

  const fetchReadiness = useCallback(async () => {
    try {
      const res = await fetch('/api/readiness');
      if (res.ok) {
        const data = await res.json();
        setReadinessScore(data.score || 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchReadiness();
    const interval = setInterval(fetchReadiness, 30000);
    return () => clearInterval(interval);
  }, [fetchReadiness]);

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
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: '4px',
          padding: '6px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'none',
        }}
        className="sidebar-mobile-toggle"
        aria-label="Toggle Navigation"
      >
        {isOpen ? '✕ CLOSE' : '☰ MENU'}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.4)',
            zIndex: 99,
          }}
        />
      )}

      <aside
        className={isOpen ? 'open' : ''}
        style={{
          width: 'var(--sidebar-width)',
          flexShrink: 0,
          minHeight: '100vh',
          background: 'var(--white)',
          borderRight: '1px solid var(--gray-100)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
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
              marginBottom: '28px',
              paddingLeft: '6px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                fontSize: '15px',
                letterSpacing: '-0.03em',
                color: 'var(--black)',
                textTransform: 'uppercase',
              }}
            >
              CATALYST OS
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--gray-400)',
              }}
            >
              v2.5
            </span>
          </Link>

          {/* Grouped Navigation */}
          <nav>
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--gray-400)',
                    marginBottom: '6px',
                    paddingLeft: '6px',
                  }}
                >
                  {section.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
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
                          padding: '6px 8px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontSize: '12.5px',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'var(--black)' : 'var(--gray-600)',
                          background: isActive ? 'var(--off-white)' : 'transparent',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
                          {item.label}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: 'var(--black)',
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

        {/* Readiness Status Ledger */}
        <div
          style={{
            padding: '12px 10px',
            borderTop: '1px solid var(--gray-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              Readiness Score
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>
              {readinessScore}%
            </div>
          </div>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
        </div>
      </aside>
    </>
  );
}
