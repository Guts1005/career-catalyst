'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import CompensationEquityModeler from '@/components/CompensationEquityModeler';
import { IconSalary, IconCheck } from '@/components/Icons';

const BENCHMARK_DATA = [
  { id: 1, role: 'Staff ML Systems Architect', level: 'L6 / Principal', location: 'San Francisco, CA', base_median: '$235,000', equity_median: '$145,000 / yr', total_median: '$380,000' },
  { id: 2, role: 'Machine Learning Engineer', level: 'L5 / Senior', location: 'San Francisco / Remote', base_median: '$195,000', equity_median: '$90,000 / yr', total_median: '$285,000' },
  { id: 3, role: 'AI Application & RAG Architect', level: 'Senior', location: 'New York, NY', base_median: '$185,000', equity_median: '$75,000 / yr', total_median: '$260,000' },
  { id: 4, role: 'Data Systems & Lakehouse Lead', level: 'Senior / Lead', location: 'Austin, TX (Remote)', base_median: '$180,000', equity_median: '$65,000 / yr', total_median: '$245,000' },
  { id: 5, role: 'Associate Data Scientist', level: 'L3 / Early Career', location: 'Seattle, WA', base_median: '$125,000', equity_median: '$30,000 / yr', total_median: '$155,000' },
];

export default function SalaryInsightsPage() {
  const [benchmarks, setBenchmarks] = useState(BENCHMARK_DATA);
  const [loading, setLoading] = useState(false);

  // Negotiation form
  const [company, setCompany] = useState('Frontier AI Lab');
  const [role, setRole] = useState('Senior ML Engineer');
  const [base, setBase] = useState('195000');
  const [equity, setEquity] = useState('90000');
  const [bonus, setBonus] = useState('30000');
  const [targetComp, setTargetComp] = useState('345000');
  const [leverageReason, setLeverageReason] = useState('competing_offers');
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/salary-insights')
      .then((res) => res.json())
      .then((data) => {
        if (data.benchmarks && data.benchmarks.length > 0) setBenchmarks(data.benchmarks);
      })
      .catch(() => setBenchmarks(BENCHMARK_DATA));
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
        title={<>SALARY INTELLIGENCE &<br />EQUITY MODELING.</>}
        subtitle="Benchmark compensation percentiles across technical tiers, model 4-year RSU waterfalls, and generate data-backed negotiation scripts."
      />

      <div className={styles.grid}>
        {/* Market Benchmark Table */}
        <div>
          <div className="card-title" style={{ fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
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
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.level}</div>
                    </td>
                    <td>{b.location}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{b.base_median}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{b.equity_median}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--green)' }}>
                      {b.total_median}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Offer Breakdown Card */}
          <div className="card" style={{ marginTop: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '18px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Target Offer Compensation Breakdown
              </span>
              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--text-primary)' }}>
                Total: ${totalOffered.toLocaleString()} / yr
              </span>
            </div>

            {/* Split Distribution Bar */}
            <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
              <div style={{ width: `${basePercent}%`, background: 'var(--blue)' }} title="Base" />
              <div style={{ width: `${equityPercent}%`, background: 'var(--green)' }} title="Equity" />
              <div style={{ width: `${bonusPercent}%`, background: 'var(--purple)' }} title="Bonus" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>● Base ({basePercent.toFixed(0)}%)</span>
              <span>● Equity ({equityPercent.toFixed(0)}%)</span>
              <span>● Bonus ({bonusPercent.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Counter-Offer Script Generator */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '6px' }}>
          <div className="card-title" style={{ fontSize: '13px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Generate Data-Backed Counter-Offer Script
          </div>

          <form onSubmit={handleGenerateScript} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Company</label>
                <input
                  type="text"
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role Title</label>
                <input
                  type="text"
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-3">
              <div>
                <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base ($)</label>
                <input
                  type="number"
                  className="input"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Equity ($/yr)</label>
                <input
                  type="number"
                  className="input"
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target ($)</label>
                <input
                  type="number"
                  className="input"
                  value={targetComp}
                  onChange={(e) => setTargetComp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Core Leverage Angle</label>
              <select
                className="select"
                value={leverageReason}
                onChange={(e) => setLeverageReason(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="competing_offers">Competing Offers from Frontier Labs</option>
                <option value="market_benchmarks">Top 10% Market Benchmark Percentiles</option>
                <option value="skill_match">High-Scarcity GPU / Triton Specialized Skillset</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              GENERATE NEGOTIATION SCRIPT →
            </button>
          </form>

          {script && (
            <div style={{ marginTop: '16px', background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Tailored Script (Delta: +${negotiationDelta.toLocaleString()})
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleCopy}
                  style={{ fontSize: '11px' }}
                >
                  {copied ? '✓ COPIED' : 'COPY SCRIPT'}
                </button>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0 }}>
                {script}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4-Year Equity Vesting Waterfall Modeler */}
      <CompensationEquityModeler />
    </div>
  );
}
