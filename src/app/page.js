'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  IconDashboard,
  IconCertifications,
  IconProjects,
  IconSkills,
  IconJobs,
  IconInterview,
  IconResources,
  IconResume,
  IconATS,
  IconGitHub,
  IconArrowUpRight,
} from '@/components/Icons';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((r) => r.json()),
      fetch('/api/readiness').then((r) => r.json()),
    ])
      .then(([dashData, readData]) => {
        setStats(dashData);
        setReadiness(readData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Loading workspace metrics...</p>
      </div>
    );
  }

  const readinessScore = readiness?.score || 0;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            SYSTEM ACTIVE
          </div>
          <h1 className={styles.greeting} style={{ letterSpacing: '-0.03em' }}>Career Command Center</h1>
          <p className={styles.subtitle}>Real-time metrics across applications, algorithms, and technical credentials</p>
        </div>
        <div className={styles.headerScore}>
          <div className={styles.scoreRing}>
            <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={readinessScore >= 75 ? 'var(--success)' : 'var(--accent)'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${readinessScore * 3.267} 326.7`}
                transform="rotate(-90 60 60)"
                className={styles.scoreCircle}
              />
            </svg>
            <div className={styles.scoreValue}>
              <span className={styles.scoreNumber} style={{ fontFamily: 'var(--font-mono)' }}>{readinessScore}</span>
              <span className={styles.scorePercent}>%</span>
            </div>
          </div>
          <div className={styles.scoreLabel}>Profile Readiness</div>
        </div>
      </div>

      {/* Stat Cards - Bento Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <IconCertifications size={16} />
          </div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.certifications?.completed || 0}
            <span className={styles.statTotal}>/{stats?.certifications?.total || 0}</span>
          </div>
          <div className="stat-label">Certifications Earned</div>
          {stats?.certifications?.in_progress > 0 && (
            <div className={styles.statExtra}>{stats.certifications.in_progress} in progress</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <IconProjects size={16} />
          </div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.projects?.completed || 0}
            <span className={styles.statTotal}>/{stats?.projects?.total || 0}</span>
          </div>
          <div className="stat-label">Production Projects</div>
          {stats?.projects?.in_progress > 0 && (
            <div className={styles.statExtra}>{stats.projects.in_progress} active builds</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <IconSkills size={16} />
          </div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.skills?.avg_level || 0}
            <span className={styles.statTotal}>%</span>
          </div>
          <div className="stat-label">Average Proficiency</div>
          <div className={styles.statExtra}>{stats?.skills?.total || 0} tracked skills</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <IconJobs size={16} />
          </div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.jobs?.total || 0}
          </div>
          <div className="stat-label">Pipeline Applications</div>
          <div className={styles.statExtra}>{stats?.jobs?.active_interviews || 0} in active rounds</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <IconInterview size={16} />
          </div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.interview?.mastered || 0}
            <span className={styles.statTotal}>/{stats?.interview?.total || 0}</span>
          </div>
          <div className="stat-label">Interview Solutions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <IconResources size={16} />
          </div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {stats?.resources?.completed || 0}
            <span className={styles.statTotal}>/{stats?.resources?.total || 0}</span>
          </div>
          <div className="stat-label">Reference Material</div>
        </div>
      </div>

      {/* Score Breakdown & Deadlines Row */}
      <div className={styles.row}>
        {/* Readiness Breakdown */}
        <div className={`card ${styles.breakdownCard}`}>
          <div className="card-header">
            <div>
              <div className="card-title">Score Evaluation Breakdown</div>
              <div className="card-subtitle">Algorithmic weighting of your profile credentials</div>
            </div>
          </div>
          <div className={styles.breakdownList}>
            {readiness?.breakdown &&
              Object.entries(readiness.breakdown).map(([key, data]) => (
                <div key={key} className={styles.breakdownItem}>
                  <div className={styles.breakdownLabel}>
                    <span className={styles.breakdownName}>{formatKey(key)}</span>
                    <span className={styles.breakdownWeight} style={{ fontFamily: 'var(--font-mono)' }}>{data.weight}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '5px' }}>
                    <div
                      className={`progress-fill ${data.score >= data.weight * 0.7 ? 'success' : data.score >= data.weight * 0.3 ? 'warning' : ''}`}
                      style={{ width: `${(data.score / data.weight) * 100}%` }}
                    />
                  </div>
                  <div className={styles.breakdownScore} style={{ fontFamily: 'var(--font-mono)' }}>
                    {data.score}/{data.weight}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className={`card ${styles.deadlinesCard}`}>
          <div className="card-header">
            <div>
              <div className="card-title">Target Milestones & Deadlines</div>
              <div className="card-subtitle">Upcoming credential and project commitments</div>
            </div>
          </div>
          {stats?.upcomingDeadlines?.length > 0 ? (
            <div className={styles.deadlineList}>
              {stats.upcomingDeadlines.map((item, i) => (
                <div key={i} className={styles.deadlineItem}>
                  <div className={styles.deadlineIcon} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    {item.type === 'certification' ? <IconCertifications size={14} /> : <IconProjects size={14} />}
                  </div>
                  <div className={styles.deadlineInfo}>
                    <div className={styles.deadlineName}>{item.name}</div>
                    <div className={styles.deadlineDate} style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(item.deadline)}</div>
                  </div>
                  <span className={`badge badge-${item.status.replace('_', '-')}`}>{item.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No upcoming deadlines</div>
              <div className="empty-state-description">Set target dates on your certifications and projects</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launchers */}
      <div className={`card ${styles.quickActions}`}>
        <div className="card-header">
          <div className="card-title">Quick Launchers</div>
        </div>
        <div className={styles.actionGrid}>
          <Link href="/resume-builder" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconResume size={16} /></span>
            <span className={styles.actionLabel}>Resume Builder</span>
          </Link>
          <Link href="/job-tracker" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconJobs size={16} /></span>
            <span className={styles.actionLabel}>Applications</span>
          </Link>
          <Link href="/interview-prep" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconInterview size={16} /></span>
            <span className={styles.actionLabel}>Interview Bank</span>
          </Link>
          <Link href="/certifications" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconCertifications size={16} /></span>
            <span className={styles.actionLabel}>Certifications</span>
          </Link>
          <Link href="/projects" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconProjects size={16} /></span>
            <span className={styles.actionLabel}>Projects</span>
          </Link>
          <Link href="/ats-checker" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconATS size={16} /></span>
            <span className={styles.actionLabel}>ATS Parser</span>
          </Link>
          <Link href="/github" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconGitHub size={16} /></span>
            <span className={styles.actionLabel}>GitHub Sync</span>
          </Link>
          <Link href="/skills" className={styles.actionCard}>
            <span className={styles.actionIcon}><IconSkills size={16} /></span>
            <span className={styles.actionLabel}>Skill Map</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className={`card ${styles.activityCard}`}>
          <div className="card-header">
            <div className="card-title">Activity Audit Trail</div>
          </div>
          <div className={styles.activityList}>
            {stats.recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <span className={styles.activityAction} style={{ textTransform: 'capitalize' }}>{item.action}</span>{' '}
                  <span className={styles.activityEntity}>{item.entity_name}</span>
                </div>
                <div className={styles.activityTime} style={{ fontFamily: 'var(--font-mono)' }}>{formatTimeAgo(item.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatKey(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}
