'use client';

import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ showLabel = true, className = '' }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const updated = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(updated);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Add smooth transition class to documentElement
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', nextTheme);

    try {
      localStorage.setItem('catalyst-theme', nextTheme);
    } catch {
      /* ignore */
    }

    setTheme(nextTheme);

    // Remove transition class after 500ms
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 550);
  };

  if (!mounted) {
    return (
      <button className={`${styles.toggleBtn} ${className}`} type="button" aria-label="Toggle Theme">
        <span className={styles.iconContainer}>
          <span className={styles.sunIcon} />
        </span>
        {showLabel && <span className={styles.label}>THEME</span>}
      </button>
    );
  }

  return (
    <button
      className={`${styles.toggleBtn} ${theme === 'dark' ? styles.isDark : ''} ${className}`}
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className={styles.iconContainer}>
        {theme === 'dark' ? (
          <svg className={styles.moonIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className={styles.sunIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
      {showLabel && (
        <span className={styles.label}>
          {theme === 'dark' ? 'NIGHT' : 'DAY'}
        </span>
      )}
    </button>
  );
}
