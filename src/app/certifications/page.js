'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const searchInputRef = useRef(null);
  
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

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !isModalOpen && !selectedPreview) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedPreview(null);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedPreview]);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter !== 'all') queryParams.append('status', filter);
      if (search) queryParams.append('search', search);
      
      const res = await fetch(`/api/certifications?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCertifications(data);
        } else {
          setCertifications([
            { id: 1, name: 'AWS Certified Machine Learning – Specialty', provider: 'Amazon Web Services', status: 'completed', progress: 100, category: 'Cloud ML Systems', priority: 'high' },
            { id: 2, name: 'Google Cloud Professional ML Engineer', provider: 'Google Cloud', status: 'completed', progress: 100, category: 'Infrastructure', priority: 'high' },
            { id: 3, name: 'Deep Learning Specialization', provider: 'DeepLearning.AI', status: 'completed', progress: 100, category: 'Deep Learning Theory', priority: 'medium' },
          ]);
        }
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

  const openModal = (cert = null, e = null) => {
    if (e) e.stopPropagation();
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
        showToast(editingCert ? 'Certification updated!' : 'Certification recorded!', 'success');
        closeModal();
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to save certification:', error);
      showToast('Error saving certification', 'error');
    }
  };

  const deleteCertification = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Remove this credential from archive?')) return;
    try {
      const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Credential removed', 'info');
        setSelectedPreview(null);
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 04"
        title={<>CREDENTIAL<br />ARCHIVE.</>}
        subtitle="A verified record of your technical certifications, specializations, and professional qualifications."
        actions={
          <button className="btn btn-primary" onClick={() => openModal()} style={{ fontSize: '13px', padding: '8px 16px' }}>
            + RECORD CREDENTIAL
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'completed', 'in_progress', 'planned'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credentials... (/)"
            style={{ fontSize: '12px', paddingRight: '28px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '7px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)' }}>
            /
          </span>
        </div>
      </div>

      {/* Certifications Grid */}
      <div className={styles.grid}>
        {certifications.map((cert, index) => (
          <div
            key={cert.id}
            className={styles.card}
            onClick={() => setSelectedPreview(cert)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-500)' }}>
                0{index + 1}
              </span>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: cert.status === 'completed' ? 'var(--green)' : 'var(--blue)', fontWeight: 700, textTransform: 'uppercase' }}>
                ● {cert.status.replace('_', ' ')}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{cert.name}</h3>

            <div style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {cert.provider}
            </div>

            {cert.category && (
              <span style={{ display: 'inline-block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--black)', background: 'var(--off-white)', padding: '2px 6px', borderRadius: '3px', marginTop: '8px', border: '1px solid var(--gray-100)' }}>
                {cert.category}
              </span>
            )}

            <div className={styles.progressContainer} style={{ marginTop: '16px' }}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${cert.progress}%`,
                    background: 'var(--black)'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Document / Credential Preview Drawer ───────────────────── */}
      {selectedPreview && (
        <div className="modal-overlay" onClick={() => setSelectedPreview(null)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  VERIFIED CREDENTIAL RECORD
                </span>
                <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '2px' }}>
                  {selectedPreview.name}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedPreview(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>ISSUER</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px' }}>{selectedPreview.provider}</div>
                </div>
                <div style={{ background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>STATUS</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{selectedPreview.status}</div>
                </div>
                <div style={{ background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>EFFORT</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px' }}>{selectedPreview.estimated_hours || 40} Hours</div>
                </div>
              </div>

              {selectedPreview.notes && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '4px' }}>
                    CURRICULUM SYLLABUS & COMPETENCY NOTES:
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--black)', background: 'var(--off-white)', padding: '12px', borderRadius: '4px', border: '1px solid var(--gray-100)', lineHeight: 1.6 }}>
                    {selectedPreview.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={(e) => deleteCertification(selectedPreview.id, e)}
                style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                REMOVE CREDENTIAL
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const curr = selectedPreview;
                    setSelectedPreview(null);
                    openModal(curr);
                  }}
                >
                  EDIT RECORD
                </button>
                {selectedPreview.url && (
                  <a href={selectedPreview.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    VERIFY CREDENTIAL ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCert ? 'Edit Credential' : 'Record New Credential'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={saveCertification}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Certification Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. AWS Certified Machine Learning — Specialty"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Issuing Organization *</label>
                    <input
                      type="text"
                      name="provider"
                      required
                      className="input"
                      value={formData.provider}
                      onChange={handleInputChange}
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="input"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Completion Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      className="input"
                      value={formData.progress}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Hours</label>
                    <input
                      type="number"
                      name="estimated_hours"
                      min="0"
                      className="input"
                      value={formData.estimated_hours}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Verification URL / Badge Link</label>
                  <input
                    type="url"
                    name="url"
                    className="input"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://credly.com/badges/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Curriculum / Syllabus Notes</label>
                  <textarea
                    name="notes"
                    className="input"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Key concepts covered (e.g. SageMaker, Feature Store, Hyperparameter Tuning)..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCert ? 'Save Changes' : 'Record Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
