'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CommandPalette.module.css';
import { useCareer } from '@/context/CareerContext';
import { showToast } from '@/components/Toast';
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
  { section: 'Career OS Actions', icon: IconSkills, label: 'Calibrate Career Target & Track', desc: 'Select target technical role, experience, and baseline skills', action: 'calibrate' },
  { section: 'Career OS Actions', icon: IconResume, label: 'Copy LaTeX Resume (Overleaf Ready)', desc: 'Copy formatted LaTeX source code to clipboard', action: 'copy-latex' },
  { section: 'Career OS Actions', icon: IconSandbox, label: 'FlashAttention & GPU VRAM Sandbox', desc: 'Model SRAM tiling and KV-cache GPU memory', href: '/algorithm-sandbox' },
  { section: 'Career OS Actions', icon: IconDashboard, label: 'Toggle Benchmark Demo Profile', desc: 'Switch between benchmark showcase and authentic user state', action: 'toggle-demo' },

  { section: 'Navigation', icon: IconDashboard, label: 'Overview', desc: 'Main dashboard, readiness telemetry & next best action', href: '/' },
  { section: 'Navigation', icon: IconAnalytics, label: 'Career Analytics', desc: 'Progression trajectory, radar data & pipeline funnel', href: '/analytics' },
  { section: 'Navigation', icon: IconJobs, label: 'Application Pipeline', desc: 'Kanban board & interview round tracker', href: '/job-tracker' },
  { section: 'Navigation', icon: IconSalary, label: 'Salary Benchmarks', desc: 'Compensation percentiles & negotiation scripts', href: '/salary-insights' },
  { section: 'Navigation', icon: IconCoverLetter, label: 'Cover Letter & Pitch Studio', desc: 'Role-tailored letters & recruiter InMail pitch', href: '/cover-letter' },
  { section: 'Navigation', icon: IconATS, label: 'ATS Scanner & Keyword Matcher', desc: 'Keyword match & unmentioned project proof detection', href: '/ats-checker' },
  { section: 'Navigation', icon: IconAssessment, label: 'Technical Assessment', desc: '15-min timed mock interview rounds & grading', href: '/mock-interview' },
  { section: 'Navigation', icon: IconInterview, label: 'Question Bank', desc: 'System design, math invariants & discussion points', href: '/interview-prep' },
  { section: 'Navigation', icon: IconSandbox, label: 'Math Sandbox', desc: 'Interactive FlashAttention, Gradient Descent & Softmax', href: '/algorithm-sandbox' },
  { section: 'Navigation', icon: IconCoding, label: 'Coding Tracker', desc: 'LeetCode, Kaggle & algorithm difficulty ledger', href: '/coding-tracker' },
  { section: 'Navigation', icon: IconSkills, label: 'Skill Gap Map', desc: 'Competency radar & 4-tier evidence verification', href: '/skills' },
  { section: 'Navigation', icon: IconProjects, label: 'Portfolio Case Studies', desc: 'Architectural case studies, metrics & benchmarks', href: '/projects' },
  { section: 'Navigation', icon: IconBlueprints, label: 'Project Blueprints', desc: 'STAR system architecture generator', href: '/project-generator' },
  { section: 'Navigation', icon: IconCertifications, label: 'Certifications', desc: 'Credential archive & verified badges', href: '/certifications' },
  { section: 'Navigation', icon: IconResources, label: 'Reading Index', desc: 'Curated technical reference library & papers', href: '/resources' },
  { section: 'Navigation', icon: IconResume, label: 'ATS Resume Builder', desc: 'ATS resume editor, markdown & Overleaf LaTeX export', href: '/resume-builder' },
  { section: 'Navigation', icon: IconGitHub, label: 'GitHub Sync', desc: 'Analyze repositories & codebase proof', href: '/github' },
  { section: 'Navigation', icon: IconPortfolio, label: 'Public Recruiter Profile', desc: 'Recruiter-facing verified showcase', href: '/portfolio/sharvin' },

  { section: 'Data & Portability', icon: IconResume, label: 'Download Full JSON Backup', desc: 'Export full career data JSON archive', action: 'backup' },
  { section: 'Data & Portability', icon: IconResume, label: 'Export JSON Resume Schema', desc: 'Official jsonresume.org standard schema export', action: 'jsonresume' },
  { section: 'Atmosphere', icon: IconSandbox, label: 'Toggle Atmosphere (Day / Night Mode)', desc: 'Switch between Day (Light) and Night (Dark) mode', action: 'toggle-theme' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();
  const { toggleDemoMode } = useCareer();

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
    } else if (cmd.action === 'calibrate') {
      router.push('/');
      showToast('Opening Career Target Calibration on Overview...', 'info');
    } else if (cmd.action === 'toggle-demo') {
      toggleDemoMode();
    } else if (cmd.action === 'copy-latex') {
      router.push('/resume-builder');
      showToast('Navigating to Resume Builder (LaTeX Export Ready)', 'info');
    } else if (cmd.action === 'toggle-theme') {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.add('theme-transitioning');
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('catalyst-theme', nextTheme);
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
      showToast(`Atmosphere switched to ${nextTheme === 'dark' ? 'Night (Architectural Dark)' : 'Day (Editorial Light)'}`, 'info');
    } else if (cmd.action === 'backup') {
      window.open('/api/backup', '_blank');
      showToast('Downloading complete Career OS JSON snapshot...', 'success');
    } else if (cmd.action === 'jsonresume') {
      window.open('/api/backup?format=jsonresume', '_blank');
      showToast('Downloading JSONResume schema export...', 'success');
    }
  };

  const handleKeyDownNav = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Type a command or jump to destination... (Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownNav}
          />
          <span className={styles.shortcutTag}>ESC</span>
        </div>

        <div className={styles.resultsList}>
          {filteredCommands.length === 0 ? (
            <div className={styles.emptyState}>No matching commands or routes found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.label + idx}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={styles.itemIconWrap}>
                    <Icon size={16} />
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemLabel}>{cmd.label}</div>
                    <div className={styles.itemDesc}>{cmd.desc}</div>
                  </div>
                  <span className={styles.itemSection}>{cmd.section}</span>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <span><strong>↑↓</strong> Navigate</span>
          <span><strong>Enter</strong> Select</span>
          <span><strong>Esc</strong> Close</span>
          <span><strong>Ctrl+K</strong> Anywhere</span>
        </div>
      </div>
    </div>
  );
}
