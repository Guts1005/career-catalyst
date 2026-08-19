'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import {
  IconSkills,
  IconCheck,
} from '@/components/Icons';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('gap');

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
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    });
    return groups;
  }, [filteredAndSortedSkills]);

  const categoryAverages = useMemo(() => {
    const avgs = {};
    Object.entries(groupedSkills).forEach(([cat, catSkills]) => {
      const total = catSkills.reduce((sum, s) => sum + s.current_level, 0);
      avgs[cat] = Math.round(total / (catSkills.length || 1));
    });
    return avgs;
  }, [groupedSkills]);

  const overallGap = useMemo(() => {
    if (skills.length === 0) return 0;
    const total = skills.reduce((sum, s) => sum + s.current_level, 0);
    return Math.round(total / skills.length);
  }, [skills]);

  const getStatusClass = (current, target) => {
    const ratio = current / target;
    if (ratio >= 0.8) return styles.status_mastered;
    if (ratio >= 0.4) return styles.status_warning;
    return styles.status_poor;
  };

  const renderRadarChart = () => {
    const catKeys = Object.keys(groupedSkills);
    if (catKeys.length < 3) return <div className={styles.categoryProgressText}>Add more categories for radar chart</div>;

    const size = 300;
    const center = size / 2;
    const radius = size / 2.5;

    const points = catKeys.map((cat, i) => {
      const angle = (Math.PI * 2 * i) / catKeys.length - Math.PI / 2;
      const score = (categoryAverages[cat] || 0) / 100;
      return {
        x: center + radius * score * Math.cos(angle),
        y: center + radius * score * Math.sin(angle),
        labelX: center + (radius + 25) * Math.cos(angle),
        labelY: center + (radius + 25) * Math.sin(angle),
        label: cat,
      };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    const maxPoints = catKeys.map((cat, i) => {
      const angle = (Math.PI * 2 * i) / catKeys.length - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
    const maxPathData = maxPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <path d={maxPathData} fill="none" stroke="var(--border-light)" strokeWidth="1" />
        {[0.2, 0.4, 0.6, 0.8].map((scale) => {
          const webPoints = catKeys.map((cat, i) => {
            const angle = (Math.PI * 2 * i) / catKeys.length - Math.PI / 2;
            return {
              x: center + radius * scale * Math.cos(angle),
              y: center + radius * scale * Math.sin(angle),
            };
          });
          const webPath = webPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
          return <path key={scale} d={webPath} fill="none" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="2 2" />;
        })}
        {maxPoints.map((p, i) => (
          <line key={`axis-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} stroke="var(--border-light)" strokeWidth="1" />
        ))}
        <path d={pathData} fill="var(--accent-subtle)" stroke="var(--accent)" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={`pt-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--accent)" />
        ))}
        {points.map((p, i) => (
          <text
            key={`lbl-${i}`}
            x={p.labelX}
            y={p.labelY}
            fill="var(--text-secondary)"
            fontSize="10"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono)"
          >
            {p.label} ({categoryAverages[catKeys[i]]}%)
          </text>
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

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Skills Tracked</span>
          <span className={styles.summaryValue} style={{ fontFamily: 'var(--font-mono)' }}>{skills.length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Overall Proficiency</span>
          <span className={styles.summaryValue} style={{ fontFamily: 'var(--font-mono)' }}>{overallGap}%</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Specialization Categories</span>
          <span className={styles.summaryValue} style={{ fontFamily: 'var(--font-mono)' }}>{Object.keys(groupedSkills).length}</span>
        </div>
      </div>

      {Object.keys(groupedSkills).length >= 3 && filterCategory === 'All' && (
        <div className={styles.radarContainer}>
          <div className={styles.radarWrapper}>
            {renderRadarChart()}
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="gap">Sort by Gap (Largest First)</option>
          <option value="importance">Sort by Importance</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <form className={styles.addForm} onSubmit={handleAddSkill}>
        <h3 className={styles.categoryTitle} style={{ fontSize: '13.5px', marginBottom: '12px' }}>Add Technical Skill</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Skill Name</label>
            <input
              required
              className={styles.input}
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g. PyTorch, Triton, CUDA"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <input
              required
              className={styles.input}
              type="text"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              placeholder="e.g. Deep Learning, Systems, MLOps"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Priority / Weight</label>
            <select
              className={styles.select}
              value={newSkill.importance}
              onChange={(e) => setNewSkill({ ...newSkill, importance: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <button type="submit" className={styles.button} style={{ fontSize: '12.5px', padding: '7px 16px', marginTop: '10px' }}>
          Add Skill to Radar
        </button>
      </form>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>Loading competencies...</div>
      ) : (
        <div className={styles.skillsGrid}>
          {Object.entries(groupedSkills).map(([category, catSkills]) => (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle} style={{ fontSize: '14px' }}>{category}</h2>
                <div className={styles.categoryProgress}>
                  <span className={styles.categoryProgressText} style={{ fontFamily: 'var(--font-mono)' }}>
                    {categoryAverages[category]}% Complete
                  </span>
                </div>
              </div>

              <div className={styles.skillList}>
                {catSkills.map((skill) => (
                  <div key={skill.id} className={styles.skillCard}>
                    <div className={styles.skillHeader}>
                      <h3 className={styles.skillName} style={{ fontSize: '13.5px' }}>{skill.name}</h3>
                      <span className={`${styles.importanceBadge} ${styles['importance_' + skill.importance]}`} style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
                        {skill.importance}
                      </span>
                    </div>

                    <div className={styles.skillBars}>
                      <div className={styles.barRow}>
                        <div className={styles.barLabel}>
                          <span>Target ({skill.target_level}%)</span>
                        </div>
                        <div className={styles.barTrack} style={{ height: '4px' }}>
                          <div className={`${styles.barFill} ${styles.targetFill}`} style={{ width: `${skill.target_level}%` }} />
                        </div>
                      </div>

                      <div className={styles.barRow}>
                        <div className={styles.barLabel}>
                          <span>Current ({skill.current_level}%)</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{skill.target_level - skill.current_level}% Gap</span>
                        </div>
                        <div className={styles.barTrack} style={{ height: '4px' }}>
                          <div
                            className={`${styles.barFill} ${getStatusClass(skill.current_level, skill.target_level)}`}
                            style={{ width: `${skill.current_level}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.sliderContainer} style={{ marginTop: '10px' }}>
                      <input
                        type="range"
                        className={styles.slider}
                        min="0"
                        max={skill.target_level}
                        value={skill.current_level}
                        onChange={(e) => handleUpdateLevel(skill.id, e.target.value, skill.name)}
                      />
                      <span className={styles.sliderLabel} style={{ fontSize: '10.5px' }}>Adjust Level</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
