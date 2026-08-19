'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  const initialForm = {
    name: '', description: '', status: 'planned', 
    github_url: '', live_url: '', tech_stack: '', 
    category: '', impact: '', start_date: '', end_date: '',
    milestones: [{ name: '', due_date: '' }]
  };
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

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

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const getProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const handleOpenModal = (project = null, e = null) => {
    if (e) e.stopPropagation();
    if (project) {
      setEditId(project.id);
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planned',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        tech_stack: project.tech_stack || '',
        category: project.category || '',
        impact: project.impact || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        milestones: []
      });
    } else {
      setEditId(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetch(`/api/projects/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast('Project updated successfully!', 'success');
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast(`Project "${formData.name}" added to portfolio!`, 'success');
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to save project', err);
      showToast('Failed to save project', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        showToast('Project deleted from portfolio', 'info');
        setSelectedCaseStudy(null);
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete project', err);
      }
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.tech_stack?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO / 01"
        title={<>WHAT<br />YOU'VE BUILT.</>}
        subtitle="A structured archive of your production machine learning systems, architectures, and measurable outcomes."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ fontSize: '13px', padding: '8px 16px' }}>
            + NEW ARCHITECTURE
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'in_progress', 'completed', 'planned'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ textTransform: 'uppercase' }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', maxWidth: '280px', width: '100%' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects... (/)"
            style={{ fontSize: '12px', paddingRight: '28px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '7px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)' }}>
            /
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ fontSize: '13.5px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            No engineering projects found matching current criteria.
          </p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            CREATE FIRST ARCHITECTURE
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProjects.map((project, index) => {
            const progress = getProgress(project.milestones);
            return (
              <div
                key={project.id}
                className={styles.card}
                onClick={() => setSelectedCaseStudy(project)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-500)' }}>
                    0{index + 1}
                  </span>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: project.status === 'completed' ? 'var(--green)' : 'var(--blue)', fontWeight: 700, textTransform: 'uppercase' }}>
                    ● {project.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{project.name}</h3>

                <p className={styles.description}>
                  {project.description}
                </p>

                {project.tech_stack && (
                  <div className={styles.techStack}>
                    {project.tech_stack.split(',').map((tech, i) => (
                      <span key={i} className={styles.techTag}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.progressContainer} style={{ marginTop: '16px' }}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: project.status === 'completed' ? '100%' : `${progress}%`,
                        background: 'var(--black)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Case-Study Deep Dive Drawer / Modal ────────────────────── */}
      {selectedCaseStudy && (
        <div className="modal-overlay" onClick={() => setSelectedCaseStudy(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  SYSTEM ARCHITECTURE CASE STUDY
                </span>
                <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '2px' }}>
                  {selectedCaseStudy.name}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedCaseStudy(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '4px' }}>
                  SYSTEM SUMMARY & ARCHITECTURE:
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--black)', lineHeight: 1.6 }}>
                  {selectedCaseStudy.description}
                </p>
              </div>

              {selectedCaseStudy.impact && (
                <div style={{ background: 'var(--off-white)', padding: '12px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>
                    MEASURABLE OUTCOME / STAR IMPACT:
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--black)', marginTop: '4px' }}>
                    {selectedCaseStudy.impact}
                  </div>
                </div>
              )}

              {selectedCaseStudy.tech_stack && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '6px' }}>
                    ENGINEERING STACK:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedCaseStudy.tech_stack.split(',').map((tech) => (
                      <span key={tech} style={{ fontSize: '11px', background: 'var(--off-white)', border: '1px solid var(--gray-200)', padding: '3px 8px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={(e) => handleDelete(selectedCaseStudy.id, e)}
                style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                DELETE PROJECT
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const curr = selectedCaseStudy;
                    setSelectedCaseStudy(null);
                    handleOpenModal(curr);
                  }}
                >
                  EDIT DETAILS
                </button>
                {selectedCaseStudy.github_url && (
                  <a href={selectedCaseStudy.github_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    VIEW REPO ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Project' : 'New Project'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Distributed LLM Serving Engine"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Technical Description *</label>
                  <textarea
                    required
                    className="input"
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe problem, architecture and implementation details..."
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. MLOps / Systems"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.tech_stack}
                    onChange={e => setFormData({...formData, tech_stack: e.target.value})}
                    placeholder="e.g. PyTorch, Triton, FastAPI, Docker"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Measurable Impact / STAR Metric</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.impact}
                    onChange={e => setFormData({...formData, impact: e.target.value})}
                    placeholder="e.g. Reduced p99 latency by 45% via KV-cache optimizations"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Save Changes' : 'Create Architecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
