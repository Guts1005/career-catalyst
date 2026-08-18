'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CommandPalette.module.css';

const COMMANDS = [
  { section: 'Navigation', icon: '📊', label: 'Dashboard', desc: 'Main overview and readiness score', href: '/' },
  { section: 'Navigation', icon: '📄', label: 'Resume Studio', desc: 'AI Resume Builder & PDF Exporter', href: '/resume-builder' },
  { section: 'Navigation', icon: '📝', label: 'Cover Letter & Recruiter Pitch', desc: 'Tailored letters & LinkedIn InMail outreach', href: '/cover-letter' },
  { section: 'Navigation', icon: '📌', label: 'Job Pipeline', desc: 'Kanban board & skill matcher', href: '/job-tracker' },
  { section: 'Navigation', icon: '🧠', label: 'Interview Prep Hub', desc: 'DS/ML flashcards & question bank', href: '/interview-prep' },
  { section: 'Navigation', icon: '🎙️', label: 'Mock Interview Simulator', desc: 'Timed 15-min rounds with live rubric grading', href: '/mock-interview' },
  { section: 'Navigation', icon: '💡', label: 'Project Blueprints', desc: 'STAR project ideas generator', href: '/project-generator' },
  { section: 'Navigation', icon: '⚔️', label: 'Coding Arena', desc: 'LeetCode & Kaggle progress tracker', href: '/coding-tracker' },
  { section: 'Navigation', icon: '🔬', label: 'Algorithm Sandbox', desc: 'Interactive Gradient Descent & Attention Math', href: '/algorithm-sandbox' },
  { section: 'Navigation', icon: '🏆', label: 'Certifications', desc: 'Manage credentials & auto-level skills', href: '/certifications' },
  { section: 'Navigation', icon: '🚀', label: 'Portfolio Projects', desc: 'Track projects & milestones', href: '/projects' },
  { section: 'Navigation', icon: '🎯', label: 'Skill Map', desc: 'Skill gap analysis & radar', href: '/skills' },
  { section: 'Navigation', icon: '📚', label: 'Learning Hub', desc: 'Courses, books, and tutorials', href: '/resources' },
  { section: 'Intelligence', icon: '💰', label: 'Salary Intelligence', desc: 'Market benchmarks & offer negotiation scripts', href: '/salary-insights' },
  { section: 'Intelligence', icon: '📋', label: 'ATS Checker', desc: 'Analyze resume for keyword matches', href: '/ats-checker' },
  { section: 'Intelligence', icon: '🐙', label: 'GitHub Analyzer', desc: 'Analyze profile & 1-click project import', href: '/github' },
  { section: 'Intelligence', icon: '🌐', label: 'Public Portfolio Showcase', desc: 'Verified profile page for recruiters', href: '/portfolio/sharvin' },
  { section: 'Intelligence', icon: '📈', label: 'Career Analytics', desc: 'Data visualization & insights', href: '/analytics' },
  { section: 'Data & Portability', icon: '💾', label: 'Backup Full Database', desc: 'Download JSON snapshot of your entire career portfolio', action: 'backup' },
  { section: 'Data & Portability', icon: '📄', label: 'Export JSON Resume Standard', desc: 'Download resume in jsonresume.org standard format', action: 'jsonresume' },
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
    if (!query.trim()) return true;
    const term = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(term) ||
      cmd.desc.toLowerCase().includes(term) ||
      cmd.section.toLowerCase().includes(term)
    );
  });

  const handleSelect = (cmd) => {
    setIsOpen(false);
    if (cmd.action === 'backup') {
      window.open('/api/backup', '_blank');
    } else if (cmd.action === 'jsonresume') {
      window.open('/api/backup?format=jsonresume', '_blank');
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  const handleInputKeyDown = (e) => {
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
    <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Type a command or search tools (e.g. Resume, Interview, Kaggle)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <span className={styles.shortcutBadge}>ESC</span>
        </div>

        <div className={styles.resultsList}>
          {filteredCommands.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matching commands or pages found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.href || cmd.label}
                className={`${styles.item} ${selectedIndex === idx ? styles.itemSelected : ''}`}
                onClick={() => handleSelect(cmd)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}>{cmd.icon}</span>
                  <div>
                    <div className={styles.itemLabel}>{cmd.label}</div>
                    <div className={styles.itemDesc}>{cmd.desc}</div>
                  </div>
                </div>
                <span className={styles.shortcutBadge}>Jump ↵</span>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerKeys}>
            <span><strong className={styles.shortcutBadge}>↑</strong> <strong className={styles.shortcutBadge}>↓</strong> Navigate</span>
            <span><strong className={styles.shortcutBadge}>↵</strong> Select</span>
            <span><strong className={styles.shortcutBadge}>ESC</strong> Close</span>
          </div>
          <div>Career Catalyst Spotlight</div>
        </div>
      </div>
    </div>
  );
}
