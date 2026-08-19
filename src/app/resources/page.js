'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';

const TYPE_ICONS = {
  course: '📖',
  tutorial: '💻',
  book: '📕',
  article: '📰',
  video: '🎬',
  documentation: '📄',
  project: '🔧'
};

const TYPE_LABELS = {
  course: 'Course',
  tutorial: 'Tutorial',
  book: 'Book',
  article: 'Article',
  video: 'Video',
  documentation: 'Documentation',
  project: 'Project'
};

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and View
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCompleted, setFilterCompleted] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'course',
    topic: '',
    completed: false,
    rating: 0,
    notes: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

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
        rating: resource.rating || 0,
        notes: resource.notes || ''
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        url: '',
        type: 'course',
        topic: '',
        completed: false,
        rating: 0,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const isUpdate = !!editingResource;
      const url = isUpdate ? `/api/resources/${editingResource.id}` : '/api/resources';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        completed: formData.completed ? 1 : 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast(isUpdate ? 'Resource updated successfully!' : 'Technical resource added to library!', 'success');
        await fetchResources();
        handleCloseModal();
      }
    } catch (err) {
      console.error('Failed to save resource:', err);
      showToast('Failed to save resource', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Resource removed from library', 'info');
          fetchResources();
        }
      } catch (err) {
        console.error('Failed to delete resource:', err);
      }
    }
  };

  const toggleCompleted = async (resource) => {
    try {
      const newCompletedState = resource.completed === 1 ? 0 : 1;
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompletedState })
      });
      
      if (res.ok) {
        setResources(resources.map(r => 
          r.id === resource.id ? { ...r, completed: newCompletedState } : r
        ));
        showToast(newCompletedState === 1 ? 'Resource marked as Completed!' : 'Resource reopened for study', 'info');
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const updateRating = async (resource, ratingValue) => {
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingValue })
      });
      
      if (res.ok) {
        setResources(resources.map(r => 
          r.id === resource.id ? { ...r, rating: ratingValue } : r
        ));
      }
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter logic
  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          (r.topic && r.topic.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesCompleted = filterCompleted === 'all' || 
                             (filterCompleted === 'completed' && r.completed === 1) ||
                             (filterCompleted === 'pending' && r.completed === 0);
    return matchesSearch && matchesType && matchesCompleted;
  });

  // Stats
  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.completed === 1).length;
  
  // Get counts by type
  const typeCounts = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  
  const topType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];

  const StarRating = ({ rating, onChange, readonly = false }) => {
    return (
      <div className={styles.rating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={`${styles.star} ${star <= (rating || 0) ? styles.active : ''} ${readonly ? styles.readonly : ''}`}
            onClick={() => !readonly && onChange && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Learning Resources</h1>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <span>+</span> Add Resource
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalResources}</div>
          <div className={styles.statLabel}>Total Resources</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{completedResources}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{Math.round(completedResources/Math.max(1, totalResources)*100)}%</div>
          <div className={styles.statLabel}>Completion Rate</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{topType ? TYPE_ICONS[topType] : '📚'}</div>
          <div className={styles.statLabel}>Top Format ({topType ? TYPE_LABELS[topType] : '-'})</div>
        </div>
      </div>

      <div className={styles.controls}>
        <input 
          type="text" 
          placeholder="Search resources..." 
          className={styles.searchBar}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <select 
          className={styles.select}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{TYPE_ICONS[key]} {label}</option>
          ))}
        </select>
        
        <select 
          className={styles.select}
          value={filterCompleted}
          onChange={e => setFilterCompleted(e.target.value)}
        >
          <option value="all">Status: All</option>
          <option value="completed">Status: Completed</option>
          <option value="pending">Status: Pending</option>
        </select>

        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
            onClick={() => setView('grid')}
            title="Grid View"
          >
            ⊞
          </button>
          <button 
            className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
            onClick={() => setView('list')}
            title="List View"
          >
            ☰
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredResources.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No resources found</h3>
          <p>Try adjusting your filters or add a new resource.</p>
        </div>
      ) : (
        <div className={view === 'grid' ? styles.grid : styles.list}>
          {filteredResources.map(resource => (
            <div key={resource.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span className={styles.typeIcon} title={TYPE_LABELS[resource.type]}>
                    {TYPE_ICONS[resource.type]}
                  </span>
                  <div>
                    <h3 className={styles.cardTitle}>{resource.title}</h3>
                    {resource.topic && <span className={styles.topicBadge}>{resource.topic}</span>}
                  </div>
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.metaInfo}>
                  <label className={styles.completedToggle}>
                    <input 
                      type="checkbox" 
                      checked={resource.completed === 1}
                      onChange={() => toggleCompleted(resource)}
                    />
                    {resource.completed ? 'Completed' : 'Mark Complete'}
                  </label>
                  
                  {resource.completed === 1 && (
                    <StarRating 
                      rating={resource.rating} 
                      onChange={(rating) => updateRating(resource, rating)} 
                    />
                  )}
                </div>
                
                {resource.notes && (
                  <div>
                    {view === 'grid' && (
                      <button className={styles.notesToggle} onClick={() => toggleNotes(resource.id)}>
                        {expandedNotes[resource.id] ? 'Hide Notes' : 'View Notes'}
                      </button>
                    )}
                    {(expandedNotes[resource.id] || view === 'list') && (
                      <div className={styles.notesContent}>{resource.notes}</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className={styles.cardFooter}>
                {resource.url ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    Visit Link ↗
                  </a>
                ) : <span />}
                
                <div className={styles.actions}>
                  <button className={styles.iconBtn} onClick={() => handleOpenModal(resource)} title="Edit">
                    ✎
                  </button>
                  <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDelete(resource.id)} title="Delete">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>URL</label>
                <input 
                  type="url" 
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className={styles.formGroup} style={{flex: 1}}>
                  <label>Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup} style={{flex: 1}}>
                  <label>Topic / Subject</label>
                  <input 
                    type="text" 
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                    placeholder="e.g. Deep Learning"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                  <input 
                    type="checkbox" 
                    checked={formData.completed}
                    onChange={e => setFormData({...formData, completed: e.target.checked})}
                    style={{width: 'auto'}}
                  />
                  Mark as completed
                </label>
              </div>
              
              {formData.completed && (
                <div className={styles.formGroup}>
                  <label>Rating</label>
                  <StarRating 
                    rating={formData.rating} 
                    onChange={rating => setFormData({...formData, rating})}
                  />
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Key takeaways, review, etc."
                />
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
