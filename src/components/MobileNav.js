'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';
import ThemeToggle from './ThemeToggle';
import { NAVIGATION_PHASES, SECONDARY_NAV_ITEMS, MOBILE_PRIMARY_TABS } from '@/config/navigation';
import { useCareer } from '@/context/CareerContext';

export default function MobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { readiness } = useCareer();

  const handleOpenMore = () => {
    setIsClosing(false);
    setIsMoreOpen(true);
  };

  const handleCloseMore = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsMoreOpen(false);
      setIsClosing(false);
    }, 240);
  }, [isClosing]);

  const toggleMore = () => {
    if (isMoreOpen && !isClosing) {
      handleCloseMore();
    } else if (!isMoreOpen) {
      handleOpenMore();
    }
  };

  useEffect(() => {
    if (isMoreOpen) {
      handleCloseMore();
    }
  }, [pathname, handleCloseMore, isMoreOpen]);

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
      <nav className={styles.bottomNav} aria-label="Mobile Bottom Navigation">
        <div className={styles.tabContainer}>
          {MOBILE_PRIMARY_TABS.map((tab) => {
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
            onClick={toggleMore}
            aria-expanded={isMoreOpen}
            aria-label="Open Full 4-Phase Career Menu"
          >
            <div className={styles.iconWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </div>
            <span className={styles.tabLabel}>+ MORE</span>
          </button>
        </div>
      </nav>

      {/* ─── Slide-Up Full Drawer (Bottom Sheet) ──────────────────── */}
      {isMoreOpen && (
        <div className={styles.sheetOverlay} onClick={handleCloseMore} aria-hidden="true" />
      )}

      {isMoreOpen && (
        <div
          className={`${styles.bottomSheet} ${isClosing ? styles.closing : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Full Career Navigation Menu"
        >
          {/* Grab Handle */}
          <div className={styles.sheetHandleArea} onClick={handleCloseMore}>
            <div className={styles.sheetHandle} />
          </div>

          {/* Sheet Header */}
          <div className={styles.sheetHeader}>
            <div>
              <div className={styles.sheetTitle}>CATALYST OS CAREER PHASES</div>
              <div className={styles.sheetSubtitle}>
                Readiness Score: <strong style={{ color: 'var(--green)' }}>{readiness?.overallScore || 84}%</strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThemeToggle />
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleCloseMore}
                aria-label="Close navigation sheet"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Semantic 4-Phase Sections in Drawer */}
          <div className={styles.sheetContent}>
            {NAVIGATION_PHASES.map((phase) => (
              <div key={phase.id} className={styles.sheetSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>{phase.phaseNumber}</span>
                  <span className={styles.sectionTitle}>{phase.title}</span>
                </div>

                <div className={styles.gridContainer}>
                  {phase.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.sheetItem} ${isActive ? styles.activeSheetItem : ''}`}
                        onClick={handleCloseMore}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className={styles.itemIconWrap}>
                          <Icon size={16} />
                        </div>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemLabel}>{item.label}</span>
                        </div>
                        {isActive && <span className={styles.sheetActivePill}>ACTIVE</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Showcase & Labs */}
            <div className={styles.sheetSection} style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>SHOWCASE & LABS</span>
              </div>

              <div className={styles.gridContainer}>
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.sheetItem} ${isActive ? styles.activeSheetItem : ''}`}
                      onClick={handleCloseMore}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className={styles.itemIconWrap}>
                        <Icon size={16} />
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemLabel}>{item.label}</span>
                      </div>
                      {isActive && <span className={styles.sheetActivePill}>ACTIVE</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
