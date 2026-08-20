'use client';

import { useState } from 'react';
import styles from './LiveTelemetryTicker.module.css';

const TELEMETRY_FEED = [
  { label: '⚡ P99 TRITON INFERENCE', value: '13.8ms on 8x H100 (Llama-3)', change: '+38% QPS' },
  { label: '📈 SENIOR ML MEDIAN COMP', value: '$345,000 Total Comp', change: 'Top 10% Percentile' },
  { label: '🎯 TOP DEMANDED SKILL', value: 'CUDA & Triton Programming', change: '+48% YoY Growth' },
  { label: '🟢 FLASHATTENTION-2 SAVINGS', value: '7.2x Less HBM I/O', change: 'SRAM Tiled' },
  { label: '📊 ATS RESUME PASSING THRESHOLD', value: '82% Keyword Taxonomy Match', change: 'High Confidence' },
  { label: '💡 GROUPED-QUERY ATTENTION (GQA)', value: '8x KV-Cache Compression', change: 'FP8 Quantized' },
];

export default function LiveTelemetryTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className={styles.tickerRoot}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.tickerBadge}>
        <span className={styles.liveDot} />
        LIVE BENCHMARKS
      </div>

      <div className={styles.trackWrapper}>
        <div className={`${styles.track} ${isPaused ? styles.paused : ''}`}>
          {[...TELEMETRY_FEED, ...TELEMETRY_FEED].map((item, idx) => (
            <div key={idx} className={styles.tickerItem}>
              <span className={styles.itemLabel}>{item.label}:</span>
              <strong className={styles.itemValue}>{item.value}</strong>
              <span className={styles.itemChange}>[{item.change}]</span>
              <span className={styles.separator}>•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
