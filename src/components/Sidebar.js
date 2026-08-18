'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { section: 'Overview' },
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/analytics', label: 'Career Analytics', icon: '📈' },
  { section: 'Career Suite' },
  { href: '/resume-builder', label: 'Resume Studio', icon: '📄' },
  { href: '/cover-letter', label: 'Cover Letter & Pitch', icon: '📝' },
  { href: '/job-tracker', label: 'Job Pipeline', icon: '📌' },
  { href: '/interview-prep', label: 'Interview Prep Hub', icon: '🧠' },
  { href: '/mock-interview', label: 'Mock Simulator', icon: '🎙️' },
  { section: 'Skills & Innovation' },
  { href: '/certifications', label: 'Certifications', icon: '🏆' },
  { href: '/projects', label: 'Portfolio Projects', icon: '🚀' },
  { href: '/project-generator', label: 'Project Blueprints', icon: '💡' },
  { href: '/coding-tracker', label: 'Coding Arena', icon: '⚔️' },
  { href: '/algorithm-sandbox', label: 'Algorithm Sandbox', icon: '🔬' },
  { href: '/skills', label: 'Skill Map', icon: '🎯' },
  { href: '/resources', label: 'Learning Hub', icon: '📚' },
  { section: 'Intelligence & Market' },
  { href: '/salary-insights', label: 'Salary Intelligence', icon: '💰' },
  { href: '/ats-checker', label: 'ATS Checker', icon: '📋' },
  { href: '/github', label: 'GitHub Analyzer', icon: '🐙' },
  { href: '/portfolio/sharvin', label: 'Public Showcase', icon: '🌐' },
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
        setReadinessScore(data.score);
      }
    } catch (e) {
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
            <div className="sidebar-brand-icon">⚡</div>
            <div>
              <div className="sidebar-brand-text">Career Catalyst</div>
              <div className="sidebar-brand-subtitle">DS / ML / AI</div>
            </div>
          </div>
          <button
            className="sidebar-search-btn"
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '8px 12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }}
          >
            <span>🔍 Search Tools...</span>
            <span style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--border)' }}>Ctrl+K</span>
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
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                id={`nav-${item.href.replace('/', '') || 'dashboard'}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-readiness">
            <div className="sidebar-readiness-label">Resume Readiness</div>
            <div className="sidebar-readiness-score">{readinessScore}%</div>
            <div className="sidebar-readiness-bar">
              <div
                className="sidebar-readiness-fill"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
