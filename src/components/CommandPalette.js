'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CommandPalette.module.css';
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

const COMMANDS = [
  { section: 'Navigation', icon: IconDashboard, label: 'Overview', desc: 'Main dashboard & metric KPIs', href: '/' },
  { section: 'Navigation', icon: IconResume, label: 'Resume Builder', desc: 'ATS resume editor & PDF export', href: '/resume-builder' },
  { section: 'Navigation', icon: IconCoverLetter, label: 'Cover Letter & Pitch', desc: 'Role-tailored letters & recruiter pitch', href: '/cover-letter' },
  { section: 'Navigation', icon: IconJobs, label: 'Applications Pipeline', desc: 'Kanban board & skill matcher', href: '/job-tracker' },
  { section: 'Navigation', icon: IconInterview, label: 'Interview Bank', desc: '50+ DS/ML flashcards & solutions', href: '/interview-prep' },
  { section: 'Navigation', icon: IconAssessment, label: 'Technical Assessment', desc: '15-min timed mock interview rounds', href: '/mock-interview' },
  { section: 'Navigation', icon: IconBlueprints, label: 'Project Blueprints', desc: 'STAR architecture generator', href: '/project-generator' },
  { section: 'Navigation', icon: IconCoding, label: 'Coding Tracker', desc: 'LeetCode & Kaggle progress tracking', href: '/coding-tracker' },
  { section: 'Navigation', icon: IconSandbox, label: 'Math Sandbox', desc: 'Interactive Gradient Descent & Attention', href: '/algorithm-sandbox' },
  { section: 'Navigation', icon: IconCertifications, label: 'Certifications', desc: 'Credential manager & skill leveling', href: '/certifications' },
  { section: 'Navigation', icon: IconProjects, label: 'Projects Manager', desc: 'Project milestone checklist & impact', href: '/projects' },
  { section: 'Navigation', icon: IconSkills, label: 'Skill Map', desc: 'Competency radar & gap analysis', href: '/skills' },
  { section: 'Navigation', icon: IconResources, label: 'Learning Hub', desc: 'Curated technical reference library', href: '/resources' },
  { section: 'Market Intelligence', icon: IconSalary, label: 'Salary Benchmarks', desc: 'Compensation percentiles & negotiation scripts', href: '/salary-insights' },
  { section: 'Market Intelligence', icon: IconATS, label: 'ATS Parser', desc: 'Keyword match & structural evaluation', href: '/ats-checker' },
  { section: 'Market Intelligence', icon: IconGitHub, label: 'GitHub Sync', desc: 'Analyze repositories & language metrics', href: '/github' },
  { section: 'Market Intelligence', icon: IconPortfolio, label: 'Public Profile', desc: 'Recruiter-facing verified showcase', href: '/portfolio/sharvin' },
  { section: 'Market Intelligence', icon: IconAnalytics, label: 'Career Analytics', desc: 'Data visualization & pipeline funnel', href: '/analytics' },
  { section: 'Data & Portability', icon: IconResume, label: 'Download JSON Snapshot', desc: 'Export full career data JSON archive', action: 'backup' },
  { section: 'Data & Portability', icon: IconResume, label: 'Export JSON Resume Schema', desc: 'Official jsonresume.org standard export', action: 'jsonresume' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.desc.toLowerCase().includes(q) ||
      cmd.section.toLowerCase().includes(q)
    );
  });

  const handleSelect = async (cmd) => {
    setIsOpen(false);
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action === 'backup') {
      window.open('/api/backup', '_blank');
    } else if (cmd.action === 'jsonresume') {
      window.open('/api/backup?format=jsonresume', '_blank');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <span className={styles.searchIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type a command or search tools..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className={styles.escBadge}>ESC</span>
        </div>

        <div className={styles.resultsList}>
          {filteredCommands.length === 0 ? (
            <div className={styles.noResults}>No matching tools or actions found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const IconComp = cmd.icon;
              return (
                <div
                  key={`${cmd.label}-${idx}`}
                  className={`${styles.item} ${idx === selectedIndex ? styles.itemActive : ''}`}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={styles.itemIcon}>
                    <IconComp size={15} />
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemLabel}>{cmd.label}</div>
                    <div className={styles.itemDesc}>{cmd.desc}</div>
                  </div>
                  <div className={styles.itemCategory}>{cmd.section}</div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
