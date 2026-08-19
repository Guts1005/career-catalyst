'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconSkills, IconCheck } from '@/components/Icons';

const ROLE_PROFILES = [
  { id: 'senior_ml', name: 'Senior ML Engineer', desc: 'Focus on Triton kernels, distributed training, and low-latency inference.' },
  { id: 'rag_architect', name: 'LLM Systems Architect', desc: 'Focus on hybrid search, vector indices, cross-encoders, and evaluation.' },
  { id: 'data_infra', name: 'Data Infrastructure Lead', desc: 'Focus on distributed data pipelines, Kafka streaming, and Spark orchestration.' },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('senior_ml');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('gap');
  const [hoveredNode, setHoveredNode] = useState(null);

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming',
    current_level: 0,
    target_level: 100,
    importance: 'medium',
  });

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category));
    return ['All', ...Array.from(cats)].sort();
  }, [skills]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    showToast(`Target role calibrated: ${ROLE_PROFILES.find(r => r.id === roleId)?.name}`, 'info');
  };

  const handleUpdateLevel = async (id, level, name) => {
    setSkills(skills.map((s) => (s.id === id ? { ...s, current_level: parseInt(level) } : s)));
    try {
      await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_level: parseInt(level) }),
      });
      showToast(`${name || 'Skill'} proficiency set to ${level}%`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill),
      });
      if (res.ok) {
        showToast(`Skill "${newSkill.name}" added to competency map!`, 'success');
        setNewSkill({ name: '', category: 'Programming', current_level: 0, target_level: 100, importance: 'medium' });
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    }
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
      } else if (sortBy === 'importance') {
        const impOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return impOrder[b.importance] - impOrder[a.importance];
      }
      return a.name.localeCompare(b.name);
    });
  }, [skills, filterCategory, sortBy]);

  const groupedSkills = useMemo(() => {
    const groups = {};
    filteredAndSortedSkills.forEach((skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      groups[skill.category].push(skill);
    });
    return groups;
  }, [filteredAndSortedSkills]);

  const overallGap = useMemo(() => {
    if (!skills.length) return 0;
    const totalCurrent = skills.reduce((sum, s) => sum + s.current_level, 0);
    const totalTarget = skills.reduce((sum, s) => sum + s.target_level, 0);
    return Math.round((totalCurrent / Math.max(1, totalTarget)) * 100);
  }, [skills]);

  const highPriorityCount = useMemo(() => {
    return skills.filter((s) => s.target_level - s.current_level > 20).length;
  }, [skills]);

  // Render Interactive Constellation Radar
  const renderRadarChart = () => {
    const categoryAverages = {};
    skills.forEach((s) => {
      if (!categoryAverages[s.category]) {
        categoryAverages[s.category] = { total: 0, count: 0 };
      }
      categoryAverages[s.category].total += (s.current_level / s.target_level) * 100;
      categoryAverages[s.category].count += 1;
    });

    const catKeys = Object.keys(categoryAverages);
    if (catKeys.length < 3) return null;

    const numPoints = catKeys.length;
    const size = 320;
    const center = size / 2;
    const radius = 100;

    const getCoordinates = (index, value) => {
      const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 24) * Math.cos(angle),
        labelY: center + (radius + 24) * Math.sin(angle),
      };
    };

    const points = catKeys.map((cat, i) => {
      const avg = Math.round(categoryAverages[cat].total / categoryAverages[cat].count);
      return {
        ...getCoordinates(i, avg),
        label: cat,
        value: avg,
      };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grid Circles */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio) => (
          <circle
            key={ratio}
            cx={center}
            cy={center}
            r={radius * ratio}
            fill="none"
            stroke="var(--gray-100)"
            strokeWidth="1"
          />
        ))}

        {/* Radial Axis Lines */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="var(--gray-200)"
            strokeWidth="1"
          />
        ))}

        {/* Data Area Polygon */}
        <path
          d={pathData}
          fill="rgba(10, 10, 10, 0.06)"
          stroke="var(--black)"
          strokeWidth="1.5"
        />

        {/* Interactive Data Points */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredNode(p)} onMouseLeave={() => setHoveredNode(null)}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--black)"
              stroke="var(--white)"
              strokeWidth="1.5"
              style={{ cursor: 'pointer' }}
            />
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fontWeight="600"
              fill="var(--gray-600)"
              fontFamily="var(--font-mono)"
            >
              {p.label.substring(0, 12)} ({p.value}%)
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 05"
        title={<>SKILL<br />GAP MAP.</>}
        subtitle="Identify the highest-impact competencies and technical deltas to improve for your target engineering roles."
      />

      {/* ─── Target Role Calibrator ─────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Calibrate Against Target Engineering Role:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ROLE_PROFILES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleChange(r.id)}
              style={{
                background: selectedRole === r.id ? 'var(--black)' : 'var(--white)',
                color: selectedRole === r.id ? 'var(--white)' : 'var(--black)',
                border: '1px solid',
                borderColor: selectedRole === r.id ? 'var(--black)' : 'var(--gray-200)',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Competencies</span>
          <span className={styles.summaryValue}>{skills.length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Overall Proficiency</span>
          <span className={styles.summaryValue}>{overallGap}%</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>High-Priority Deltas</span>
          <span className={styles.summaryValue} style={{ color: highPriorityCount > 0 ? 'var(--amber)' : 'var(--black)' }}>
            {highPriorityCount}
          </span>
        </div>
      </div>

      {/* Radar Map & Node Inspection */}
      {Object.keys(groupedSkills).length >= 3 && filterCategory === 'All' && (
        <div className={styles.radarContainer}>
          <div className={styles.radarWrapper}>
            {renderRadarChart()}
          </div>
          {hoveredNode && (
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'var(--black)', color: 'var(--white)', padding: '10px 14px', borderRadius: '4px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
              <div>DOMAIN: {hoveredNode.label}</div>
              <div>MASTERY: {hoveredNode.value}%</div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>CATEGORY:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.select}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="gap">Largest Gap Delta</option>
            <option value="importance">Priority Importance</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Skill List with Real-time Progress Adjusters */}
      <div className={styles.skillsGrid}>
        {Object.entries(groupedSkills).map(([category, catSkills]) => {
          const catTotal = catSkills.reduce((sum, s) => sum + s.current_level, 0);
          const catTarget = catSkills.reduce((sum, s) => sum + s.target_level, 0);
          const catProgress = Math.round((catTotal / Math.max(1, catTarget)) * 100);

          return (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryTitle}>{category}</span>
                <span className={styles.categoryProgressText}>{catProgress}% DOMAIN MASTERY</span>
              </div>

              <div className={styles.skillList}>
                {catSkills.map((skill) => {
                  const gap = skill.target_level - skill.current_level;
                  const isHighGap = gap > 20;

                  return (
                    <div key={skill.id} className={styles.skillCard}>
                      <div className={styles.skillHeader}>
                        <span className={styles.skillName}>{skill.name}</span>
                        <span className={`${styles.importanceBadge} ${isHighGap ? styles.importance_critical : styles.importance_medium}`}>
                          {isHighGap ? '● HIGH DELTA' : '● ON TRACK'}
                        </span>
                      </div>

                      <div className={styles.skillBars}>
                        <div className={styles.barRow}>
                          <div className={styles.barLabel}>
                            <span>Proficiency</span>
                            <span>{skill.current_level}% / {skill.target_level}%</span>
                          </div>
                          <div className={styles.barTrack}>
                            <div
                              className={styles.barFill}
                              style={{ width: `${(skill.current_level / skill.target_level) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.sliderContainer}>
                        <span className={styles.sliderLabel}>Adjust:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.current_level}
                          onChange={(e) => handleUpdateLevel(skill.id, e.target.value, skill.name)}
                          className={styles.slider}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
