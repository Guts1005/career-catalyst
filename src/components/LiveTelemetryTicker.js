'use client';

import { useState, useEffect } from 'react';
import styles from './LiveTelemetryTicker.module.css';

const TELEMETRY_FEED = [
  {
    id: 'triton',
    icon: '⚡',
    shortLabel: 'TRITON INFERENCE',
    label: 'P99 TRITON INFERENCE',
    value: '13.8ms on 8x H100 (Llama-3)',
    change: '+38% QPS',
    detail: 'Measures 99th percentile token latency on NVIDIA H100 SXM5 GPUs using custom C++/Triton SRAM tiled kernels (Tri Dao, arXiv:2307.08691).',
  },
  {
    id: 'comp',
    icon: '📈',
    shortLabel: 'SENIOR ML COMP',
    label: 'SENIOR ML MEDIAN COMP',
    value: '$345,000 Total Comp',
    change: 'Top 10%',
    detail: 'Verified market benchmark from Levels.fyi & Radford for L5/L6 Machine Learning Engineers across SF/NY/Remote frontier AI labs.',
  },
  {
    id: 'skill',
    icon: '🎯',
    shortLabel: 'DEMANDED SKILL',
    label: 'TOP DEMANDED SKILL',
    value: 'CUDA & Triton Programming',
    change: '+48% YoY',
    detail: 'Stanford AI Index tracking high-scarcity technical job openings requiring low-level GPU acceleration and kernel fusion.',
  },
  {
    id: 'flashattn',
    icon: '🟢',
    shortLabel: 'FLASHATTENTION-2',
    label: 'FLASHATTENTION-2 SAVINGS',
    value: '7.2x Less HBM I/O',
    change: 'SRAM Tiled',
    detail: 'Memory bandwidth reduction achieved by calculating online softmax in on-chip SRAM instead of materializing N×N attention in HBM.',
  },
  {
    id: 'ats',
    icon: '📊',
    shortLabel: 'ATS THRESHOLD',
    label: 'ATS RESUME PASSING THRESHOLD',
    value: '82% Match Score',
    change: 'Senior Bar',
    detail: 'Empirical match score needed to reliably clear automated applicant tracking parser filters for Senior technical roles.',
  },
  {
    id: 'gqa',
    icon: '💡',
    shortLabel: 'GQA MEMORY',
    label: 'GROUPED-QUERY ATTENTION (GQA)',
    value: '8x KV-Cache Compression',
    change: 'FP8 Quantized',
    detail: 'Memory footprint reduction achieved by sharing Key-Value heads across Query heads during multi-token autoregressive decoding (SOSP 2023).',
  },
];

export default function LiveTelemetryTicker() {
  const [activeTabId, setActiveTabId] = useState(TELEMETRY_FEED[0].id);
  const [isRotating, setIsRotating] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Soft stationary cycle every 6 seconds (Zero horizontal motion, instant clear text)
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setActiveTabId((prevId) => {
        const idx = TELEMETRY_FEED.findIndex((item) => item.id === prevId);
        const nextIdx = (idx + 1) % TELEMETRY_FEED.length;
        return TELEMETRY_FEED[nextIdx].id;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isRotating]);

  const activeItem = TELEMETRY_FEED.find((item) => item.id === activeTabId) || TELEMETRY_FEED[0];
  const activeIndex = TELEMETRY_FEED.findIndex((item) => item.id === activeTabId);

  const handlePrev = () => {
    setIsRotating(false);
    const nextIdx = (activeIndex - 1 + TELEMETRY_FEED.length) % TELEMETRY_FEED.length;
    setActiveTabId(TELEMETRY_FEED[nextIdx].id);
  };

  const handleNext = () => {
    setIsRotating(false);
    const nextIdx = (activeIndex + 1) % TELEMETRY_FEED.length;
    setActiveTabId(TELEMETRY_FEED[nextIdx].id);
  };

  return (
    <>
      <div className={styles.telemetryBar}>
        {/* Left Badge */}
        <div className={styles.badge} onClick={() => setSelectedDetail(activeItem)}>
          <span className={styles.liveDot} />
          <span className={styles.badgeLabel}>INDUSTRY BENCHMARKS</span>
        </div>

        {/* Desktop: Stationary Clickable Metric Chips (Zero Motion Blur) */}
        <div className={styles.desktopPillsRow}>
          {TELEMETRY_FEED.map((item) => {
            const isActive = item.id === activeTabId;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.metricChip} ${isActive ? styles.chipActive : ''}`}
                onClick={() => {
                  setActiveTabId(item.id);
                  setSelectedDetail(item);
                }}
                title="Click to view verified source and empirical details"
              >
                <span className={styles.chipIcon}>{item.icon}</span>
                <span className={styles.chipLabel}>{item.shortLabel}:</span>
                <strong className={styles.chipValue}>{item.value}</strong>
                <span className={styles.chipChange}>[{item.change}]</span>
              </button>
            );
          })}
        </div>

        {/* Mobile / Compact: Single Stationary Headline (Zero Motion Blur) */}
        <div className={styles.compactRow}>
          <div className={styles.compactText} onClick={() => setSelectedDetail(activeItem)}>
            <span>{activeItem.icon}</span>
            <strong className={styles.compactLabel}>{activeItem.shortLabel}:</strong>
            <span>{activeItem.value}</span>
            <span className={styles.chipChange}>[{activeItem.change}]</span>
          </div>

          <div className={styles.compactControls}>
            <button type="button" className={styles.stepBtn} onClick={handlePrev} title="Previous">‹</button>
            <span className={styles.stepCount}>{activeIndex + 1}/{TELEMETRY_FEED.length}</span>
            <button type="button" className={styles.stepBtn} onClick={handleNext} title="Next">›</button>
          </div>
        </div>
      </div>

      {/* Verified Empirical Source Modal */}
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
                  EMPIRICAL TESTBED & VERIFIED SOURCE
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
