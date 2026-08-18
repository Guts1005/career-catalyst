'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/readiness').then(r => r.json()),
    ]).then(([dashData, readData]) => {
      setStats(dashData);
      setReadiness(readData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{greeting} 👋</h1>
          <p className={styles.subtitle}>Here's your career progress at a glance</p>
        </div>
        <div className={styles.headerScore}>
          <div className={styles.scoreRing}>
            <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="url(#scoreGradient)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(readiness?.score || 0) * 3.267} 326.7`}
                transform="rotate(-90 60 60)"
                className={styles.scoreCircle}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.scoreValue}>
              <span className={styles.scoreNumber}>{readiness?.score || 0}</span>
              <span className={styles.scorePercent}>%</span>
            </div>
          </div>
          <div className={styles.scoreLabel}>Resume Ready</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>🏆</div>
          <div className="stat-value">{stats?.certifications?.completed || 0}<span className={styles.statTotal}>/{stats?.certifications?.total || 0}</span></div>
          <div className="stat-label">Certifications Earned</div>
          {stats?.certifications?.in_progress > 0 && (
            <div className={styles.statExtra}>{stats.certifications.in_progress} in progress</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>🚀</div>
          <div className="stat-value">{stats?.projects?.completed || 0}<span className={styles.statTotal}>/{stats?.projects?.total || 0}</span></div>
          <div className="stat-label">Projects Completed</div>
          {stats?.projects?.in_progress > 0 && (
            <div className={styles.statExtra}>{stats.projects.in_progress} in progress</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>🎯</div>
          <div className="stat-value">{stats?.skills?.avg_level || 0}<span className={styles.statTotal}>%</span></div>
          <div className="stat-label">Avg Skill Level</div>
          <div className={styles.statExtra}>{stats?.skills?.total || 0} skills tracked</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>📌</div>
          <div className="stat-value">{stats?.jobs?.total || 0}</div>
          <div className="stat-label">Target Job Roles</div>
          <div className={styles.statExtra}>{stats?.jobs?.active_interviews || 0} active interviews</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>🧠</div>
          <div className="stat-value">{stats?.interview?.mastered || 0}<span className={styles.statTotal}>/{stats?.interview?.total || 0}</span></div>
          <div className="stat-label">Interview Qs Mastered</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(96, 165, 250, 0.1)', color: 'var(--info)' }}>📚</div>
          <div className="stat-value">{stats?.resources?.completed || 0}<span className={styles.statTotal}>/{stats?.resources?.total || 0}</span></div>
          <div className="stat-label">Resources Completed</div>
        </div>
      </div>

      {/* Score Breakdown & Deadlines Row */}
      <div className={styles.row}>
        {/* Readiness Breakdown */}
        <div className={`card ${styles.breakdownCard}`}>
          <div className="card-header">
            <div>
              <div className="card-title">Readiness Breakdown</div>
              <div className="card-subtitle">How your score is calculated</div>
            </div>
          </div>
          <div className={styles.breakdownList}>
            {readiness?.breakdown && Object.entries(readiness.breakdown).map(([key, data]) => (
              <div key={key} className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>
                  <span className={styles.breakdownName}>{formatKey(key)}</span>
                  <span className={styles.breakdownWeight}>{data.weight}% weight</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${data.score >= data.weight * 0.7 ? 'success' : data.score >= data.weight * 0.3 ? 'warning' : ''}`}
                    style={{ width: `${(data.score / data.weight) * 100}%` }}
                  />
                </div>
                <div className={styles.breakdownScore}>{data.score}/{data.weight} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className={`card ${styles.deadlinesCard}`}>
          <div className="card-header">
            <div>
              <div className="card-title">Upcoming Deadlines</div>
              <div className="card-subtitle">Don't miss these dates</div>
            </div>
          </div>
          {stats?.upcomingDeadlines?.length > 0 ? (
            <div className={styles.deadlineList}>
              {stats.upcomingDeadlines.map((item, i) => (
                <div key={i} className={styles.deadlineItem}>
                  <div className={styles.deadlineIcon}>{item.type === 'certification' ? '🏆' : '🚀'}</div>
                  <div className={styles.deadlineInfo}>
                    <div className={styles.deadlineName}>{item.name}</div>
                    <div className={styles.deadlineDate}>{formatDate(item.deadline)}</div>
                  </div>
                  <span className={`badge badge-${item.status.replace('_', '-')}`}>{item.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No deadlines set</div>
              <div className="empty-state-description">Add deadlines to your certifications and projects</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`card ${styles.quickActions}`}>
        <div className="card-header">
          <div className="card-title">Quick Actions & Career Accelerators</div>
        </div>
        <div className={styles.actionGrid}>
          <a href="/resume-builder" className={styles.actionCard}>
            <span className={styles.actionIcon}>📄</span>
            <span className={styles.actionLabel}>Resume Studio</span>
          </a>
          <a href="/job-tracker" className={styles.actionCard}>
            <span className={styles.actionIcon}>📌</span>
            <span className={styles.actionLabel}>Job Pipeline</span>
          </a>
          <a href="/interview-prep" className={styles.actionCard}>
            <span className={styles.actionIcon}>🧠</span>
            <span className={styles.actionLabel}>Interview Prep</span>
          </a>
          <a href="/certifications" className={styles.actionCard}>
            <span className={styles.actionIcon}>🏆</span>
            <span className={styles.actionLabel}>Certifications</span>
          </a>
          <a href="/projects" className={styles.actionCard}>
            <span className={styles.actionIcon}>🚀</span>
            <span className={styles.actionLabel}>New Project</span>
          </a>
          <a href="/ats-checker" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>ATS Checker</span>
          </a>
          <a href="/github" className={styles.actionCard}>
            <span className={styles.actionIcon}>🐙</span>
            <span className={styles.actionLabel}>GitHub Analyzer</span>
          </a>
          <a href="/skills" className={styles.actionCard}>
            <span className={styles.actionIcon}>🎯</span>
            <span className={styles.actionLabel}>Skill Map</span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className={`card ${styles.activityCard}`}>
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
          </div>
          <div className={styles.activityList}>
            {stats.recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <span className={styles.activityAction}>{item.action}</span>{' '}
                  <span className={styles.activityEntity}>{item.entity_name}</span>
                </div>
                <div className={styles.activityTime}>{formatTimeAgo(item.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
