'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  
  const initialForm = {
    name: '', description: '', status: 'planned', 
    github_url: '', live_url: '', tech_stack: '', 
    category: '', impact: '', start_date: '', end_date: '',
    milestones: [{ name: '', due_date: '' }]
  };
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [newMilestoneName, setNewMilestoneName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

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

  const handleOpenModal = (project = null) => {
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
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        showToast('Project deleted from portfolio', 'info');
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  const toggleMilestone = async (projectId, milestoneId, currentStatus) => {
    try {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone_id: milestoneId, completed: !currentStatus })
      });
      showToast(!currentStatus ? 'Milestone marked as complete!' : 'Milestone reopened', 'info');
      fetchProjects();
    } catch (err) {
      console.error('Failed to toggle milestone', err);
    }
  };

  const addMilestone = async (projectId) => {
    if (!newMilestoneName.trim()) return;
    try {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMilestoneName })
      });
      setNewMilestoneName('');
      fetchProjects();
    } catch (err) {
      console.error('Failed to add milestone', err);
    }
  };

  const deleteMilestone = async (projectId, milestoneId) => {
    try {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone_id: milestoneId })
      });
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete milestone', err);
    }
  };

  const addFormMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { name: '', due_date: '' }]
    });
  };

  const updateFormMilestone = (index, field, value) => {
    const newMs = [...formData.milestones];
    newMs[index][field] = value;
    setFormData({ ...formData, milestones: newMs });
  };

  const removeFormMilestone = (index) => {
    const newMs = formData.milestones.filter((_, i) => i !== index);
    setFormData({ ...formData, milestones: newMs });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return styles.statusCompleted;
      case 'in_progress': return styles.statusInProgress;
      case 'planned': return styles.statusPlanned;
      case 'paused': return styles.statusPaused;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO / 01"
        title={<>WHAT<br />YOU'VE BUILT.</>}
        subtitle="A structured archive of your production machine learning systems, architectures, and measurable outcomes."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ fontSize: '13px', padding: '8px 16px' }}>
            + NEW PROJECT
          </button>
        }
      />

      <div className={styles.filters}>
        {['all', 'planned', 'in_progress', 'completed', 'paused'].map(status => (
          <button 
            key={status} 
            className={`${styles.filterBtn} ${statusFilter === status ? styles.activeFilter : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>No projects yet</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: '13px', marginBottom: '16px' }}>Your portfolio starts with one good project.</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            CREATE PROJECT →
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map(project => {
            const progress = getProgress(project.milestones);
            const isExpanded = expandedProjectId === project.id;
            
            return (
              <div 
                key={project.id} 
                className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''}`}
                onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <h3 className={styles.cardTitle}>{project.name}</h3>
                    <span className={`${styles.statusBadge} ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleOpenModal(project); }}>
                      ✎
                    </button>
                    <button className={styles.iconBtn} onClick={(e) => handleDelete(project.id, e)}>
                      ×
                    </button>
                  </div>
                </div>

                <p className={styles.description}>{project.description || 'No description provided.'}</p>

                {project.tech_stack && (
                  <div className={styles.tags}>
                    {project.tech_stack.split(',').map((tech, i) => (
                      <span key={i} className={styles.tag}>{tech.trim()}</span>
                    ))}
                  </div>
                )}

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>Milestones</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className={styles.links}>
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={styles.link} onClick={e => e.stopPropagation()}>GitHub ↗</a>}
                  {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={styles.link} onClick={e => e.stopPropagation()}>Live Demo ↗</a>}
                </div>

                {isExpanded && (
                  <div className={styles.expandedContent} onClick={e => e.stopPropagation()}>
                    <h4 className={styles.sectionTitle}>Milestones</h4>
                    
                    <div className={styles.milestoneList}>
                      {project.milestones?.length === 0 ? (
                        <p className={styles.noMilestones}>No milestones yet.</p>
                      ) : (
                        project.milestones?.map(ms => (
                          <div key={ms.id} className={styles.milestoneItem}>
                            <label className={styles.checkboxLabel}>
                              <input 
                                type="checkbox" 
                                checked={!!ms.completed} 
                                onChange={() => toggleMilestone(project.id, ms.id, !!ms.completed)}
                              />
                              <span className={!!ms.completed ? styles.completedText : ''}>{ms.name}</span>
                            </label>
                            <button className={styles.deleteMilestone} onClick={() => deleteMilestone(project.id, ms.id)}>
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className={styles.addMilestone}>
                      <input 
                        type="text" 
                        placeholder="New milestone..." 
                        value={newMilestoneName}
                        onChange={(e) => setNewMilestoneName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addMilestone(project.id)}
                        className={styles.input}
                      />
                      <button className={styles.secondaryBtn} onClick={() => addMilestone(project.id)}>
                        Add
                      </button>
                    </div>

                    {project.impact && (
                      <div className={styles.impactSection}>
                        <h4 className={styles.sectionTitle}>Project Impact</h4>
                        <p className={styles.impactText}>{project.impact}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Edit Project' : 'New Project'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Project Name *</label>
                  <input required className={styles.input} type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select className={styles.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea className={styles.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3}></textarea>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Tech Stack (comma separated)</label>
                  <input className={styles.input} type="text" value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} placeholder="Python, PyTorch, Pandas..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <input className={styles.input} type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="NLP, Computer Vision..." />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>GitHub URL</label>
                  <input className={styles.input} type="url" value={formData.github_url} onChange={e => setFormData({...formData, github_url: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Live Demo URL</label>
                  <input className={styles.input} type="url" value={formData.live_url} onChange={e => setFormData({...formData, live_url: e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Impact / Results</label>
                <textarea className={styles.textarea} value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} rows={2} placeholder="Achieved 95% accuracy..."></textarea>
              </div>

              {!editId && (
                <div className={styles.formGroup}>
                  <label>Initial Milestones</label>
                  {formData.milestones.map((ms, idx) => (
                    <div key={idx} className={styles.milestoneInputRow}>
                      <input 
                        className={styles.input} 
                        type="text" 
                        placeholder="Milestone name" 
                        value={ms.name} 
                        onChange={e => updateFormMilestone(idx, 'name', e.target.value)} 
                      />
                      <button type="button" className={styles.iconBtn} onClick={() => removeFormMilestone(idx)}>×</button>
                    </div>
                  ))}
                  <button type="button" className={styles.secondaryBtn} onClick={addFormMilestone}>+ Add Milestone</button>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
