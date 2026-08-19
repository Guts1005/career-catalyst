'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import {
  IconSalary,
  IconCheck,
} from '@/components/Icons';

export default function SalaryInsightsPage() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Negotiation form
  const [company, setCompany] = useState('Frontier AI Lab');
  const [role, setRole] = useState('Senior ML Engineer');
  const [base, setBase] = useState('185000');
  const [equity, setEquity] = useState('65000');
  const [bonus, setBonus] = useState('25000');
  const [targetComp, setTargetComp] = useState('310000');
  const [leverageReason, setLeverageReason] = useState('competing_offers');
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/salary-insights')
      .then((res) => res.json())
      .then((data) => {
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
          leverageReason,
        }),
      });
      const data = await res.json();
      if (data.negotiationScript) {
        setScript(data.negotiationScript);
        showToast('High-leverage negotiation script generated!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate script', 'error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    showToast('Counter-offer script copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            <IconSalary size={13} />
            COMPENSATION INTELLIGENCE
          </div>
          <h1 className={styles.title} style={{ letterSpacing: '-0.03em', fontSize: '24px', fontWeight: 700 }}>
            Compensation Benchmarks & Negotiation Strategy
          </h1>
          <p className={styles.subtitle} style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Evaluate total compensation percentiles across top tech hubs and generate structured counter-offer scripts.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Market Benchmark Table */}
        <div>
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '12px' }}>
            Market Total Compensation Benchmarks (2025–2026)
          </div>
          <div className={styles.tableCard}>
            <table className={styles.benchTable}>
              <thead>
                <tr>
                  <th>Role & Level</th>
                  <th>Location</th>
                  <th>Base</th>
                  <th>Equity / Bonus</th>
                  <th>Median Total Comp</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{b.role}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.level}</div>
                    </td>
                    <td>{b.location}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>${(b.base_median / 1000).toFixed(0)}k</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>${((b.equity_median + b.bonus_median) / 1000).toFixed(0)}k</td>
                    <td>
                      <span className={styles.totalCompPill} style={{ fontFamily: 'var(--font-mono)' }}>
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
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '14px' }}>
            Counter-Offer Negotiation Generator
          </div>
          <form onSubmit={handleGenerateScript}>
            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Target Company</label>
                <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Position / Level</label>
                <input className="input" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Base Offered ($)</label>
                <input className="input" type="number" value={base} onChange={(e) => setBase(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Equity / Yr ($)</label>
                <input className="input" type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Sign-on / Bonus ($)</label>
                <input className="input" type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Target Total Comp ($)</label>
                <input className="input" type="number" value={targetComp} onChange={(e) => setTargetComp(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Negotiation Leverage Angle</label>
                <select className="select" value={leverageReason} onChange={(e) => setLeverageReason(e.target.value)}>
                  <option value="competing_offers">Active Competing Offer</option>
                  <option value="market_benchmarks">Market Percentiles & Specialized ML Skills</option>
                  <option value="standard_request">Polite Scope & Seniority Adjustment</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '13px', padding: '9px 16px' }}>
              Synthesize Negotiation Script
            </button>
          </form>

          {script && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                  ✓ PERSUASIVE COUNTER-OFFER SCRIPT READY:
                </span>
                <button className="btn btn-secondary btn-sm" onClick={handleCopy} style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {copied ? '✓ Copied' : 'Copy Script'}
                </button>
              </div>
              <div className={styles.scriptBox} style={{ fontSize: '12.5px' }}>
                {script}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
