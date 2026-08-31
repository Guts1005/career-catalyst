'use client';

import { useState } from 'react';
import styles from './CompensationEquityModeler.module.css';

export default function CompensationEquityModeler() {
  const [base, setBase] = useState(195000);
  const [equityGrant, setEquityGrant] = useState(360000); // 4-year grant
  const [bonusPct, setBonusPct] = useState(15);
  const [annualAppreciation, setAnnualAppreciation] = useState(10); // % stock growth

  const annualBonus = Math.round(base * (bonusPct / 100));

  // Compute 4-year earnings with appreciation
  const years = [1, 2, 3, 4].map((year) => {
    const stockMultiplier = Math.pow(1 + annualAppreciation / 100, year - 1);
    const yearlyEquity = Math.round((equityGrant / 4) * stockMultiplier);
    const totalYear = base + annualBonus + yearlyEquity;
    return {
      year: `Year 0${year}`,
      base,
      bonus: annualBonus,
      equity: yearlyEquity,
      total: totalYear,
    };
  });

  const fourYearTotal = years.reduce((sum, y) => sum + y.total, 0);
  const maxYearTotal = Math.max(...years.map((y) => y.total));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.subBadge}>EQUITY INTELLIGENCE & VESTING MODEL</span>
          <h3 className={styles.title}>4-Year Total Compensation & RSU Waterfall</h3>
        </div>
        <div className={styles.fourYearBadge}>
          4-Yr Projected: ${Math.round(fourYearTotal / 1000)}k
        </div>
      </div>

      <p className={styles.description}>
        Models standard 4-year linear vesting with a 1-year cliff, annual target performance bonus, and projected equity appreciation.
      </p>

      {/* Interactive Controls */}
      <div className={styles.controlsGrid}>
        <div className={styles.controlItem}>
          <div className={styles.controlLabelRow}>
            <span>Base Salary:</span>
            <strong>${(base / 1000).toFixed(0)}k / yr</strong>
          </div>
          <input
            type="range"
            min="120000"
            max="350000"
            step="5000"
            value={base}
            aria-label="Base Salary Amount"
            aria-valuemin="120000"
            aria-valuemax="350000"
            aria-valuenow={base}
            onChange={(e) => setBase(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>

        <div className={styles.controlItem}>
          <div className={styles.controlLabelRow}>
            <span>4-Year Equity / RSU Grant:</span>
            <strong>${(equityGrant / 1000).toFixed(0)}k Grant</strong>
          </div>
          <input
            type="range"
            min="100000"
            max="1200000"
            step="25000"
            value={equityGrant}
            aria-label="4-Year Total Equity Grant Amount"
            aria-valuemin="100000"
            aria-valuemax="1200000"
            aria-valuenow={equityGrant}
            onChange={(e) => setEquityGrant(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>

        <div className={styles.controlItem}>
          <div className={styles.controlLabelRow}>
            <span>Target Annual Bonus:</span>
            <strong>{bonusPct}% (${(annualBonus / 1000).toFixed(0)}k)</strong>
          </div>
          <input
            type="range"
            min="0"
            max="35"
            step="5"
            value={bonusPct}
            aria-label="Target Annual Bonus Percentage"
            aria-valuemin="0"
            aria-valuemax="35"
            aria-valuenow={bonusPct}
            onChange={(e) => setBonusPct(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>

        <div className={styles.controlItem}>
          <div className={styles.controlLabelRow}>
            <span>Projected Annual Equity Growth:</span>
            <strong>{annualAppreciation}% / yr</strong>
          </div>
          <input
            type="range"
            min="-10"
            max="30"
            step="5"
            value={annualAppreciation}
            aria-label="Projected Annual Equity Appreciation Rate"
            aria-valuemin="-10"
            aria-valuemax="30"
            aria-valuenow={annualAppreciation}
            onChange={(e) => setAnnualAppreciation(Number(e.target.value))}
            className={styles.rangeInput}
          />
        </div>
      </div>

      {/* 4-Year Stacked Chart */}
      <div className={styles.chartGrid}>
        {years.map((y) => {
          const heightPct = Math.round((y.total / (maxYearTotal * 1.1)) * 100);
          const basePct = (y.base / y.total) * 100;
          const bonusPctVal = (y.bonus / y.total) * 100;
          const equityPctVal = (y.equity / y.total) * 100;

          return (
            <div key={y.year} className={styles.colWrap}>
              <div className={styles.colTotal}>${Math.round(y.total / 1000)}k</div>
              <div className={styles.barStack} style={{ height: `${heightPct}%` }}>
                <div className={styles.segEquity} style={{ height: `${equityPctVal}%` }} title={`Equity: $${Math.round(y.equity / 1000)}k`} />
                <div className={styles.segBonus} style={{ height: `${bonusPctVal}%` }} title={`Bonus: $${Math.round(y.bonus / 1000)}k`} />
                <div className={styles.segBase} style={{ height: `${basePct}%` }} title={`Base: $${Math.round(y.base / 1000)}k`} />
              </div>
              <div className={styles.colLabel}>{y.year}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legendRow}>
        <div className={styles.legendItem}>
          <span className={styles.dotBase} /> Base Salary
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotBonus} /> Performance Bonus
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotEquity} /> Vested RSU / Equity
        </div>
      </div>
    </div>
  );
}
