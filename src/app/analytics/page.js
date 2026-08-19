'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { IconAnalytics } from '@/components/Icons';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Analyzing your career data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <p style={{ color: 'var(--danger)' }}>Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!data || data.overall.totalItems === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No Data Yet</h2>
        <p>Start tracking your certifications, projects, and skills to see your career analytics here.</p>
      </div>
    );
  }

  // Helper for SVG Donut Chart
  const renderDonutChart = (dataObj, colors) => {
    const entries = Object.entries(dataObj);
    if (entries.length === 0) return <p className={styles.emptyState}>No data</p>;

    const total = entries.reduce((sum, [_, val]) => sum + val, 0);
    let cumulativePercent = 0;
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="30" />
          {entries.map(([key, val], index) => {
            const percent = val / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = cumulativePercent * circumference;
            cumulativePercent -= percent;
            
            return (
              <circle
                key={key}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="30"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            );
          })}
          <text x="100" y="100" textAnchor="middle" dy="0.3em" fill="var(--text-primary)" fontSize="24" fontWeight="bold">
            {total}
          </text>
          <text x="100" y="120" textAnchor="middle" fill="var(--text-muted)" fontSize="12">
            Total
          </text>
        </svg>
        <div className={styles.legend}>
          {entries.map(([key, val], index) => (
            <div key={key} className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: colors[index % colors.length] }}></div>
              <span>{key} ({val})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper for line chart (ATS Trend)
  const renderLineChart = (dataArray) => {
    if (!dataArray || dataArray.length < 2) return <p className={styles.emptyState}>Not enough data to show trend (minimum 2 checks needed).</p>;
    
    const width = 300;
    const height = 150;
    const padding = 20;
    
    const maxScore = Math.max(...dataArray.map(d => d.score), 100);
    const minScore = 0; // Math.min(...dataArray.map(d => d.score), 0);
    
    const points = dataArray.map((d, i) => {
      const x = padding + (i / (dataArray.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className={styles.chartContainer}>
        <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-light)" strokeDasharray="4 4" />
          <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="var(--border-light)" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-light)" />
          
          {/* Line */}
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            points={points}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          
          {/* Points */}
          {dataArray.map((d, i) => {
            const x = padding + (i / (dataArray.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d.score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="2" />
                <text x={x} y={y - 10} fontSize="10" fill="var(--text-secondary)" textAnchor="middle">{d.score}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const chartColors = ['#4f8cff', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#f472b6'];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            <IconAnalytics size={13} />
            METRICS & PIPELINE VELOCITY
          </div>
          <h1 style={{ letterSpacing: '-0.03em', fontSize: '24px', fontWeight: 700 }}>Career Analytics & Insights</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Data visualization across pipeline completion velocity, certification investment, and skill distribution.
          </p>
        </div>
      </header>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <section className={styles.recommendations}>
          {data.recommendations.map((rec, i) => (
            <div key={i} className={`${styles.recommendation} ${
              rec.type === 'warning' ? styles.recWarning : 
              rec.type === 'success' ? styles.recSuccess : styles.recInfo
            }`}>
              {rec.message}
            </div>
          ))}
        </section>
      )}

      {/* Top Stats Grid */}
      <section className={styles.gridTop}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Overall Progress</h2>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statValue}>{data.overall.completionRate}%</div>
            <div className={styles.statLabel}>
              <span>Completion Rate</span>
              Across {data.overall.totalItems} tracked items
            </div>
          </div>
          <div className={styles.barChart}>
             <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${data.overall.completionRate}%` }}></div>
             </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Certification Hours</h2>
          </div>
          <div className={styles.statBlock}>
            <div className={styles.statValue} style={{ color: 'var(--warning)' }}>{data.certifications.estimatedHoursRemaining}h</div>
            <div className={styles.statLabel}>
              <span>Estimated Remaining</span>
              Based on progress & estimates
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className={styles.gridMain}>
        {/* Left Column (Wider) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Skill Categories Averages</h2>
            </div>
            <div className={styles.barChart}>
              {data.skills.avgByCategory.length > 0 ? (
                data.skills.avgByCategory.map(skill => (
                  <div key={skill.category} className={styles.barRow}>
                    <div className={styles.barLabel}>
                      <span>{skill.category}</span>
                      <span>{skill.avg} / 100</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${skill.avg}%`, backgroundColor: 'var(--success)' }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No skills data available</p>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Tech Stack Frequency</h2>
            </div>
            <div className={styles.tagCloud}>
              {data.projects.techStackFrequency.length > 0 ? (
                data.projects.techStackFrequency.map(tech => (
                  <div key={tech.tech} className={styles.tag}>
                    {tech.tech}
                    <span className={styles.tagCount}>{tech.count}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No projects data available</p>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Biggest Skill Gaps</h2>
            </div>
            <div className={styles.barChart}>
              {data.skills.biggestGaps.length > 0 ? (
                data.skills.biggestGaps.map(skill => (
                  <div key={skill.id} className={styles.barRow}>
                    <div className={styles.barLabel}>
                      <span>{skill.name}</span>
                      <span>Gap: {skill.gap} (Target: {skill.target_level})</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div 
                        className={styles.barFill} 
                        style={{ 
                          width: `${skill.current_level}%`, 
                          backgroundColor: 'var(--danger)',
                          borderRight: `2px solid var(--text-primary)`
                        }}>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No skills data available</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Narrower) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Certifications</h2>
            </div>
            {renderDonutChart(data.certifications.byStatus, chartColors)}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Resources by Type</h2>
            </div>
            {renderDonutChart(data.resources.byType, [...chartColors].reverse())}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>ATS Score Trend</h2>
            </div>
            {renderLineChart(data.atsTrend)}
          </div>

        </div>
      </section>

      {/* Full width bottom section */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Recent Activity Timeline</h2>
        </div>
        <div className={styles.timeline}>
          {data.timeline.length > 0 ? (
            data.timeline.map(log => (
              <div key={log.id} className={styles.timelineItem}>
                <div className={styles.timelineTime}>
                  {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className={styles.timelineContent}>
                  <strong>{log.action}</strong> {log.entity_type}: <em>{log.entity_name}</em>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>No recent activity</p>
          )}
        </div>
      </section>

    </div>
  );
}
