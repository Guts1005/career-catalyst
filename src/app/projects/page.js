'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';

export default function ProjectsPage() {
  const { projects: contextProjects, setProjects: setContextProjects, skills, setSkills, refreshCareerState } = useCareer();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const initialForm = {
    name: '',
    description: '',
    status: 'completed',
    github_url: '',
    live_url: '',
    tech_stack: '',
    skills_demonstrated: '',
    category: 'Distributed Systems',
    impact: 'P99 latency < 15ms under 5k QPS',
  };
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !showModal && !selectedCaseStudy) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedCaseStudy(null);
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, selectedCaseStudy]);

  const handleOpenModal = (project = null, e = null) => {
    if (e) e.stopPropagation();
    if (project) {
      setEditId(project.id);
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'completed',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        tech_stack: project.technologies || project.tech_stack || '',
        skills_demonstrated: project.skills_demonstrated || project.technologies || '',
        category: project.category || 'Distributed Systems',
        impact: project.impact || '',
      });
    } else {
      setEditId(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editId) {
        setContextProjects(contextProjects.map((p) => (p.id === editId ? { ...p, ...formData } : p)));
        showToast('Project case study updated!', 'success');
      } else {
        const newProj = {
          id: `proj_${Date.now()}`,
          ...formData,
          verification_status: formData.github_url ? 'VERIFIED' : 'PROJECT',
        };
        setContextProjects([newProj, ...contextProjects]);

        // Auto-update skill evidence levels based on skills demonstrated in this project
        if (formData.skills_demonstrated) {
          const demonstratedSkills = formData.skills_demonstrated.split(',').map((s) => s.trim().toLowerCase());
          setSkills((prevSkills) =>
            prevSkills.map((s) => {
              if (demonstratedSkills.includes(s.name.toLowerCase())) {
                return {
                  ...s,
                  evidence_level: formData.github_url ? 'VERIFIED' : 'PROJECT',
                  current_level: Math.min(s.current_level + 10, 95),
                };
              }
              return s;
            })
          );
          showToast(`Project created: Verified evidence linked to ${demonstratedSkills.length} competencies!`, 'success');
        } else {
          showToast('Project created and added to portfolio evidence!', 'success');
        }
      }

      setShowModal(false);
      refreshCareerState();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  const filteredProjects = contextProjects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.technologies?.toLowerCase().includes(q) ||
      p.skills_demonstrated?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO & PROOF / 06"
        title={<>PORTFOLIO ARCHITECTURE<br />CASE STUDIES.</>}
        subtitle="Verifiable engineering artifacts, latency benchmarks, and architectural invariant write-ups."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>
            + NEW CASE STUDY
          </button>
        }
      />

      {/* Filters and Search */}
      <div className={styles.filters}>
        {['all', 'completed', 'in_progress', 'planned'].map((stg) => (
          <button
            key={stg}
            type="button"
            className={`${styles.filterBtn} ${statusFilter === stg ? styles.activeFilter : ''}`}
            onClick={() => setStatusFilter(stg)}
          >
            {stg.toUpperCase().replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className={styles.grid}>
        {filteredProjects.map((p, idx) => (
          <div
            key={p.id || idx}
            className={styles.card}
            onClick={() => setSelectedCaseStudy(p)}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <div className={styles.cardTop}>
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: p.verification_status === 'VERIFIED' ? 'var(--green-subtle)' : 'var(--bg-subtle)',
                    color: p.verification_status === 'VERIFIED' ? 'var(--green)' : 'var(--text-muted)',
                    border: `1px solid ${p.verification_status === 'VERIFIED' ? 'var(--green-border)' : 'var(--border)'}`,
                  }}
                >
                  {p.verification_status || 'PROJECT'}
                </span>
              </div>

              <p className={styles.cardDesc}>{p.description}</p>

              <div className={styles.cardMeta}>
                {(p.technologies || p.tech_stack || 'PyTorch, Docker').split(',').map((tech) => (
                  <span key={tech} className={styles.metaBadge}>
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.cardBottom}>
              <span className={styles.statusBadge} style={{ color: p.status === 'completed' ? 'var(--green)' : 'var(--amber)' }}>
                ● {p.status?.toUpperCase().replace('_', ' ') || 'COMPLETED'}
              </span>
              <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                EXPAND CASE STUDY →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Case Study Detail Modal */}
      {selectedCaseStudy && (
        <div className="modal-overlay" onClick={() => setSelectedCaseStudy(null)}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  PORTFOLIO EVIDENCE RECORD
                </span>
                <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '2px' }}>
                  {selectedCaseStudy.name}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedCaseStudy(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Problem & Architectural Approach
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-subtle)', padding: '14px', borderRadius: '4px', border: '1px solid var(--border)', margin: 0 }}>
                  {selectedCaseStudy.description}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Demonstrated Competencies
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedCaseStudy.skills_demonstrated || selectedCaseStudy.technologies || 'PyTorch, Docker').split(',').map((sk) => (
                    <span key={sk} style={{ fontSize: '11px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      ✓ {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCaseStudy.github_url && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Repository Evidence
                  </div>
                  <a
                    href={selectedCaseStudy.github_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--blue)', textDecoration: 'none' }}
                  >
                    ↗ {selectedCaseStudy.github_url}
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link
                href="/portfolio/sharvin"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px' }}
              >
                VIEW ON PUBLIC SHOWCASE ↗
              </Link>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedCaseStudy(null)}
              >
                CLOSE PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Case Study' : 'New Technical Project'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Distributed Triton Inference Gateway"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Architectural Overview & Metrics *</label>
                  <textarea
                    className="input"
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What problem does it solve? What were the benchmarked latency / throughput results?"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills Demonstrated (Comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.skills_demonstrated}
                    onChange={(e) => setFormData({ ...formData, skills_demonstrated: e.target.value })}
                    placeholder="PyTorch & CUDA, MLOps & Deployment, Docker & Kubernetes"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub Repository URL (For Verification)</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Save Changes' : 'Create & Link Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
