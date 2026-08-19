'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    url: '',
    status: 'planned',
    progress: 0,
    priority: 'medium',
    deadline: '',
    category: '',
    estimated_hours: 0,
    notes: ''
  });

  useEffect(() => {
    fetchCertifications();
  }, [filter, search]);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter !== 'all') queryParams.append('status', filter);
      if (search) queryParams.append('search', search);
      
      const res = await fetch(`/api/certifications?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCertifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' || name === 'estimated_hours' ? Number(value) : value
    }));
  };

  const openModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        name: cert.name,
        provider: cert.provider,
        url: cert.url || '',
        status: cert.status,
        progress: cert.progress,
        priority: cert.priority,
        deadline: cert.deadline ? cert.deadline.substring(0, 10) : '',
        category: cert.category || '',
        estimated_hours: cert.estimated_hours || 0,
        notes: cert.notes || ''
      });
    } else {
      setEditingCert(null);
      setFormData({
        name: '',
        provider: '',
        url: '',
        status: 'planned',
        progress: 0,
        priority: 'medium',
        deadline: '',
        category: '',
        estimated_hours: 0,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
  };

  const saveCertification = async (e) => {
    e.preventDefault();
    try {
      const url = editingCert ? `/api/certifications/${editingCert.id}` : '/api/certifications';
      const method = editingCert ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast(editingCert ? 'Certification updated successfully!' : 'New credential added to portfolio!', 'success');
        closeModal();
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to save certification:', error);
      showToast('Failed to save certification', 'error');
    }
  };

  const deleteCertification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    
    try {
      const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Certification removed', 'info');
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  };

  const updateProgress = async (id, currentProgress) => {
    const newProgress = prompt('Enter new progress (0-100):', currentProgress);
    if (newProgress === null) return;
    
    const parsed = parseInt(newProgress, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert('Please enter a valid number between 0 and 100');
      return;
    }

    try {
      const status = parsed === 100 ? 'completed' : (parsed > 0 ? 'in_progress' : 'planned');
      const res = await fetch(`/api/certifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: parsed, status })
      });

      if (res.ok) {
        showToast(`Progress updated to ${parsed}%`, 'info');
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const markAsComplete = async (id) => {
    try {
      const res = await fetch(`/api/certifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 100, status: 'completed' })
      });

      if (res.ok) {
        showToast('Credential marked 100% Completed & Verified!', 'success');
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to complete certification:', error);
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Planned';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'in_progress': return styles.statusInProgress;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusPlanned;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Certifications</h1>
          <p>Track your professional growth and credential goals</p>
        </div>
        <button className={styles.addButton} onClick={() => openModal()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Certification
        </button>
      </header>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {['all', 'planned', 'in_progress', 'completed'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${filter === tab ? styles.activeTab : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className={styles.search}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search certifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : certifications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🏆</div>
          <h3>No certifications found</h3>
          <p>Add a new certification goal to start tracking your progress.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {certifications.map((cert) => (
            <div key={cert.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    {cert.url ? (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {cert.name}
                      </a>
                    ) : (
                      cert.name
                    )}
                  </h3>
                  <p className={styles.provider}>{cert.provider}</p>
                </div>
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => openModal(cert)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => deleteCertification(cert.id)} title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className={styles.badges}>
                <span className={`${styles.badge} ${getStatusClass(cert.status)}`}>
                  {formatStatus(cert.status)}
                </span>
                <span className={`${styles.badge} ${cert.priority === 'high' ? styles.priorityHigh : cert.priority === 'medium' ? styles.priorityMedium : styles.priorityLow}`}>
                  Priority: {cert.priority}
                </span>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Progress</span>
                  <span>{cert.progress}%</span>
                </div>
                <div className={styles.progressBarContainer} onClick={() => updateProgress(cert.id, cert.progress)}>
                  <div className={styles.progressBar} style={{ width: `${cert.progress}%` }}></div>
                </div>
              </div>

              <div className={styles.meta}>
                {cert.deadline && (
                  <div className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{new Date(cert.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                {cert.estimated_hours > 0 && (
                  <div className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{cert.estimated_hours} hrs</span>
                  </div>
                )}
              </div>

              {cert.status !== 'completed' && (
                <button className={styles.completeBtn} onClick={() => markAsComplete(cert.id)}>
                  Mark as Complete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCert ? 'Edit Certification' : 'Add Certification'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
            </div>
            
            <form onSubmit={saveCertification}>
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Certification Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="provider">Provider *</label>
                  <input
                    type="text"
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="url">URL</label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="progress">Progress (%)</label>
                    <input
                      type="number"
                      id="progress"
                      name="progress"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="priority">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="estimated_hours">Estimated Hours</label>
                    <input
                      type="number"
                      id="estimated_hours"
                      name="estimated_hours"
                      min="0"
                      value={formData.estimated_hours}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="deadline">Deadline</label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      placeholder="e.g. Machine Learning"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>
                  {editingCert ? 'Update' : 'Save'} Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
