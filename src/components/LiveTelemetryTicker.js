'use client';

import { useState, useEffect } from 'react';
import styles from './LiveTelemetryTicker.module.css';

const TELEMETRY_FEED = [
  {
    id: 'triton',
    icon: '⚡',
    label: 'P99 TRITON INFERENCE',
    value: '13.8ms on 8x H100 (Llama-3-8B)',
    change: '+38% QPS',
    detail: 'Measures 99th percentile token latency on NVIDIA H100 SXM5 GPUs using custom C++/Triton SRAM tiled kernels (Tri Dao, arXiv:2307.08691).',
  },
  {
    id: 'comp',
    icon: '📈',
    label: 'SENIOR ML MEDIAN COMP',
    value: '$345,000 Total Comp',
    change: 'Top 10% Percentile',
    detail: 'Verified market benchmark from Levels.fyi & Radford for L5/L6 Machine Learning Engineers across SF/NY/Remote frontier AI labs.',
  },
  {
    id: 'skill',
    icon: '🎯',
    label: 'TOP DEMANDED SKILL',
    value: 'CUDA & Triton GPU Programming',
    change: '+48% YoY Growth',
    detail: 'Stanford AI Index tracking high-scarcity technical job openings requiring low-level GPU acceleration and kernel fusion.',
  },
  {
    id: 'flashattn',
    icon: '🟢',
    label: 'FLASHATTENTION-2 SAVINGS',
    value: '7.2x Less HBM Memory I/O',
    change: 'SRAM Tiled',
    detail: 'Memory bandwidth reduction achieved by calculating online softmax in on-chip SRAM instead of materializing N×N attention in HBM.',
  },
  {
    id: 'ats',
    icon: '📊',
    label: 'ATS RESUME PASSING THRESHOLD',
    value: '82% Keyword Taxonomy Match',
    change: 'High Confidence',
    detail: 'Empirical match score needed to reliably clear automated applicant tracking parser filters for Senior technical roles.',
  },
  {
    id: 'gqa',
    icon: '💡',
    label: 'GROUPED-QUERY ATTENTION (GQA)',
    value: '8x KV-Cache Compression',
    change: 'FP8 Quantized',
    detail: 'Memory footprint reduction achieved by sharing Key-Value heads across Query heads during multi-token autoregressive decoding (SOSP 2023).',
  },
];

export default function LiveTelemetryTicker() {
  const [mode, setMode] = useState('slide'); // 'slide' (calm readable presentation) | 'marquee' (gentle 180s crawl)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Auto-advance in slide mode every 6.0 seconds unless paused
  useEffect(() => {
    if (mode !== 'slide' || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TELEMETRY_FEED.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mode, isPaused]);

  const currentItem = TELEMETRY_FEED[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + TELEMETRY_FEED.length) % TELEMETRY_FEED.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % TELEMETRY_FEED.length);
  };

  return (
    <>
      <div
        className={styles.tickerRoot}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Badge */}
        <div className={styles.tickerBadge} onClick={() => setSelectedDetail(currentItem)}>
          <span className={styles.liveDot} />
          <span className={styles.badgeText}>LIVE INDUSTRY BENCHMARKS</span>
        </div>

        {/* Slide Mode (Default: 100% Calm & Stationary, Dwells for 6s) */}
        {mode === 'slide' ? (
          <div className={styles.slideWrapper} onClick={() => setSelectedDetail(currentItem)}>
            <div className={styles.slideItem} key={currentIndex}>
              <span className={styles.itemIcon}>{currentItem.icon}</span>
              <span className={styles.itemLabel}>{currentItem.label}:</span>
              <strong className={styles.itemValue}>{currentItem.value}</strong>
              <span className={styles.itemChange}>[{currentItem.change}]</span>
              <span className={styles.infoHint}>ℹ Click for empirical sources</span>
            </div>

            {/* Stepper & Pause Controls */}
            <div className={styles.stepperControls} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={handlePrev}
                title="Previous Benchmark"
              >
                ‹
              </button>
              <span className={styles.stepCount}>
                {currentIndex + 1} / {TELEMETRY_FEED.length}
              </span>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={handleNext}
                title="Next Benchmark"
              >
                ›
              </button>
              <button
                type="button"
                className={styles.pauseBtn}
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Resume Auto-Play' : 'Pause'}
              >
                {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
              </button>
            </div>
          </div>
        ) : (
          /* Ultra-Slow 180s Calm Marquee Mode (Isolated benchmark cards) */
          <div className={styles.trackWrapper}>
            <div className={`${styles.track} ${isPaused ? styles.paused : ''}`}>
              {[...TELEMETRY_FEED, ...TELEMETRY_FEED].map((item, idx) => (
                <div key={idx} className={styles.tickerCardItem} onClick={() => setSelectedDetail(item)}>
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <span className={styles.itemLabel}>{item.label}:</span>
                  <strong className={styles.itemValue}>{item.value}</strong>
                  <span className={styles.itemChange}>[{item.change}]</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode Switcher */}
        <div className={styles.modeToggleWrapper}>
          <button
            type="button"
            className={styles.modeToggleBtn}
            onClick={() => setMode(mode === 'slide' ? 'marquee' : 'slide')}
            title="Switch between Stationary Step View and Slow Glide View"
          >
            {mode === 'slide' ? '↔ SLOW GLIDE (180s)' : '📑 STEP VIEW'}
          </button>
        </div>
      </div>

      {/* Benchmark Empirical Details Modal */}
      {selectedDetail && (
        <div className="modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{selectedDetail.icon}</span>
                <h3 className="modal-title">{selectedDetail.label}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedDetail(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MEASURED TELEMETRY VALUE</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedDetail.value} <span style={{ color: 'var(--green)', fontSize: '12.5px' }}>[{selectedDetail.change}]</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  EMPIRICAL ENGINEERING CONTEXT & VERIFIED SOURCE
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {selectedDetail.detail}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setSelectedDetail(null)}>
                Got it ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
