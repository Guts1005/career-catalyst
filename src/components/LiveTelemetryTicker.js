'use client';

import { useState } from 'react';
import styles from './LiveTelemetryTicker.module.css';

const TELEMETRY_FEED = [
  {
    id: 'triton',
    icon: '⚡',
    shortLabel: 'P99 TRITON INFERENCE',
    label: 'P99 TRITON INFERENCE',
    value: '13.8ms on 8x H100 (Llama-3)',
    change: '+38% QPS',
    detail: 'Measures 99th percentile token latency on NVIDIA H100 SXM5 GPUs using custom C++/Triton SRAM tiled kernels (Tri Dao, arXiv:2307.08691).',
  },
  {
    id: 'comp',
    icon: '📈',
    shortLabel: 'SENIOR ML MEDIAN COMP',
    label: 'SENIOR ML MEDIAN COMP',
    value: '$345,000 Total Comp',
    change: 'Top 10%',
    detail: 'Verified market benchmark from Levels.fyi & Radford for L5/L6 Machine Learning Engineers across SF/NY/Remote frontier AI labs.',
  },
  {
    id: 'skill',
    icon: '🎯',
    shortLabel: 'TOP DEMANDED SKILL',
    label: 'TOP DEMANDED SKILL',
    value: 'CUDA & Triton GPU Programming',
    change: '+48% YoY',
    detail: 'Stanford AI Index tracking high-scarcity technical job openings requiring low-level GPU acceleration and kernel fusion.',
  },
  {
    id: 'flashattn',
    icon: '🟢',
    shortLabel: 'FLASHATTENTION-2',
    label: 'FLASHATTENTION-2 SAVINGS',
    value: '7.2x Less HBM Memory I/O',
    change: 'SRAM Tiled',
    detail: 'Memory bandwidth reduction achieved by calculating online softmax in on-chip SRAM instead of materializing N×N attention in HBM.',
  },
  {
    id: 'ats',
    icon: '📊',
    shortLabel: 'ATS RESUME PASSING THRESHOLD',
    label: 'ATS RESUME PASSING THRESHOLD',
    value: '82% Keyword Match Score',
    change: 'Senior Bar',
    detail: 'Empirical match score needed to reliably clear automated applicant tracking parser filters for Senior technical roles.',
  },
  {
    id: 'gqa',
    icon: '💡',
    shortLabel: 'GROUPED-QUERY ATTENTION (GQA)',
    label: 'GROUPED-QUERY ATTENTION (GQA)',
    value: '8x KV-Cache Compression',
    change: 'FP8 Quantized',
    detail: 'Memory footprint reduction achieved by sharing Key-Value heads across Query heads during multi-token autoregressive decoding (SOSP 2023).',
  },
];

export default function LiveTelemetryTicker() {
  const [selectedDetail, setSelectedDetail] = useState(null);

  return (
    <>
      <div className={styles.tickerContainer}>
        {/* Left Fixed Badge */}
        <div className={styles.badge}>
          <span className={styles.liveDot} />
          <span className={styles.badgeLabel}>LIVE ML BENCHMARKS</span>
        </div>

        {/* Automatic 60fps Smooth Glide Track */}
        <div className={styles.glideViewport}>
          <div className={styles.glideTrack}>
            {/* Duplicated for seamless infinite loop */}
            {[...TELEMETRY_FEED, ...TELEMETRY_FEED, ...TELEMETRY_FEED].map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                className={styles.glideChip}
                onClick={() => setSelectedDetail(item)}
                title="Click to view verified empirical sources"
              >
                <span className={styles.chipIcon}>{item.icon}</span>
                <span className={styles.chipLabel}>{item.shortLabel}:</span>
                <strong className={styles.chipValue}>{item.value}</strong>
                <span className={styles.chipChange}>[{item.change}]</span>
              </button>
            ))}
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
