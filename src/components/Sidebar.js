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
  IconSearch,
} from './Icons';

const NAV_ITEMS = [
  { section: 'Platform' },
  { href: '/', label: 'Overview', icon: IconDashboard },
  { href: '/analytics', label: 'Analytics', icon: IconAnalytics },
  { section: 'Career Suite' },
  { href: '/resume-builder', label: 'Resume Builder', icon: IconResume },
  { href: '/cover-letter', label: 'Cover Letter & Pitch', icon: IconCoverLetter },
  { href: '/job-tracker', label: 'Applications', icon: IconJobs },
  { href: '/interview-prep', label: 'Interview Bank', icon: IconInterview },
  { href: '/mock-interview', label: 'Technical Assessment', icon: IconAssessment },
  { section: 'Engineering & Skills' },
  { href: '/certifications', label: 'Certifications', icon: IconCertifications },
  { href: '/projects', label: 'Projects', icon: IconProjects },
  { href: '/project-generator', label: 'Blueprints', icon: IconBlueprints },
  { href: '/coding-tracker', label: 'Coding Tracker', icon: IconCoding },
  { href: '/algorithm-sandbox', label: 'Math Sandbox', icon: IconSandbox },
  { href: '/skills', label: 'Skill Map', icon: IconSkills },
  { href: '/resources', label: 'Learning Hub', icon: IconResources },
  { section: 'Market Intelligence' },
  { href: '/salary-insights', label: 'Salary Benchmarks', icon: IconSalary },
  { href: '/ats-checker', label: 'ATS Parser', icon: IconATS },
  { href: '/github', label: 'GitHub Sync', icon: IconGitHub },
  { href: '/portfolio/sharvin', label: 'Public Profile', icon: IconPortfolio },
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
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        id="sidebar-toggle"
        aria-label="Toggle sidebar"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '-0.05em',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              C
            </div>
            <div>
              <div className="sidebar-brand-text" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Catalyst OS
              </div>
              <div className="sidebar-brand-subtitle" style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ML & Data Systems
              </div>
            </div>
          </div>

          <button
            className="sidebar-search-btn"
            style={{
              width: '100%',
              marginTop: '14px',
              padding: '7px 10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconSearch size={13} /> Quick Search...
            </span>
            <kbd style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 5px', borderRadius: '3px', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, i) => {
            if (item.section) {
              return (
                <div key={`section-${i}`} className="sidebar-section-label">
                  {item.section}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                id={`nav-${item.href.replace('/', '') || 'dashboard'}`}
              >
                <span className="sidebar-icon">
                  <IconComponent size={15} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-readiness" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Profile Score</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{readinessScore}%</span>
            </div>
            <div className="sidebar-readiness-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="sidebar-readiness-fill"
                style={{
                  width: `${readinessScore}%`,
                  background: readinessScore >= 75 ? 'var(--success)' : 'var(--accent)',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
