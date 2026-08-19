'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconSalary, IconCheck } from '@/components/Icons';

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

  const totalOffered = (Number(base) || 0) + (Number(equity) || 0) + (Number(bonus) || 0);
  const targetNumber = Number(targetComp) || totalOffered;
  const negotiationDelta = targetNumber - totalOffered;

  const basePercent = totalOffered > 0 ? ((Number(base) || 0) / totalOffered) * 100 : 60;
  const equityPercent = totalOffered > 0 ? ((Number(equity) || 0) / totalOffered) * 100 : 25;
  const bonusPercent = totalOffered > 0 ? ((Number(bonus) || 0) / totalOffered) * 100 : 15;

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
      <PageHeader
        chapter="OPPORTUNITIES / 04"
        title={<>SALARY<br />INTELLIGENCE.</>}
        subtitle="Understand market benchmarks and compensation percentiles across technical specializations before you make your next move."
      />

      <div className={styles.grid}>
        {/* Market Benchmark Table */}
        <div>
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '12px', textTransform: 'uppercase' }}>
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
                      <strong style={{ color: 'var(--black)' }}>{b.role}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{b.level}</div>
                    </td>
                    <td>{b.location}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{b.base_median}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{b.equity_median}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--black)' }}>
                      {b.total_median}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Offer Breakdown Card */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--black)' }}>
                Target Offer Compensation Breakdown
              </span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--black)' }}>
                Total: ${totalOffered.toLocaleString()} / yr
              </span>
            </div>

            {/* Split Distribution Bar */}
            <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', display: 'flex', border: '1px solid var(--gray-200)' }}>
              <div style={{ width: `${basePercent}%`, background: 'var(--black)', title: 'Base' }} />
              <div style={{ width: `${equityPercent}%`, background: 'var(--blue)', title: 'Equity' }} />
              <div style={{ width: `${bonusPercent}%`, background: 'var(--gray-400)', title: 'Bonus' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginTop: '8px' }}>
              <span>● Base ({basePercent.toFixed(0)}%)</span>
              <span>● Equity ({equityPercent.toFixed(0)}%)</span>
              <span>● Bonus ({bonusPercent.toFixed(0)}%)</span>
            </div>

            {negotiationDelta > 0 && (
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--off-white)', borderRadius: '4px', border: '1px solid var(--gray-200)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gray-600)' }}>Target Counter-Offer Delta:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>+${negotiationDelta.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Counter-Offer Negotiation Engine */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '12px', textTransform: 'uppercase' }}>
            Offer Negotiation Script Generator
          </div>
          <form onSubmit={handleGenerateScript}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Company</label>
                <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role Title</label>
                <input className="input" value={role} onChange={(e) => setRole(e.target.value)} required />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '8px' }}>
              <div className="form-group">
                <label className="form-label">Base ($)</label>
                <input className="input" type="number" value={base} onChange={(e) => setBase(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Equity ($)</label>
                <input className="input" type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Bonus ($)</label>
                <input className="input" type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Compensation ($)</label>
                <input className="input" type="number" value={targetComp} onChange={(e) => setTargetComp(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Leverage Angle</label>
                <select className="input" value={leverageReason} onChange={(e) => setLeverageReason(e.target.value)}>
                  <option value="competing_offers">Active Competing Offers</option>
                  <option value="market_benchmarks">Market 90th Percentile</option>
                  <option value="skill_match">Specialized GPU/LLM Expertise</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '10px 0' }}>
              GENERATE NEGOTIATION SCRIPT →
            </button>
          </form>

          {script && (
            <div className={styles.scriptBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={styles.scriptTag}>VERBATIM NEGOTIATION EMAIL DRAFT</span>
                <button className="btn btn-secondary btn-sm" onClick={handleCopy} style={{ fontSize: '11px', padding: '4px 8px' }}>
                  {copied ? '✓ Copied' : 'Copy Script'}
                </button>
              </div>
              <div className={styles.scriptContent}>{script}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
