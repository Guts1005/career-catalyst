'use client';

import { useState } from 'react';
import styles from './page.module.css';
import PageHeader from '@/components/PageHeader';
import { IconSandbox, IconAnalytics, IconCheck } from '@/components/Icons';

const MATH_PRESETS = {
  gradient_descent: [
    { name: 'Optimal Convex Convergence', lr: 0.12, steps: 14, desc: 'Smooth exponential decay to local minimum without overshoot.' },
    { name: 'Aggressive Oscillations', lr: 0.85, steps: 10, desc: 'High learning rate causing step-size overshooting and ping-pong dynamics.' },
    { name: 'Slow Crawl (Vanishing Step)', lr: 0.02, steps: 20, desc: 'Under-parametrized learning rate requiring excessive epochs.' },
  ],
  attention: [
    { name: 'Standard Temperature (τ = 1.0)', temp: 1.0, desc: 'Balanced dot-product scaling preventing softmax gradient saturation.' },
    { name: 'High Temperature Diffusion (τ = 3.5)', temp: 3.5, desc: 'Uniform entropy distribution across all context tokens.' },
    { name: 'Low Temperature Peak / Argmax (τ = 0.2)', temp: 0.2, desc: 'Concentrated probability mass simulating greedy token selection.' },
  ],
  flash_attention: [
    { name: 'Llama-3 8B (8k Context)', seqLen: 8192, layers: 32, hiddenDim: 4096, kvHeads: 8, headDim: 128, precision: 'fp16' },
    { name: 'Llama-3 70B (32k Context)', seqLen: 32768, layers: 80, hiddenDim: 8192, kvHeads: 8, headDim: 128, precision: 'fp16' },
    { name: 'DeepSeek-V3 / Long-Context (128k)', seqLen: 131072, layers: 61, hiddenDim: 7168, kvHeads: 8, headDim: 128, precision: 'fp8' },
  ],
  roc: [
    { name: 'Balanced Decision (τ = 0.50)', thresh: 0.5, desc: 'Standard symmetric trade-off between Precision and Recall.' },
    { name: 'Medical Diagnostic Screening (τ = 0.15)', thresh: 0.15, desc: 'Maximized Recall (0.90+) to eliminate False Negatives in clinical settings.' },
    { name: 'Fraud / Spam Filter (τ = 0.85)', thresh: 0.85, desc: 'Maximized Precision (0.95+) to prevent blocking legitimate transactions.' },
  ],
  activations: [
    { name: 'GELU (Gaussian Error Linear Unit)', type: 'gelu', desc: 'Default transformer activation multiplying input by normal cumulative distribution.' },
    { name: 'Swish / SiLU (Sigmoid Linear Unit)', type: 'silu', desc: 'Smooth non-monotonic activation used in modern LLaMA & Mistral architectures.' },
    { name: 'ReLU (Rectified Linear Unit)', type: 'relu', desc: 'Classical piecewise linear activation with constant unit derivative for positive inputs.' },
  ],
};

