'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';
import ThemeToggle from './ThemeToggle';
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

const PRIMARY_TABS = [
  { href: '/', label: 'Overview', icon: IconDashboard },
  { href: '/job-tracker', label: 'Pipeline', icon: IconJobs },
  { href: '/skills', label: 'Skills', icon: IconSkills },
  { href: '/projects', label: 'Projects', icon: IconProjects },
];

const MORE_SECTIONS = [
  {
    title: 'INDEX',
    items: [
      { href: '/', label: 'Overview & Narrative', icon: IconDashboard },
      { href: '/analytics', label: 'Career Analytics & Funnel', icon: IconAnalytics },
    ],
  },
  {
    title: 'OPPORTUNITIES',
    items: [
      { href: '/job-tracker', label: 'Application Pipeline & Kanban', icon: IconJobs },
      { href: '/salary-insights', label: 'Salary Intelligence & Benchmarks', icon: IconSalary },
      { href: '/cover-letter', label: 'Cover Pitch & Recruiter Studio', icon: IconCoverLetter },
      { href: '/ats-checker', label: 'ATS Scanner & Keyword Injector', icon: IconATS },
    ],
  },
  {
    title: 'TECHNICAL CORE',
    items: [
      { href: '/mock-interview', label: '15-Min Mock Assessment', icon: IconAssessment },
      { href: '/interview-prep', label: 'System Design & DS Bank', icon: IconInterview },
      { href: '/algorithm-sandbox', label: 'Mathematical Simulator', icon: IconSandbox },
      { href: '/coding-tracker', label: 'Coding Ledger & Solutions', icon: IconCoding },
      { href: '/skills', label: 'Competency Radar & Gap Map', icon: IconSkills },
    ],
  },
  {
    title: 'PORTFOLIO & PROOF',
    items: [
      { href: '/projects', label: 'Portfolio Architecture Case Studies', icon: IconProjects },
      { href: '/project-generator', label: 'STAR System Blueprints', icon: IconBlueprints },
      { href: '/certifications', label: 'Verified Credential Archive', icon: IconCertifications },
      { href: '/resources', label: 'Technical Reading Index', icon: IconResources },
      { href: '/resume-builder', label: 'ATS Resume Builder & Export', icon: IconResume },
      { href: '/github', label: 'GitHub Sync & Repository Ledger', icon: IconGitHub },
      { href: '/portfolio/sharvin', label: 'Public Recruiter Showcase', icon: IconPortfolio },
    ],
  },
];

import { useCareer } from '@/context/CareerContext';

export default function MobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { readiness } = useCareer();

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreOpen]);

  return (
    <>
      {/* ─── Fixed Bottom Navigation Bar ──────────────────────────── */}
      <nav className={styles.bottomNav} aria-label="Mobile Navigation">
        <div className={styles.tabContainer}>
          {PRIMARY_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={styles.iconWrap}>
                  <Icon size={18} />
                  {isActive && <span className={styles.activeDot} />}
                </div>
                <span className={styles.tabLabel}>{tab.label}</span>
              </Link>
            );
          })}

          {/* More Sheet Trigger */}
          <button
            type="button"
            className={`${styles.tabBtn} ${isMoreOpen ? styles.activeTab : ''}`}
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            aria-expanded={isMoreOpen}
            aria-label="Open More Destinations"
          >
            <div className={styles.iconWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              {isMoreOpen && <span className={styles.activeDot} />}
            </div>
            <span className={styles.tabLabel}>More</span>
          </button>
        </div>
      </nav>

      {/* ─── More Bottom Sheet Overlay & Drawer ─────────────────────── */}
      {isMoreOpen && (
        <div className={styles.backdrop} onClick={() => setIsMoreOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            {/* Sheet Handle */}
            <div className={styles.dragHandleWrap}>
              <div className={styles.dragHandle} />
            </div>

            {/* Sheet Header */}
            <div className={styles.sheetHeader}>
              <div>
                <div className={styles.sheetBrand}>CATALYST OS</div>
                <div className={styles.sheetSubtitle}>
                  {readiness?.targetRoleTitle || 'ML Engineer'} • {readiness?.overallScore || 84}% Readiness
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThemeToggle showLabel={false} />
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsMoreOpen(false)}
                  aria-label="Close Sheet"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sheet Scrollable Links */}
            <div className={styles.sheetBody}>
              {MORE_SECTIONS.map((sec) => (
                <div key={sec.title} className={styles.secGroup}>
                  <div className={styles.secTitle}>{sec.title}</div>
                  <div className={styles.linkList}>
                    {sec.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${styles.sheetLink} ${isActive ? styles.sheetLinkActive : ''}`}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Icon size={16} style={{ opacity: isActive ? 1 : 0.6 }} />
                            <span>{item.label}</span>
                          </span>
                          {isActive && <span className={styles.linkActiveIndicator}>●</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
