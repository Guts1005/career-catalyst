'use client';

import { useState } from 'react';
import styles from './page.module.css';
import PageHeader from '@/components/PageHeader';
import {
  IconSandbox,
  IconAnalytics,
  IconCheck,
} from '@/components/Icons';

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
  roc: [
    { name: 'Balanced Decision (τ = 0.50)', thresh: 0.5, desc: 'Standard symmetric trade-off between Precision and Recall.' },
    { name: 'Medical Diagnostic Screening (τ = 0.15)', thresh: 0.15, desc: 'Maximized Recall (0.90+) to eliminate False Negatives in clinical settings.' },
    { name: 'Fraud / Spam Filter (τ = 0.85)', thresh: 0.85, desc: 'Maximized Precision (0.95+) to prevent blocking legitimate transactions.' },
  ],
};

export default function AlgorithmSandboxPage() {
  const [activeTab, setActiveTab] = useState('gradient_descent');

  // Gradient Descent State
  const [lr, setLr] = useState(0.12);
  const [steps, setSteps] = useState(14);

  // Attention Simulator State
  const [temperature, setTemperature] = useState(1.0);

  // ROC/AUC Threshold
  const [threshold, setThreshold] = useState(0.5);

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

  // Confusion matrix calculation for threshold
  const totalPos = 100;
  const totalNeg = 100;
  const tp = Math.round(totalPos * (1 - threshold * 0.75));
  const fp = Math.round(totalNeg * (1 - threshold * 0.95));
  const fn = totalPos - tp;
  const tn = totalNeg - fp;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 09"
        title={<>MATH<br />SANDBOX.</>}
        subtitle="An interactive technical workspace for exploring gradient descent dynamics, attention scaling, and loss surfaces."
      />

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`tab ${activeTab === 'gradient_descent' ? 'active' : ''}`}
          onClick={() => setActiveTab('gradient_descent')}
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          Gradient Descent Optimization
        </button>
        <button
          className={`tab ${activeTab === 'attention' ? 'active' : ''}`}
          onClick={() => setActiveTab('attention')}
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          Scaled Dot-Product Attention
        </button>
        <button
          className={`tab ${activeTab === 'roc' ? 'active' : ''}`}
          onClick={() => setActiveTab('roc')}
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          Decision Boundary & ROC / F1
        </button>
      </div>

      {/* TAB 1: GRADIENT DESCENT */}
      {activeTab === 'gradient_descent' && (
        <div>
          {/* 1-Click Presets */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Convergence Scenarios:</span>
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

          <div className={styles.grid}>
            {/* Left Controls */}
            <div className="card">
              <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '16px' }}>Hyperparameter Controls</div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label">Learning Rate (α)</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>{lr.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={lr}
                  onChange={(e) => setLr(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label">Optimization Epochs / Steps</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>{steps}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Convergence Metrics
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Final Loss f(x*):</span>
                  <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: finalLoss < 0.01 ? 'var(--success)' : 'var(--warning)' }}>
                    {finalLoss.toFixed(6)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Status:</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: finalLoss < 0.01 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {finalLoss < 0.01 ? '✓ Converged to Global Minimum' : 'Iterating...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Trajectory Plot */}
            <div className="card">
              <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '12px' }}>Loss Landscape Trajectory [ f(x) = x² ]</div>
              <div style={{ width: '100%', height: '220px', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '10px' }}>
                <svg viewBox="-5 -1 10 20" style={{ width: '100%', height: '100%', transform: 'scaleY(-1)' }}>
                  {/* Parabola curve */}
                  <path
                    d="M -4.5 20.25 Q 0 0 4.5 20.25"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.4"
                  />
                  {/* Step points */}
                  {gdPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.loss}
                      r={idx === gdPoints.length - 1 ? "0.6" : "0.35"}
                      fill={idx === gdPoints.length - 1 ? "var(--success)" : "var(--accent)"}
                    />
                  ))}
                  {/* Step path line */}
                  <polyline
                    points={gdPoints.map((p) => `${p.x},${p.loss}`).join(' ')}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="0.15"
                    strokeDasharray="0.3 0.2"
                  />
                </svg>
              </div>

              {/* Epoch logs */}
              <div style={{ marginTop: '12px', maxHeight: '100px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {gdPoints.slice(0, 6).map((pt, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Step {i.toString().padStart(2, '0')}: x = {pt.x.toFixed(3)}</span>
                    <span>Loss = {pt.loss.toFixed(4)} | ∇ = {pt.grad.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENTION SOFTMAX */}
      {activeTab === 'attention' && (
        <div>
          {/* 1-Click Presets */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Temperature Scenarios:</span>
            {MATH_PRESETS.attention.map((p) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
                onClick={() => setTemperature(p.temp)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            <div className="card">
              <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '16px' }}>Attention Mechanism Formula</div>
              <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Attention(Q, K, V) = softmax( (Q · Kᵀ) / √d_k ) · V
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label">Softmax Temperature (τ)</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '12px' }}>Token Attention Distribution</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Token 1 (Query Match)', 'Token 2 (Context)', 'Token 3 (Distractor)'].map((tok, i) => (
                  <div key={tok}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{tok} [Raw: {rawScores[i]}]</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(attentionWeights[i] * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${attentionWeights[i] * 100}%`,
                          background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                          transition: 'width 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROC / F1 DECISION THRESHOLD */}
      {activeTab === 'roc' && (
        <div>
          {/* 1-Click Presets */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Operational Thresholds:</span>
            {MATH_PRESETS.roc.map((p) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
                onClick={() => setThreshold(p.thresh)}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            <div className="card">
              <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '16px' }}>Classification Threshold Slider</div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label">Decision Boundary (Threshold τ)</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{threshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Precision</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {(precision * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recall</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {(recall * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>F1-Score</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)', marginTop: '2px' }}>
                    {(f1 * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="card">
              <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '12px' }}>Live Confusion Matrix (N = 200)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>True Positives (TP)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{tp}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>False Positives (FP)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{fp}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>False Negatives (FN)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{fn}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>True Negatives (TN)</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{tn}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