export default function AlgorithmSandboxPage() {
  const [activeTab, setActiveTab] = useState('flash_attention');

  // Gradient Descent State
  const [lr, setLr] = useState(0.12);
  const [steps, setSteps] = useState(14);

  // Attention Simulator State
  const [temperature, setTemperature] = useState(1.0);

  // FlashAttention & KV Cache Memory State
  const [seqLen, setSeqLen] = useState(8192);
  const [layers, setLayers] = useState(32);
  const [kvHeads, setKvHeads] = useState(8);
  const [headDim, setHeadDim] = useState(128);
  const [precision, setPrecision] = useState('fp16'); // fp16 (2), fp8 (1), int4 (0.5)
  const [batchSize, setBatchSize] = useState(4);

  // ROC/AUC Threshold
  const [threshold, setThreshold] = useState(0.5);

  // Activation Function State
  const [actType, setActType] = useState('gelu');
  const [actX, setActX] = useState(1.2);

  // Compute Gradient Descent Trajectory on f(x) = x^2
  const computeGD = () => {
    let currentX = 4.0;
    const points = [{ x: currentX, loss: currentX * currentX, grad: 2 * currentX }];
    for (let i = 0; i < steps; i++) {
      const grad = 2 * currentX;
      currentX = currentX - lr * grad;
      points.push({ x: currentX, loss: currentX * currentX, grad: 2 * currentX });
    }
    return points;
  };

  const gdPoints = computeGD();
  const finalLoss = gdPoints[gdPoints.length - 1].loss;

  // Attention scores simulation for 3 tokens
  const rawScores = [2.4, 0.8, -1.2];
  const scaledScores = rawScores.map((s) => Math.exp(s / temperature));
  const sumExp = scaledScores.reduce((a, b) => a + b, 0);
  const attentionWeights = scaledScores.map((s) => s / sumExp);

  // FlashAttention & KV Cache Calculations
  const bytesPerElement = precision === 'fp16' ? 2 : precision === 'fp8' ? 1 : 0.5;
  // KV Cache = 2 (K and V) * layers * seqLen * kvHeads * headDim * bytesPerElement
  const kvCacheBytesPerSeq = 2 * layers * seqLen * kvHeads * headDim * bytesPerElement;
  const kvCacheMbPerSeq = kvCacheBytesPerSeq / (1024 * 1024);
  const totalKvCacheGb = (kvCacheMbPerSeq * batchSize) / 1024;

  // Standard Attention HBM I/O vs FlashAttention-2 SRAM Tiling (in MB)
  const standardAttentionHbmIoMb = (4 * seqLen * seqLen * 2) / (1024 * 1024);
  const sramTileSize = 256; // 256KB on NVIDIA H100 SRAM
  const flashAttentionHbmIoMb = (2 * seqLen * headDim * 2) / (1024 * 1024);
  const hbmSpeedupFactor = Math.max(Math.round(standardAttentionHbmIoMb / Math.max(flashAttentionHbmIoMb, 0.01)), 2);

  // Confusion matrix calculation for threshold
  const totalPos = 100;
  const totalNeg = 100;
  const tp = Math.round(totalPos * (1 - threshold * 0.75));
  const fp = Math.round(totalNeg * (1 - threshold * 0.95));
  const fn = totalPos - tp;
  const tn = totalNeg - fp;
  const precisionVal = tp / (tp + fp) || 0;
  const recallVal = tp / (tp + fn) || 0;
  const f1Val = (2 * precisionVal * recallVal) / (precisionVal + recallVal) || 0;

  // Activation Function Calculations
  const computeActivation = (x, type) => {
    if (type === 'relu') return Math.max(0, x);
    if (type === 'silu') return x / (1 + Math.exp(-x));
    if (type === 'gelu') {
      return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
    }
    if (type === 'sigmoid') return 1 / (1 + Math.exp(-x));
    if (type === 'tanh') return Math.tanh(x);
    return x;
  };

  const actY = computeActivation(actX, actType);

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 09"
        title={<>MATH & SYSTEMS<br />SANDBOX.</>}
        subtitle="An interactive workspace modeling FlashAttention-2 SRAM tiling, KV-cache GPU memory, and loss surfaces."
      />

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'flash_attention', label: '⚡ FlashAttention & KV-Cache GPU Model' },
          { key: 'gradient_descent', label: 'Gradient Descent Dynamics' },
          { key: 'attention', label: 'Self-Attention Softmax Scaling' },
          { key: 'roc', label: 'ROC / Decision Boundary' },
          { key: 'activations', label: 'Transformer Activations' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.key)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 0: FLASHATTENTION & KV-CACHE GPU MODEL ─────────────── */}
      {activeTab === 'flash_attention' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              PRODUCTION LLM ARCHITECTURES:
            </span>
            {MATH_PRESETS.flash_attention.map((p) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
                onClick={() => {
                  setSeqLen(p.seqLen);
                  setLayers(p.layers);
                  setKvHeads(p.kvHeads);
                  setHeadDim(p.headDim);
                  setPrecision(p.precision);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className={styles.sandboxCard}>
            <div className={styles.controlsRow}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Sequence Length (Tokens): {seqLen.toLocaleString()}</label>
                <input
                  type="range"
                  min="2048"
                  max="131072"
                  step="2048"
                  value={seqLen}
                  onChange={(e) => setSeqLen(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Transformer Layers: {layers}</label>
                <input
                  type="range"
                  min="16"
                  max="80"
                  step="4"
                  value={layers}
                  onChange={(e) => setLayers(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Batch Size (Concurrent Streams): {batchSize}</label>
                <input
                  type="range"
                  min="1"
                  max="64"
                  step="1"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>KV Quantization Precision</label>
                <select
                  className="select"
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value)}
                  style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                >
                  <option value="fp16">FP16 / BF16 (2 Bytes/Elem) — Standard</option>
                  <option value="fp8">FP8 (1 Byte/Elem) — Ada / Hopper Native</option>
                  <option value="int4">INT4 (0.5 Bytes/Elem) — Extreme Compression</option>
                </select>
              </div>
            </div>

            {/* GPU Memory & IO Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>KV CACHE PER SEQUENCE</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {kvCacheMbPerSeq >= 1024 ? `${(kvCacheMbPerSeq / 1024).toFixed(2)} GB` : `${kvCacheMbPerSeq.toFixed(1)} MB`}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>BATCH TOTAL VRAM DEMAND</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: totalKvCacheGb > 70 ? 'var(--red)' : 'var(--green)', marginTop: '4px' }}>
                  {totalKvCacheGb.toFixed(2)} GB / 80 GB
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>FLASHATTENTION HBM I/O SAVINGS</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--blue)', marginTop: '4px' }}>
                  {hbmSpeedupFactor}x Less HBM Read/Write
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MAX BATCH CONCURRENCY (H100)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  ~{Math.max(Math.floor(65 / (kvCacheMbPerSeq / 1024)), 1)} Requests
                </div>
              </div>
            </div>

            {/* Architectural Invariant Box */}
            <div style={{ marginTop: '20px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '4px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Architectural Invariant: Online Softmax Tiling (Tri Dao et al.)
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Standard multi-head attention materializes the intermediate $N \times N$ attention matrix in High-Bandwidth Memory (HBM), resulting in quadratic memory complexity $O(N^2)$ and memory-bandwidth saturation. FlashAttention partitions inputs into SRAM blocks ($B_r \times B_c$), computing softmax scaling online via rescaling factors $m(x)$ and $l(x)$ to keep intermediate matrices entirely within high-speed GPU SRAM caches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 1: GRADIENT DESCENT ───────────────────────────────── */}
      {activeTab === 'gradient_descent' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>CONVERGENCE SCENARIOS:</span>
            {MATH_PRESETS.gradient_descent.map((p) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
                onClick={() => {
                  setLr(p.lr);
                  setSteps(p.steps);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className={styles.sandboxCard}>
            <div className={styles.controlsRow}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Learning Rate (η): {lr.toFixed(3)}</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.95"
                  step="0.01"
                  value={lr}
                  onChange={(e) => setLr(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Iteration Steps: {steps}</label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>FINAL CONVERGED LOSS</div>
              <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {finalLoss.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ATTENTION SOFTMAX ──────────────────────────────── */}
      {activeTab === 'attention' && (
        <div className={styles.sandboxCard}>
          <div className={styles.controlsRow}>
            <div className={styles.controlItem}>
              <label className={styles.controlLabel}>Temperature (τ): {temperature.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attentionWeights.map((w, idx) => (
              <div key={idx} style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Token 0{idx + 1} (Raw Score: {rawScores[idx]})</span>
                <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--blue)' }}>
                  {(w * 100).toFixed(2)}% Attention Mass
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: ROC / DECISION BOUNDARY ────────────────────────── */}
      {activeTab === 'roc' && (
        <div className={styles.sandboxCard}>
          <div className={styles.controlsRow}>
            <div className={styles.controlItem}>
              <label className={styles.controlLabel}>Classification Threshold: {threshold.toFixed(2)}</label>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '20px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PRECISION</div>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {(precisionVal * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RECALL</div>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {(recallVal * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>F1-SCORE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {(f1Val * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: TRANSFORMER ACTIVATIONS ────────────────────────── */}
      {activeTab === 'activations' && (
        <div className={styles.sandboxCard}>
          <div className={styles.controlsRow}>
            <div className={styles.controlItem}>
              <label className={styles.controlLabel}>Activation Type</label>
              <select
                className="select"
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
              >
                <option value="gelu">GELU (Gaussian Error Linear Unit)</option>
                <option value="silu">SiLU / Swish (LLaMA / Mistral)</option>
                <option value="relu">ReLU (Rectified Linear Unit)</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
              </select>
            </div>

            <div className={styles.controlItem}>
              <label className={styles.controlLabel}>Input Value (x): {actX.toFixed(2)}</label>
              <input
                type="range"
                min="-4.0"
                max="4.0"
                step="0.1"
                value={actX}
                onChange={(e) => setActX(Number(e.target.value))}
                className={styles.rangeInput}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>COMPUTED ACTIVATION: f({actX.toFixed(2)})</div>
            <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
              {actY.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
