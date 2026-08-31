'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './OrientationBanner.module.css';

export default function OrientationBanner({ nextBestAction, onOpenCalibration }) {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem('catalyst_orientation_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalyst_orientation_dismissed', 'true');
    }
  };

  const handleReopen = () => {
    setIsVisible(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('catalyst_orientation_dismissed');
    }
  };

  // Allow global re-trigger if needed
  useEffect(() => {
    const handleGlobalTrigger = () => handleReopen();
    window.addEventListener('catalyst:reopen-orientation', handleGlobalTrigger);
    return () => window.removeEventListener('catalyst:reopen-orientation', handleGlobalTrigger);
  }, []);

  if (!mounted || !isVisible) {
    return null;
  }

  const steps = [
    {
      num: '01',
      title: '1. Know Your Status',
      desc: 'Evaluate 4-pillar readiness score calibrated against frontier AI hiring bars.',
    },
    {
      num: '02',
      title: '2. Build Proof',
      desc: 'Verify Triton/CUDA GPU kernels, cloud certifications, and systems code.',
    },
    {
      num: '03',
      title: '3. Land the Role',
      desc: 'Match target JDs and inject verified project proof (+INJECT) into resumes.',
    },
    {
      num: '04',
      title: '4. Interview & Close',
      desc: 'Master technical system design flashcards and model 4-year equity packages.',
    },
  ];

  return (
    <section className={styles.orientationWrapper} aria-label="Welcome and Career Operating System Guide">
      <div className={styles.orientationHeader}>
        <div className={styles.titleArea}>
          <div className={styles.modeBadge}>
            ● PUBLIC DEMONSTRATION MODE
          </div>
          <h2 className={styles.heading}>
            Welcome to Catalyst OS — The Career Operating System
          </h2>
          <p className={styles.subtitle}>
            A connected engineering command center that replaces fragmented developer trackers with a continuous, verified hiring pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className={styles.dismissBtn}
          aria-label="Dismiss welcome orientation"
          title="Dismiss orientation banner (you can reopen it anytime)"
        >
          DISMISS ×
        </button>
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <div key={step.num} className={styles.stepCard}>
            <span className={styles.stepNumber}>{step.num}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.ctaGroup}>
          {nextBestAction?.actionUrl && (
            <Link href={nextBestAction.actionUrl} className={styles.primaryCta}>
              START WITH NEXT BEST ACTION →
            </Link>
          )}
          {onOpenCalibration && (
            <button
              type="button"
              onClick={onOpenCalibration}
              className={styles.secondaryCta}
            >
              CALIBRATE TARGET ROLE ⚙
            </button>
          )}
        </div>

        <div className={styles.tipText}>
          💡 Switch personas above to preview ML Systems, AI/RAG, and Lakehouse tracks.
        </div>
      </div>
    </section>
  );
}
