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
    detail: 'Measures 99th percentile token latency on NVIDIA H100 SXM5 GPUs using custom C++/Triton SRAM tiled kernels.',
  },
  {
    id: 'comp',
    icon: '📈',
    label: 'SENIOR ML MEDIAN COMP',
    value: '$345,000 Total Comp',
    change: 'Top 10% Percentile',
    detail: 'Market benchmark for L5/L6 ML & Systems Engineers across SF/NY/Remote frontier AI labs (Base + 4-Yr RSU + Bonus).',
  },
  {
    id: 'skill',
    icon: '🎯',
    label: 'TOP DEMANDED SKILL',
    value: 'CUDA & Triton GPU Programming',
    change: '+48% YoY Growth',
    detail: 'Hiring demand index tracking technical job listings requiring low-level GPU acceleration and kernel fusion.',
  },
  {
    id: 'flashattn',
    icon: '🟢',
    label: 'FLASHATTENTION-2 SAVINGS',
    value: '7.2x Less HBM Memory I/O',
    change: 'SRAM Tiled',
    detail: 'Bandwidth savings achieved by calculating online softmax in on-chip SRAM instead of materializing N×N attention in HBM.',
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
    detail: 'Memory footprint reduction achieved by sharing Key-Value heads across Query heads during multi-token autoregressive decoding.',
  },
];

export default function LiveTelemetryTicker() {
  const [mode, setMode] = useState('slide'); // 'slide' (calm readable presentation) | 'marquee' (gentle continuous crawl)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Auto-advance in slide mode every 5.5 seconds unless paused
  useEffect(() => {
    if (mode !== 'slide' || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TELEMETRY_FEED.length);
    }, 5500);
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

        {/* Slide Mode (Calm, 100% human-readable view) */}
        {mode === 'slide' ? (
          <div className={styles.slideWrapper} onClick={() => setSelectedDetail(currentItem)}>
            <div className={styles.slideItem} key={currentIndex}>
              <span className={styles.itemIcon}>{currentItem.icon}</span>
              <span className={styles.itemLabel}>{currentItem.label}:</span>
              <strong className={styles.itemValue}>{currentItem.value}</strong>
              <span className={styles.itemChange}>[{currentItem.change}]</span>
              <span className={styles.infoHint}>ℹ Click for details</span>
            </div>

            {/* Stepper Controls */}
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
                {currentIndex + 1}/{TELEMETRY_FEED.length}
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
                {isPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>
        ) : (
          /* Marquee Mode (Ultra-Slow Crawl) */
          <div className={styles.trackWrapper}>
            <div className={`${styles.track} ${isPaused ? styles.paused : ''}`}>
              {[...TELEMETRY_FEED, ...TELEMETRY_FEED].map((item, idx) => (
                <div key={idx} className={styles.tickerItem} onClick={() => setSelectedDetail(item)}>
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <span className={styles.itemLabel}>{item.label}:</span>
                  <strong className={styles.itemValue}>{item.value}</strong>
                  <span className={styles.itemChange}>[{item.change}]</span>
                  <span className={styles.separator}>•</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className={styles.modeToggleWrapper}>
          <button
            type="button"
            className={styles.modeToggleBtn}
            onClick={() => setMode(mode === 'slide' ? 'marquee' : 'slide')}
            title="Toggle between Step Slides and Continuous Glide"
          >
            {mode === 'slide' ? '↔ GLIDE VIEW' : '📑 STEP VIEW'}
          </button>
        </div>
      </div>

      {/* Benchmark Explanatory Modal */}
      {selectedDetail && (
        <div className="modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{selectedDetail.icon}</span>
                <h3 className="modal-title">{selectedDetail.label}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedDetail(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CURRENT BENCHMARK VALUE</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedDetail.value} <span style={{ color: 'var(--green)', fontSize: '12px' }}>[{selectedDetail.change}]</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  REAL-WORLD ENGINEERING CONTEXT
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
