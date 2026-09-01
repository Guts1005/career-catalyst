'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import CompensationEquityModeler from '@/components/CompensationEquityModeler';
import { useCareer } from '@/context/CareerContext';

const BENCHMARK_DATA = [
  { id: 1, role: 'Staff ML Systems Architect', level: 'L6 / Principal', location: 'San Francisco, CA', base_median: '$235,000', equity_median: '$145,000 / yr', total_median: '$380,000' },
  { id: 2, role: 'Machine Learning Engineer', level: 'L5 / Senior', location: 'San Francisco / Remote', base_median: '$195,000', equity_median: '$90,000 / yr', total_median: '$285,000' },
  { id: 3, role: 'AI Application & RAG Architect', level: 'Senior', location: 'New York, NY', base_median: '$185,000', equity_median: '$75,000 / yr', total_median: '$260,000' },
  { id: 4, role: 'Data Systems & Lakehouse Lead', level: 'Senior / Lead', location: 'Austin, TX (Remote)', base_median: '$180,000', equity_median: '$65,000 / yr', total_median: '$245,000' },
  { id: 5, role: 'Associate Data Scientist', level: 'L3 / Early Career', location: 'Seattle, WA', base_median: '$125,000', equity_median: '$30,000 / yr', total_median: '$155,000' },
];

function SalaryInsightsContent() {
  const router = useRouter();
  const { jobs } = useCareer();
  const searchParams = useSearchParams();

  const companyParam = searchParams.get('company') || '';
  const roleParam = searchParams.get('role') || '';
  const baseParam = searchParams.get('base') || '';
  const equityParam = searchParams.get('equity') || '';
  const bonusParam = searchParams.get('bonus') || '';
  const stageParam = searchParams.get('stage') || '';

  const [benchmarks, setBenchmarks] = useState(BENCHMARK_DATA);
  const [loading, setLoading] = useState(false);

  // Negotiation form
  const [company, setCompany] = useState(companyParam || 'Anthropic');
  const [role, setRole] = useState(roleParam || 'Staff AI Engineer');
  const [base, setBase] = useState(baseParam || '215000');
  const [equity, setEquity] = useState(equityParam || '160000');
  const [bonus, setBonus] = useState(bonusParam || '35000');
  const [targetComp, setTargetComp] = useState(
    baseParam && equityParam
      ? String(Number(baseParam) + Number(equityParam) + (Number(bonusParam) || 35000) + 45000)
      : '455000'
  );
  const [leverageReason, setLeverageReason] = useState('competing_offers');
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (companyParam) setCompany(companyParam);
    if (roleParam) setRole(roleParam);
    if (baseParam) setBase(baseParam);
    if (equityParam) setEquity(equityParam);
    if (bonusParam) setBonus(bonusParam);
    if (baseParam && equityParam) {
      setTargetComp(String(Number(baseParam) + Number(equityParam) + (Number(bonusParam) || 35000) + 45000));
    }
  }, [companyParam, roleParam, baseParam, equityParam, bonusParam]);

  const activeOffers = useMemo(() => {
    return (jobs || []).filter((j) => ['offer', 'negotiation', 'interview'].includes(j.status));
  }, [jobs]);

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

  const handleSelectOfferPipeline = (job) => {
    const defaultBase = job.salary_min || 215000;
    const defaultEquity = job.equity || 160000;
    const defaultBonus = job.bonus || 35000;
    router.push(
      `/salary-insights?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.role)}&base=${defaultBase}&equity=${defaultEquity}&bonus=${defaultBonus}&stage=${job.status}`
    );
  };

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
        chapter="OFFER INTELLIGENCE / 04"
        title={<>SALARY INTELLIGENCE &<br />EQUITY MODELING.</>}
        subtitle="Benchmark compensation percentiles across technical tiers, model 4-year RSU waterfalls, and generate data-backed negotiation scripts."
      />

      {/* ─── Active Offer Pipeline Switcher Toolbar (Connection H) ─── */}
      {activeOffers && activeOffers.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            background: 'var(--bg-surface)',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
          role="region"
          aria-label="Active Offer Pipeline Selector"
        >
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--amber, #f59e0b)', fontWeight: 800 }}>
            ⚡ ACTIVE OFFERS & PIPELINES:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {activeOffers.slice(0, 5).map((job) => {
              const isActive = company.toLowerCase() === job.company.toLowerCase();
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleSelectOfferPipeline(job)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 10px',
                    borderColor: isActive ? 'var(--amber)' : 'var(--border)',
                    background: isActive ? 'var(--amber, #f59e0b)' : 'transparent',
                    color: isActive ? '#000' : 'var(--text-primary)',
                    fontWeight: isActive ? 800 : 500,
                  }}
                  aria-label={`Model compensation for ${job.company}`}
                >
                  💰 {job.company.toUpperCase()} ({job.status.toUpperCase()})
                </button>
              );
            })}
            {companyParam && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => router.push('/salary-insights')}
                style={{ fontSize: '11px', color: 'var(--text-muted)' }}
              >
                Clear Context ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Active Offer Modeling & Negotiation Banner (Connection H) ─── */}
      {companyParam && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--amber, #f59e0b)',
            borderLeft: '4px solid var(--amber, #f59e0b)',
            padding: '16px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
          role="region"
          aria-label={`Active Offer Modeling for ${companyParam}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎉 ACTIVE OFFER MODELING & NEGOTIATION • {companyParam.toUpperCase()}
            </span>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              STAGE: {stageParam ? stageParam.toUpperCase() : 'OFFER'}
            </span>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
            Calibrated for <strong>{companyParam}</strong> ({roleParam || 'Target Role'}). Initial Offer: <strong>${(Number(base) / 1000).toFixed(0)}k Base</strong> + <strong>${(Number(equity) / 1000).toFixed(0)}k/yr Equity</strong>. Modeled target negotiation delta is <strong>+${negotiationDelta > 0 ? (negotiationDelta / 1000).toFixed(0) : 45}k</strong>.
          </p>
        </div>
      )}

      <div className={styles.grid}>
        {/* Market Benchmark Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="card-title" style={{ fontSize: '13px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', margin: 0 }}>
              Market Total Compensation Benchmarks (2025–2026)
            </div>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--green)', background: 'var(--green-subtle)', border: '1px solid var(--green-border)', padding: '2px 8px', borderRadius: '4px' }}>
              ✓ SOURCE: LEVELS.FYI & RADFORD TECH SURVEY (Q4 2024)
            </span>
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

      {/* 4-Year Equity Vesting Waterfall Modeler (Connection H) */}
      <CompensationEquityModeler
        initialBase={Number(base) || 195000}
        initialEquityGrant={(Number(equity) || 90000) * 4}
        initialBonusPct={Math.round(((Number(bonus) || 30000) / (Number(base) || 195000)) * 100)}
      />
    </div>
  );
}

export default function SalaryInsightsPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="loadingSpinner" /><p>Calibrating Compensation Modeler...</p></div>}>
      <SalaryInsightsContent />
    </Suspense>
  );
}
