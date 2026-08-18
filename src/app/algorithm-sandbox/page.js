'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function AlgorithmSandboxPage() {
  const [activeTab, setActiveTab] = useState('gradient_descent');

  // Gradient Descent State
  const [lr, setLr] = useState(0.15);
  const [steps, setSteps] = useState(12);

  // Attention Simulator State
  const [temperature, setTemperature] = useState(1.0);

  // ROC/AUC Threshold
  const [threshold, setThreshold] = useState(0.5);

  // Compute Gradient Descent Trajectory on f(x) = x^2
  const computeGD = () => {
    let currentX = 4.0;
    const points = [[currentX, currentX * currentX]];
    for (let i = 0; i < steps; i++) {
      const grad = 2 * currentX;
      currentX = currentX - lr * grad;
      points.push([currentX, currentX * currentX]);
    }
    return points;
  };

  const gdPoints = computeGD();

  // Attention scores simulation for 3 tokens
  const rawScores = [2.4, 0.8, -1.2];
  const scaledScores = rawScores.map(s => Math.exp(s / temperature));
  const sumExp = scaledScores.reduce((a, b) => a + b, 0);
  const attentionWeights = scaledScores.map(s => s / sumExp);

  // Confusion matrix calculation for threshold
  const totalPos = 100;
  const totalNeg = 100;
  const tp = Math.round(totalPos * (1 - threshold * 0.7));
  const fp = Math.round(totalNeg * (1 - threshold * 0.9));
  const fn = totalPos - tp;
  const tn = totalNeg - fp;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🔬 Interactive ML Math & Algorithm Sandbox</h1>
          <p className={styles.subtitle}>
            Develop deep mathematical intuition through interactive loss surface convergence, attention softmax, and decision threshold sliders.
          </p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'gradient_descent' ? 'active' : ''}`}
          onClick={() => setActiveTab('gradient_descent')}
        >
          📈 Gradient Descent & Step Size
        </button>
        <button
          className={`tab ${activeTab === 'attention' ? 'active' : ''}`}
          onClick={() => setActiveTab('attention')}
        >
          🧠 Scaled Dot-Product Attention
        </button>
        <button
          className={`tab ${activeTab === 'roc' ? 'active' : ''}`}
          onClick={() => setActiveTab('roc')}
        >
          🎯 Decision Threshold & ROC / F1
        </button>
      </div>

      {activeTab === 'gradient_descent' && (
        <div className={styles.sandboxCard}>
          <div className={styles.controlsRow}>
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Learning Rate (η): {lr}</span>
              <input
                type="range"
                className={styles.slider}
                min="0.02"
                max="0.95"
                step="0.01"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Optimization Steps: {steps}</span>
              <input
                type="range"
                className={styles.slider}
                min="3"
                max="25"
                step="1"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
              />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
              Final Loss: <strong style={{ color: 'var(--success)' }}>{gdPoints[gdPoints.length - 1][1].toFixed(5)}</strong>
            </div>
          </div>

          <div className={styles.vizContainer}>
            <svg width="600" height="260" viewBox="-5 -2 10 20">
              {/* Parabola curve */}
              <path
                d={Array.from({ length: 41 }, (_, i) => {
                  const x = -4 + i * 0.2;
                  const y = x * x;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#4f8cff"
                strokeWidth="0.2"
              />

              {/* Descent Trajectory */}
              {gdPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt[0]} cy={pt[1]} r="0.25" fill={i === gdPoints.length - 1 ? 'var(--success)' : '#f87171'} />
                  {i < gdPoints.length - 1 && (
                    <line
                      x1={pt[0]}
                      y1={pt[1]}
                      x2={gdPoints[i + 1][0]}
                      y2={gdPoints[i + 1][1]}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="0.08"
                      strokeDasharray="0.2 0.2"
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className={styles.mathDerivation}>
            <strong>📐 Mathematical Derivation & Interview Takeaway:</strong>
            <p style={{ marginTop: '6px' }}>
              Weight Update Rule: <code>θ_new = θ_old - η * ∇L(θ)</code>. When learning rate <code>η &gt; 0.5</code>, gradient steps overshoot the valley and oscillate, demonstrating why gradient clipping and Adam adaptive momentum are necessary in deep networks.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'attention' && (
        <div className={styles.sandboxCard}>
          <div className={styles.controlsRow}>
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Softmax Temperature (τ): {temperature}</span>
              <input
                type="range"
                className={styles.slider}
                min="0.2"
                max="3.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
              {temperature < 0.8 ? '🔥 Sharp / High Confidence' : '❄️ Smooth / Uniform Distribution'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-tertiary)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
            {['Token 1: "Machine"', 'Token 2: "Learning"', 'Token 3: "Systems"'].map((tok, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <strong>{tok}</strong>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{(attentionWeights[i] * 100).toFixed(1)}% Weight</span>
                </div>
                <div className="progress-bar" style={{ height: '10px' }}>
                  <div className="progress-fill" style={{ width: `${attentionWeights[i] * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.mathDerivation}>
            <strong>📐 Mathematical Derivation & Interview Takeaway:</strong>
            <p style={{ marginTop: '6px' }}>
              Formula: <code>Attention(Q, K, V) = softmax((Q * K^T) / √d_k) * V</code>. Dividing by <code>√d_k</code> prevents dot products from growing excessively large for large dimensions, which would push softmax into regions with vanishingly small gradients.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'roc' && (
        <div className={styles.sandboxCard}>
          <div className={styles.controlsRow}>
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Classification Threshold (τ): {threshold}</span>
              <input
                type="range"
                className={styles.slider}
                min="0.1"
                max="0.9"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
              <div>Precision: <strong style={{ color: 'var(--accent)' }}>{(precision * 100).toFixed(1)}%</strong></div>
              <div>Recall: <strong style={{ color: 'var(--success)' }}>{(recall * 100).toFixed(1)}%</strong></div>
              <div>F1 Score: <strong style={{ color: 'var(--warning)' }}>{f1.toFixed(3)}</strong></div>
            </div>
          </div>

          {/* Live Confusion Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TRUE POSITIVE (TP)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>{tp}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FALSE POSITIVE (FP)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)' }}>{fp}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FALSE NEGATIVE (FN)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger)' }}>{fn}</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TRUE NEGATIVE (TN)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>{tn}</div>
            </div>
          </div>

          <div className={styles.mathDerivation}>
            <strong>📐 Mathematical Derivation & Interview Takeaway:</strong>
            <p style={{ marginTop: '6px' }}>
              Lowering threshold increases Recall (crucial for medical diagnoses and fraud detection), while raising threshold maximizes Precision (critical for recommender systems). The ROC curve plots TPR vs FPR across all possible thresholds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
