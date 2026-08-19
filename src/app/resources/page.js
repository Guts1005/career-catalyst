'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCompleted, setFilterCompleted] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const searchInputRef = useRef(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'article',
    topic: '',
    completed: false,
    rating: 5,
    notes: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !isModalOpen && !selectedDoc) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedDoc(null);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedDoc]);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        url: resource.url || '',
        type: resource.type,
        topic: resource.topic || '',
        completed: resource.completed === 1,
        rating: resource.rating || 5,
        notes: resource.notes || ''
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        url: '',
        type: 'article',
        topic: '',
        completed: false,
        rating: 5,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      if (editingResource) {
        await fetch(`/api/resources/${editingResource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast('Resource entry updated!', 'success');
      } else {
        await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showToast(`Resource "${formData.title}" added to index!`, 'success');
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      console.error('Failed to save resource:', err);
    }
  };

  const handleToggleComplete = async (resource, e) => {
    e.stopPropagation();
    const newStatus = resource.completed === 1 ? 0 : 1;
    try {
      await fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus === 1 })
      });
      setResources(resources.map(r => r.id === resource.id ? { ...r, completed: newStatus } : r));
      if (selectedDoc && selectedDoc.id === resource.id) {
        setSelectedDoc({ ...selectedDoc, completed: newStatus });
      }
      showToast(newStatus === 1 ? 'Marked as read!' : 'Marked as unread', 'info');
    } catch (err) {
      console.error('Failed to toggle completed:', err);
    }
  };

  const handleDeleteResource = async (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this resource from index?')) {
      try {
        await fetch(`/api/resources/${id}`, { method: 'DELETE' });
        showToast('Resource deleted from index', 'info');
        setSelectedDoc(null);
        fetchResources();
      } catch (err) {
        console.error('Failed to delete resource:', err);
      }
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = !search.trim() || r.title?.toLowerCase().includes(search.toLowerCase()) || r.topic?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesCompleted = filterCompleted === 'all' || (filterCompleted === 'completed' ? r.completed === 1 : r.completed === 0);
    return matchesSearch && matchesType && matchesCompleted;
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="TECHNICAL CORE / 06"
        title={<>READING<br />INDEX.</>}
        subtitle="A curated bibliography of machine learning papers, reference textbooks, and technical documentation."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ fontSize: '13px', padding: '8px 16px' }}>
            + ADD CITATION
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'article', 'book', 'course', 'documentation'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`btn ${filterType === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ textTransform: 'uppercase' }}
            >
              {t === 'article' ? 'PAPERS' : t}
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
            placeholder="Search bibliography... (/)"
            style={{ fontSize: '12px', paddingRight: '28px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '7px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)' }}>
            /
          </span>
        </div>
      </div>

      {/* Bibliography Ledger Table */}
      <div className={styles.grid}>
        {filteredResources.map((item, idx) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => setSelectedDoc(item)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-500)' }}>
                0{idx + 1}
              </span>
              <button
                type="button"
                onClick={(e) => handleToggleComplete(item, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  color: item.completed === 1 ? 'var(--green)' : 'var(--gray-400)',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {item.completed === 1 ? '✓ READ' : '○ UNREAD'}
              </button>
            </div>

            <h3 className={styles.cardTitle}>{item.title}</h3>

            {item.topic && (
              <span style={{ display: 'inline-block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-600)', background: 'var(--off-white)', padding: '2px 6px', borderRadius: '3px', marginTop: '6px' }}>
                {item.topic}
              </span>
            )}

            {item.notes && (
              <p className={styles.notesSnippet} style={{ marginTop: '8px' }}>
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ─── Document / Paper Inspection Drawer ─────────────────────── */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  BIBLIOGRAPHY CITATION
                </span>
                <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '2px' }}>
                  {selectedDoc.title}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: 'var(--off-white)', padding: '4px 8px', borderRadius: '3px' }}>
                  TYPE: {selectedDoc.type?.toUpperCase()}
                </span>
                {selectedDoc.topic && (
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', background: 'var(--off-white)', padding: '4px 8px', borderRadius: '3px' }}>
                    TOPIC: {selectedDoc.topic}
                  </span>
                )}
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: selectedDoc.completed === 1 ? 'var(--green)' : 'var(--gray-500)', padding: '4px 8px' }}>
                  {selectedDoc.completed === 1 ? '✓ READ' : '○ UNREAD'}
                </span>
              </div>

              {selectedDoc.notes && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '6px' }}>
                    SYNTHESIS NOTES & TAKEAWAYS:
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--black)', background: 'var(--off-white)', padding: '12px', borderRadius: '4px', border: '1px solid var(--gray-100)', lineHeight: 1.6 }}>
                    {selectedDoc.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={(e) => handleDeleteResource(selectedDoc.id, e)}
                style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                DELETE CITATION
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const curr = selectedDoc;
                    setSelectedDoc(null);
                    handleOpenModal(curr);
                  }}
                >
                  EDIT NOTES
                </button>
                {selectedDoc.url && (
                  <a href={selectedDoc.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    OPEN SOURCE ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingResource ? 'Edit Citation' : 'Add New Citation'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveResource}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Paper / Resource Title *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. FlashAttention-2: Faster Attention with Better Parallelism"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Media Type</label>
                    <select
                      className="input"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="article">Paper / Article</option>
                      <option value="book">Reference Book</option>
                      <option value="course">Course</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Technical Topic</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g. GPU Architecture"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">URL / DOI Link</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://arxiv.org/abs/..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Synthesis & Reading Notes</label>
                  <textarea
                    className="input"
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Key architectural equations, GPU kernel optimizations, or empirical benchmarks..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingResource ? 'Update Citation' : 'Add to Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
