'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { CAREER_TRACKS, getRoleById } from '@/lib/careerGraph';
import { findBlueprintRecommendation } from '@/lib/gapBlueprintRegistry';

export default function SkillsPage() {
  const { targetRole, setTargetRole, skills, setSkills, readiness } = useCareer();
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('gap');
  const [hoveredNode, setHoveredNode] = useState(null);

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Machine Learning',
    current_level: 60,
    target_level: 90,
    importance: 'high',
    evidence_level: 'CLAIM',
  });

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category));
    return ['All', ...Array.from(cats)].sort();
  }, [skills]);

  const handleUpdateLevel = (id, level, name) => {
    setSkills(skills.map((s) => (s.id === id ? { ...s, current_level: parseInt(level) } : s)));
    showToast(`${name || 'Skill'} proficiency set to ${level}%`, 'info');
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    setSkills([
      ...skills,
      {
        id: `skill_${Date.now()}`,
        ...newSkill,
      },
    ]);
    showToast(`Skill "${newSkill.name}" added to competency radar!`, 'success');
    setNewSkill({ name: '', category: 'Machine Learning', current_level: 60, target_level: 90, importance: 'high', evidence_level: 'CLAIM' });
  };

  const filteredAndSortedSkills = useMemo(() => {
    let result = skills;
    if (filterCategory !== 'All') {
      result = result.filter((s) => s.category === filterCategory);
    }

    return result.sort((a, b) => {
      if (sortBy === 'gap') {
        const gapA = a.target_level - a.current_level;
        const gapB = b.target_level - b.current_level;
        return gapB - gapA;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.current_level - a.current_level;
    });
  }, [skills, filterCategory, sortBy]);

  const currentRoleDef = getRoleById(targetRole);

  // SVG Radar Chart Data calculations
  const radarSkills = skills.slice(0, 6);
  const radarPoints = useMemo(() => {
    const total = radarSkills.length || 6;
    const center = 150;
    const radius = 100;

    return radarSkills.map((s, idx) => {
      const angle = (Math.PI * 2 * idx) / total - Math.PI / 2;
      const ratio = (s.current_level || 50) / 100;
      const x = center + radius * ratio * Math.cos(angle);
      const y = center + radius * ratio * Math.sin(angle);
      const labelX = center + (radius + 24) * Math.cos(angle);
      const labelY = center + (radius + 24) * Math.sin(angle);
      return { ...s, x, y, labelX, labelY, angle };
    });
  }, [radarSkills]);

  const polygonPath = radarPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 05"
        title={<>COMPETENCY RADAR &<br />SKILL GAP MAP.</>}
        subtitle={`Systematic gap detection and evidence verification calibrated for ${currentRoleDef.title}.`}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {CAREER_TRACKS.flatMap((t) => t.roles).map((r) => (
                <option key={r.id} value={r.id}>
                  Target: {r.title}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{skills.length}</span>
          <span className={styles.summaryLabel}>Total Competencies Tracked</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{readiness?.breakdown?.skills?.score || 88}%</span>
          <span className={styles.summaryLabel}>Average Role Proficiency</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue} style={{ color: 'var(--amber)' }}>
            {readiness?.gaps?.length || 2}
          </span>
          <span className={styles.summaryLabel}>High-Priority Deltas (Gap &gt; 10%)</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue} style={{ color: 'var(--green)' }}>
            {skills.filter((s) => s.evidence_level === 'VERIFIED').length}
          </span>
          <span className={styles.summaryLabel}>Verified Codebase Evidence</span>
        </div>
      </div>

      {/* SVG Radar Chart Visualization */}
      <div className={styles.radarContainer}>
        <div className={styles.radarWrapper}>
          <svg viewBox="0 0 300 300" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            {/* Concentric Grid Circles */}
            {[0.25, 0.5, 0.75, 1.0].map((r) => (
              <circle
                key={r}
                cx="150"
                cy="150"
                r={100 * r}
                fill="none"
                stroke="var(--border)"
                strokeDasharray={r < 1.0 ? '2 2' : 'none'}
              />
            ))}

            {/* Radar Polygon Data */}
            {radarPoints.length > 2 && (
              <polygon
                points={polygonPath}
                fill="rgba(96, 165, 250, 0.15)"
                stroke="var(--text-primary)"
                strokeWidth="2"
              />
            )}

            {/* Radar Node Points & Labels */}
            {radarPoints.map((p, idx) => (
              <g key={p.id || idx}>
                <line x1="150" y1="150" x2={150 + 100 * Math.cos(p.angle)} y2={150 + 100 * Math.sin(p.angle)} stroke="var(--border)" strokeWidth="1" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="var(--bg-surface)"
                  stroke="var(--text-primary)"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredNode(p)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={p.labelX}
                  y={p.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill="var(--text-secondary)"
                >
                  {p.name.split(' ')[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Controls: Filter and Sort */}
      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Category:
          </span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`tag ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
                style={{
                  cursor: 'pointer',
                  background: filterCategory === cat ? 'var(--bg-inverse)' : 'transparent',
                  color: filterCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sort:
          </span>
          <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ fontSize: '12px', padding: '4px 8px' }}>
            <option value="gap">Largest Gap First</option>
            <option value="level">Highest Mastery First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Skill Cards Grid */}
      <div className={styles.skillGrid}>
        {filteredAndSortedSkills.map((s) => {
          const gap = Math.max((s.target_level || 90) - (s.current_level || 0), 0);
          return (
            <div key={s.id || s.name} className={styles.skillCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {s.category}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                    {s.name}
                  </h4>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: s.evidence_level === 'VERIFIED' ? 'var(--green-subtle)' : 'var(--bg-subtle)',
                    color: s.evidence_level === 'VERIFIED' ? 'var(--green)' : 'var(--text-muted)',
                    border: `1px solid ${s.evidence_level === 'VERIFIED' ? 'var(--green-border)' : 'var(--border)'}`,
                  }}
                >
                  {s.evidence_level || 'CLAIM'}
                </span>
              </div>

              {/* Progress Slider / Meter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  <span>Current: {s.current_level}%</span>
                  <span style={{ color: gap > 10 ? 'var(--amber)' : 'var(--text-muted)' }}>
                    Target: {s.target_level || 90}% {gap > 0 ? `(Δ -${gap}%)` : '✓ Met'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={s.current_level || 0}
                  onChange={(e) => handleUpdateLevel(s.id, e.target.value, s.name)}
                  style={{ width: '100%', accentColor: 'var(--text-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Connected Action Link: Build Project to close gap */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(() => {
                  const rec = findBlueprintRecommendation(s.name);
                  if (gap > 0 && rec) {
                    return (
                      <Link
                        href={rec.destination}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--green)',
                          background: 'var(--green-subtle, rgba(34, 197, 94, 0.1))',
                          border: '1px solid var(--green-border, rgba(34, 197, 94, 0.3))',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        aria-label={`View recommended blueprint ${rec.blueprintName} to resolve ${s.name} gap`}
                      >
                        <span>🚀 BLUEPRINT: {rec.blueprintName.slice(0, 24)}...</span>
                        <span>→</span>
                      </Link>
                    );
                  }
                  return null;
                })()}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    href={`/projects?skill=${encodeURIComponent(s.name)}`}
                    style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    BUILD PROJECT TO PROVE →
                  </Link>
                  <Link
                    href={`/interview-prep?topic=${encodeURIComponent(s.name)}`}
                    style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textDecoration: 'none' }}
                  >
                    PREP QUESTIONS ↗
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Skill Form */}
      <form onSubmit={handleAddSkill} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Skill Name</label>
          <input
            type="text"
            className="input"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            placeholder="e.g. CUDA Kernel Optimization, FlashAttention"
            required
            style={{ marginTop: '4px' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</label>
          <select
            className="select"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            style={{ marginTop: '4px' }}
          >
            <option value="Machine Learning">Machine Learning</option>
            <option value="Systems">Systems</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Data Systems">Data Systems</option>
            <option value="Programming">Programming</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ minHeight: '42px', padding: '0 20px' }}>
          + ADD COMPETENCY
        </button>
      </form>
    </div>
  );
}
