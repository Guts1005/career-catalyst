'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';

const BENCHMARK_PAPERS = [
  {
    id: 1,
    title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
    url: 'https://arxiv.org/abs/2307.08691',
    type: 'paper',
    topic: 'GPU Kernel Architecture',
    completed: 1,
    rating: 5,
    notes: 'Eliminates non-matmul FLOPs, optimizes thread block tiling for GPU shared memory, and parallelizes over sequence length dimension to achieve up to 73% of theoretical peak FP16 TFLOPs on A100/H100.',
  },
  {
    id: 2,
    title: 'DeepSeek-V3 Technical Report: Multi-Head Latent Attention & DeepSeekMoE',
    url: 'https://arxiv.org/abs/2412.19437',
    type: 'paper',
    topic: 'LLM Architecture & Scaling',
    completed: 1,
    rating: 5,
    notes: 'Multi-Head Latent Attention (MLA) compresses the KV cache into a low-rank latent vector to dramatically reduce inference memory footprint. DeepSeekMoE routes fine-grained experts with auxiliary-loss-free load balancing.',
  },
  {
    id: 3,
    title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
    url: 'https://arxiv.org/abs/2305.18290',
    type: 'paper',
    topic: 'RLHF & Alignment',
    completed: 1,
    rating: 5,
    notes: 'Derives closed-form implicit reward function to optimize preference objectives with a simple binary cross-entropy loss, bypassing PPO training stability issues.',
  },
  {
    id: 4,
    title: 'Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations',
    url: 'https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf',
    type: 'paper',
    topic: 'Compiler Systems',
    completed: 1,
    rating: 5,
    notes: 'Python-based programming model allowing engineers to write highly optimized custom GPU kernels with automated shared memory allocation, coalesced memory access, and tensor core scheduling.',
  },
  {
    id: 5,
    title: 'Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism',
    url: 'https://arxiv.org/abs/1909.08053',
    type: 'paper',
    topic: 'Distributed Training',
    completed: 0,
    rating: 5,
    notes: 'Tensor parallel matrix multiplications partitioned across column and row dimensions with minimal all-reduce collective communications.',
  },
];

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
    type: 'paper',
    topic: '',
    completed: false,
    rating: 5,
    notes: '',
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
        if (data && data.length > 0) {
          setResources(data);
        } else {
          setResources(BENCHMARK_PAPERS);
        }
      } else {
        setResources(BENCHMARK_PAPERS);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setResources(BENCHMARK_PAPERS);
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
        notes: resource.notes || '',
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        url: '',
        type: 'paper',
        topic: '',
        completed: false,
        rating: 5,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      if (editingResource) {
        setResources(resources.map((r) => (r.id === editingResource.id ? { ...r, ...formData, completed: formData.completed ? 1 : 0 } : r)));
        showToast('Resource entry updated!', 'success');
      } else {
        const newRes = {
          id: `res_${Date.now()}`,
          ...formData,
          completed: formData.completed ? 1 : 0,
        };
        setResources([newRes, ...resources]);
        showToast(`"${formData.title}" added to reading index!`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save resource:', err);
    }
  };

  const handleToggleComplete = (item, e) => {
    e.stopPropagation();
    const updated = item.completed === 1 ? 0 : 1;
    setResources(resources.map((r) => (r.id === item.id ? { ...r, completed: updated } : r)));
    showToast(updated === 1 ? 'Marked paper as Completed!' : 'Marked paper as Unread', 'info');
  };

  const filteredResources = resources.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterCompleted === 'completed' && item.completed !== 1) return false;
    if (filterCompleted === 'unread' && item.completed === 1) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.topic?.toLowerCase().includes(term) ||
      item.notes?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO & PROOF / 10"
        title={<>TECHNICAL READING INDEX &<br />FRONTIER PAPERS.</>}
        subtitle="Curated repository of breakthrough machine learning papers, distributed systems invariants, and compiler research."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>
            + LOG PAPER / RESOURCE
          </button>
        }
      />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '14px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TOTAL ARCHIVE</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
            {resources.length} Research Papers
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '14px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>PAPERS COMPLETED</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--green)', marginTop: '2px' }}>
            {resources.filter((r) => r.completed === 1).length} Analyzed
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '14px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>READING COMPLETION RATE</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
            {resources.length > 0 ? Math.round((resources.filter((r) => r.completed === 1).length / resources.length) * 100) : 100}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'completed', 'unread'].map((stg) => (
            <button
              key={stg}
              type="button"
              className={`tag ${filterCompleted === stg ? 'active' : ''}`}
              onClick={() => setFilterCompleted(stg)}
              style={{
                cursor: 'pointer',
                background: filterCompleted === stg ? 'var(--bg-inverse)' : 'transparent',
                color: filterCompleted === stg ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid var(--border-strong)',
              }}
            >
              {stg.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers, topics... (/)"
            style={{ fontSize: '12.5px', paddingRight: '30px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px', padding: '1px 5px' }}>
            /
          </span>
        </div>
      </div>

      {/* Papers Grid */}
      <div className={styles.grid}>
        {filteredResources.map((item, idx) => (
          <div
            key={item.id || idx}
            className={styles.card}
            onClick={() => setSelectedDoc(item)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                0{idx + 1} • {item.topic || 'Machine Learning'}
              </span>
              <button
                type="button"
                onClick={(e) => handleToggleComplete(item, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  color: item.completed === 1 ? 'var(--green)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {item.completed === 1 ? '✓ READ' : '○ UNREAD'}
              </button>
            </div>

            <h3 className={styles.cardTitle}>{item.title}</h3>

            {item.notes && (
              <p className={styles.notesSnippet} style={{ marginTop: '8px' }}>
                {item.notes}
              </p>
            )}

            {item.url && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--blue)', textDecoration: 'none' }}
                >
                  Read Paper / arXiv ↗
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingResource ? 'Edit Reading Record' : 'Log Frontier Paper'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveResource}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    <label className="form-label">Topic / Discipline</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g. GPU Kernels, RLHF, MoE"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Paper / Doc URL</label>
                    <input
                      type="url"
                      className="input"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://arxiv.org/abs/..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Research Takeaways & Invariants</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="What was the theoretical breakthrough or architectural invariant?"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Reading Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
