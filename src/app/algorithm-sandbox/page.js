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
  roc: [
    { name: 'Balanced Decision (τ = 0.50)', thresh: 0.5, desc: 'Standard symmetric trade-off between Precision and Recall.' },
    { name: 'Medical Diagnostic Screening (τ = 0.15)', thresh: 0.15, desc: 'Maximized Recall (0.90+) to eliminate False Negatives in clinical settings.' },
    { name: 'Fraud / Spam Filter (τ = 0.85)', thresh: 0.85, desc: 'Maximized Precision (0.95+) to prevent blocking legitimate transactions.' },
  ],
  activations: [
    { name: 'GELU (Gaussian Error Linear Unit)', type: 'gelu', desc: 'Default transformer activation multiplying input by normal cumulative distribution.' },
    { name: 'Swish / SiLU (Sigmoid Linear Unit)', type: 'silu', desc: 'Smooth non-monotonic activation used in modern LLaMA & Mistral architectures.' },
    { name: 'ReLU (Rectified Linear Unit)', type: 'relu', desc: 'Classical piecewise linear activation with constant unit derivative for positive inputs.' },
  ]
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
        title={<>MATH<br />SANDBOX.</>}
        subtitle="An interactive technical workspace for exploring gradient descent dynamics, attention scaling, and loss surfaces."
      />

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'gradient_descent', label: 'Gradient Descent' },
          { key: 'attention', label: 'Self-Attention Softmax' },
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

      {/* ─── TAB 1: GRADIENT DESCENT ───────────────────────────────── */}
      {activeTab === 'gradient_descent' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>CONVERGENCE SCENARIOS:</span>
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
                  onChange={(e) => setLr(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Optimization Steps: {steps}</label>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Final Convex Loss: {finalLoss.toFixed(5)}</label>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: finalLoss < 0.01 ? 'var(--green)' : 'var(--amber)' }}>
                  {finalLoss < 0.01 ? '● CONVERGED' : '● OSCILLATING / STEPPING'}
                </div>
              </div>
            </div>

            {/* SVG Loss Curve Simulation */}
            <div className={styles.vizContainer}>
              <svg width="600" height="240" viewBox="-5 -2 10 20">
                {/* Parabola f(x) = x^2 */}
                <path
                  d="M -4.5 20.25 Q 0 -2 4.5 20.25"
                  fill="none"
                  stroke="#333333"
                  strokeWidth="0.25"
                />
                {/* Descent Path */}
                <polyline
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="0.2"
                  points={gdPoints.map((p) => `${p.x},${p.loss}`).join(' ')}
                />
                {/* Points */}
                {gdPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.loss}
                    r="0.25"
                    fill={i === gdPoints.length - 1 ? 'var(--green)' : '#FFFFFF'}
                  />
                ))}
              </svg>
            </div>

            <div className={styles.mathDerivation}>
              <strong>Analytical Gradient Derivation:</strong> For objective function <code>f(x) = x²</code>, the exact gradient vector is <code>∇f(x) = 2x</code>. Weight update step evaluates as: <code>x_next = x - η · 2x</code>.
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SELF ATTENTION TEMPERATURE ───────────────────────── */}
      {activeTab === 'attention' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>TEMPERATURE REGIMES:</span>
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

          <div className={styles.sandboxCard}>
            <div className={styles.controlsRow}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Softmax Temperature (τ): {temperature.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {attentionWeights.map((w, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    <span>Token Chunk [{i + 1}] (Logit: {rawScores[i]})</span>
                    <span>{(w * 100).toFixed(1)}% Probability</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--off-white)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                    <div style={{ height: '100%', width: `${w * 100}%`, background: 'var(--black)', transition: 'width 0.15s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.mathDerivation}>
              <strong>Attention Softmax Scaling:</strong> <code>Attention(Q, K, V) = softmax((Q · Kᵀ) / (√d_k · τ)) · V</code>. As temperature <code>τ → 0</code>, softmax approaches argmax (deterministic greedy decoding). As <code>τ → ∞</code>, distribution becomes uniform entropy.
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ROC / DECISION BOUNDARY ─────────────────────────── */}
      {activeTab === 'roc' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>OPERATING THRESHOLDS:</span>
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

          <div className={styles.sandboxCard}>
            <div className={styles.controlsRow}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Classifier Threshold (τ): {threshold.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: 'var(--off-white)', padding: '12px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>PRECISION</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>{(precision * 100).toFixed(1)}%</div>
              </div>
              <div style={{ background: 'var(--off-white)', padding: '12px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>RECALL</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>{(recall * 100).toFixed(1)}%</div>
              </div>
              <div style={{ background: 'var(--off-white)', padding: '12px', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>F1-SCORE</div>
                <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>{(f1 * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className={styles.mathDerivation}>
              <strong>Precision-Recall Harmonic Trade-off:</strong> <code>F1 = 2 · (Precision · Recall) / (Precision + Recall)</code>. Shifting decision threshold modulates false positive vs false negative tolerance.
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: TRANSFORMER ACTIVATIONS ─────────────────────────── */}
      {activeTab === 'activations' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>SELECT ACTIVATION:</span>
            {MATH_PRESETS.activations.map((p) => (
              <button
                key={p.type}
                type="button"
                className="btn btn-secondary"
                style={{
                  fontSize: '11.5px',
                  padding: '4px 10px',
                  background: actType === p.type ? 'var(--black)' : 'var(--white)',
                  color: actType === p.type ? 'var(--white)' : 'var(--black)',
                  borderColor: actType === p.type ? 'var(--black)' : 'var(--gray-200)'
                }}
                onClick={() => setActType(p.type)}
              >
                {p.name.split('(')[0].trim()}
              </button>
            ))}
          </div>

          <div className={styles.sandboxCard}>
            <div className={styles.controlsRow}>
              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Input Value (x): {actX.toFixed(2)}</label>
                <input
                  type="range"
                  min="-4.0"
                  max="4.0"
                  step="0.1"
                  value={actX}
                  onChange={(e) => setActX(parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.controlItem}>
                <label className={styles.controlLabel}>Output f(x): {actY.toFixed(4)}</label>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>
                  ● EVALUATED
                </div>
              </div>
            </div>

            {/* SVG Activation Curve */}
            <div className={styles.vizContainer}>
              <svg width="600" height="200" viewBox="-4 -2 8 6">
                <line x1="-4" y1="0" x2="4" y2="0" stroke="#333333" strokeWidth="0.05" />
                <line x1="0" y1="-2" x2="0" y2="4" stroke="#333333" strokeWidth="0.05" />
                
                {/* Curve plotting */}
                <polyline
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="0.1"
                  points={Array.from({ length: 80 }, (_, i) => {
                    const x = -4 + (i / 79) * 8;
                    const y = -computeActivation(x, actType);
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Current Active Point */}
                <circle cx={actX} cy={-actY} r="0.2" fill="var(--blue)" stroke="#FFFFFF" strokeWidth="0.05" />
              </svg>
            </div>

            <div className={styles.mathDerivation}>
              <strong>Mathematical Definition:</strong> {actType === 'gelu' ? (
                <><code>GELU(x) = x · Φ(x) = x · P(X ≤ x)</code> where <code>X ~ N(0, 1)</code>. Smooth non-linear gating allowing small negative gradients.</>
              ) : actType === 'silu' ? (
                <><code>SiLU(x) = x · σ(x) = x / (1 + e⁻ˣ)</code>. Used across contemporary decoder-only LLM feed-forward layers.</>
              ) : (
                <><code>ReLU(x) = max(0, x)</code>. Constant derivative 1 for positive inputs, avoiding vanishing gradients.</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
