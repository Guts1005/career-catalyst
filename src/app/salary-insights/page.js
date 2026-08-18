'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function SalaryInsightsPage() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Negotiation form
  const [company, setCompany] = useState('Tech Startup');
  const [role, setRole] = useState('Machine Learning Engineer');
  const [base, setBase] = useState('145000');
  const [equity, setEquity] = useState('40000');
  const [bonus, setBonus] = useState('15000');
  const [targetComp, setTargetComp] = useState('230000');
  const [leverageReason, setLeverageReason] = useState('competing_offers');
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/salary-insights')
      .then(res => res.json())
      .then(data => {
        if (data.benchmarks) setBenchmarks(data.benchmarks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateScript = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/salary-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          baseOffered: base,
          equityOffered: equity,
          bonusOffered: bonus,
          targetComp,
          leverageReason
        })
      });
      const data = await res.json();
      if (data.negotiationScript) {
        setScript(data.negotiationScript);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>💰 DS/ML Salary Intelligence & Negotiation Advisor</h1>
          <p className={styles.subtitle}>
            Benchmark market compensation percentiles and generate high-leverage counter-offer negotiation scripts.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Market Benchmark Table */}
        <div>
          <div className="card-title" style={{ marginBottom: '12px' }}>📊 Market Total Compensation Benchmarks (2025–2026)</div>
          <div className={styles.tableCard}>
            <table className={styles.benchTable}>
              <thead>
                <tr>
                  <th>Role & Level</th>
                  <th>Location</th>
                  <th>Base</th>
                  <th>Equity / Bonus</th>
                  <th>Median TC</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{b.role}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.level}</div>
                    </td>
                    <td>{b.location}</td>
                    <td>${(b.base_median / 1000).toFixed(0)}k</td>
                    <td>${((b.equity_median + b.bonus_median) / 1000).toFixed(0)}k</td>
                    <td>
                      <span className={styles.totalCompPill}>
                        ${(b.total_comp_median / 1000).toFixed(0)}k
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Counter-Offer Negotiation Generator */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>🤝 Counter-Offer Script Generator</div>
          <form onSubmit={handleGenerateScript}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="input" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Base Salary ($)</label>
                <input className="input" type="number" value={base} onChange={(e) => setBase(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Equity / Yr ($)</label>
                <input className="input" type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Bonus ($)</label>
                <input className="input" type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Total Comp ($)</label>
                <input className="input" type="number" value={targetComp} onChange={(e) => setTargetComp(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Leverage Angle</label>
                <select className="select" value={leverageReason} onChange={(e) => setLeverageReason(e.target.value)}>
                  <option value="competing_offers">Competing Active Offer</option>
                  <option value="market_benchmarks">Market Percentiles & Proven Skills</option>
                  <option value="standard_request">Standard Polite Adjustment</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              ⚡ Generate Counter-Offer Email
            </button>
          </form>

          {script && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>
                  ✓ PERSUASIVE COUNTER-OFFER EMAIL READY:
                </span>
                <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                  {copied ? '✓ Copied' : '📋 Copy Script'}
                </button>
              </div>
              <div className={styles.scriptBox}>
                {script}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
