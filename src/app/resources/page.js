'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';

const BENCHMARK_PAPERS = [
  {
    id: 1,
    title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
    authors: 'Tri Dao (Stanford / Together AI)',
    arxivId: 'arXiv:2307.08691',
    year: '2023',
    url: 'https://arxiv.org/abs/2307.08691',
    type: 'paper',
    topic: 'GPU Kernel Architecture',
    completed: 1,
    rating: 5,
    notes: 'Eliminates non-matmul FLOPs, optimizes thread block tiling for GPU shared memory (SRAM), and parallelizes over sequence length dimension to achieve up to 73% of theoretical peak FP16 TFLOPs on A100/H100 GPUs.',
  },
  {
    id: 2,
    title: 'DeepSeek-V3 Technical Report: Multi-Head Latent Attention & DeepSeekMoE',
    authors: 'DeepSeek-AI Team',
    arxivId: 'arXiv:2412.19437',
    year: '2024',
    url: 'https://arxiv.org/abs/2412.19437',
    type: 'paper',
    topic: 'LLM Architecture & Scaling',
    completed: 1,
    rating: 5,
    notes: 'Multi-Head Latent Attention (MLA) compresses the KV cache into a low-rank latent vector to dramatically reduce inference memory footprint. DeepSeekMoE routes fine-grained experts with auxiliary-loss-free load balancing.',
  },
  {
    id: 3,
    title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention',
    authors: 'Woosuk Kwon et al. (UC Berkeley / LMSYS)',
    arxivId: 'SOSP 2023 / arXiv:2309.06180',
    year: '2023',
    url: 'https://arxiv.org/abs/2309.06180',
    type: 'paper',
    topic: 'Inference Systems',
    completed: 1,
    rating: 5,
    notes: 'PagedAttention partitions the continuous KV-cache into discrete physical memory blocks akin to OS virtual memory pages, reducing wasted KV memory fragmentation from 60-80% down to under 4%.',
  },
  {
    id: 4,
    title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
    authors: 'Rafael Rafailov et al. (Stanford University)',
    arxivId: 'arXiv:2305.18290',
    year: '2023',
    url: 'https://arxiv.org/abs/2305.18290',
    type: 'paper',
    topic: 'RLHF & Alignment',
    completed: 1,
    rating: 5,
    notes: 'Derives closed-form implicit reward function to optimize preference objectives with a simple binary cross-entropy loss, bypassing PPO training stability issues and separate reward model training.',
  },
  {
    id: 5,
    title: 'Triton: An Intermediate Language and Compiler for Tiled Neural Network Computations',
    authors: 'Philippe Tillet, H.T. Kung, David Cox (Harvard / OpenAI)',
    arxivId: 'MAPL 2019 / ACM',
    year: '2019',
    url: 'https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf',
    type: 'paper',
    topic: 'Compiler Systems',
    completed: 1,
    rating: 5,
    notes: 'Python-based programming model allowing engineers to write highly optimized custom GPU kernels with automated shared memory allocation, coalesced memory access, and tensor core scheduling.',
  },
  {
    id: 6,
    title: 'Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism',
    authors: 'Mohammad Shoeybi et al. (NVIDIA Research)',
    arxivId: 'arXiv:1909.08053',
    year: '2019',
    url: 'https://arxiv.org/abs/1909.08053',
    type: 'paper',
    topic: 'Distributed Training',
    completed: 0,
    rating: 5,
    notes: 'Tensor parallel matrix multiplications partitioned across column and row dimensions with minimal all-reduce collective communications across GPU clusters.',
  },
];

function ResourcesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperParam = searchParams.get('paper') || searchParams.get('highlight') || searchParams.get('arxiv') || '';
  const fromParam = searchParams.get('from') || '';

  const { syncResource } = useCareer();
  const [resources, setResources] = useState(BENCHMARK_PAPERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(paperParam ? paperParam.slice(0, 20) : '');
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
    fetchResources();
  }, []);

  useEffect(() => {
    if (paperParam) {
      setSearch(paperParam.slice(0, 20));
    }
  }, [paperParam]);

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
        const updated = { ...editingResource, ...formData, completed: formData.completed ? 1 : 0 };
        setResources(resources.map((r) => (r.id === editingResource.id ? updated : r)));
        syncResource(updated);
        showToast('Resource entry updated!', 'success');
      } else {
        const newRes = {
          id: `res_${Date.now()}`,
          ...formData,
          completed: formData.completed ? 1 : 0,
        };
        setResources([newRes, ...resources]);
        syncResource(newRes);
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
      item.notes?.toLowerCase().includes(term) ||
      item.authors?.toLowerCase().includes(term) ||
      item.arxivId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO & PROOF / 10"
        title={<>TECHNICAL READING INDEX &<br />FRONTIER PAPERS.</>}
        subtitle="Curated repository of peer-reviewed machine learning papers with real arXiv DOIs, author citations, and architectural invariants."
        actions={
          <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>
            + LOG PAPER / RESOURCE
          </button>
        }
      />

      {/* ─── Active Research Paper Citation Banner (Connection G) ─── */}
      {paperParam && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--purple, #a855f7)',
            borderLeft: '4px solid var(--purple, #a855f7)',
            padding: '14px 18px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
          role="region"
          aria-label="Referenced Paper Context"
        >
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', fontWeight: 800 }}>
              📖 REFERENCED IN ACTIVE INTERVIEW PREPARATION
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', fontWeight: 600 }}>
              {paperParam}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              This peer-reviewed paper was cited as the empirical theoretical foundation for technical interview questions.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link
              href="/interview-prep"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '5px 12px' }}
            >
              🎯 RETURN TO INTERVIEW PREP →
            </Link>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                router.push('/resources');
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', color: 'var(--text-muted)' }}
            >
              Clear ✕
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '14px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TOTAL ARCHIVE</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
            {resources.length} Research Papers
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '14px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>COMPLETED PAPERS</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--green)', marginTop: '2px' }}>
            {resources.filter((r) => r.completed === 1).length} Studied
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '14px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>AVERAGE DEPTH RATING</div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--purple, #a855f7)', marginTop: '2px' }}>
            5.0 / 5.0
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <input
            ref={searchInputRef}
            type="text"
            className={styles.search}
            placeholder="Search papers, arXiv DOIs, topics, authors... (Press '/' to focus)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select className={styles.select} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Resource Types</option>
            <option value="paper">Peer-Reviewed Papers</option>
            <option value="book">Textbooks & Books</option>
            <option value="course">Specialized Courses</option>
          </select>

          <select className={styles.select} value={filterCompleted} onChange={(e) => setFilterCompleted(e.target.value)}>
            <option value="all">All Reading Status</option>
            <option value="completed">✓ Studied & Completed</option>
            <option value="unread">⏳ In Queue / Unread</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filteredResources.map((item) => {
          const isReferenced = paperParam && (item.title.toLowerCase().includes(paperParam.toLowerCase()) || (item.arxivId && item.arxivId.includes(paperParam)));
          return (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => setSelectedDoc(item)}
              style={
                isReferenced
                  ? {
                      border: '2px solid var(--purple, #a855f7)',
                      background: 'var(--bg-surface)',
                      boxShadow: '0 0 12px rgba(168, 85, 247, 0.2)',
                    }
                  : {}
              }
            >
              <div className={styles.cardHeader}>
                <span className={styles.tag}>{item.topic || item.type.toUpperCase()}</span>
                {item.arxivId && (
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--blue)', background: 'rgba(96, 165, 250, 0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                    {item.arxivId}
                  </span>
                )}
              </div>

              <h3 className={styles.cardTitle}>{item.title}</h3>

              {item.authors && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                  👤 {item.authors} ({item.year || '2024'})
                </div>
              )}

              {item.notes && <p className={styles.cardNotes}>{item.notes}</p>}

              <div className={styles.cardFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${item.completed === 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={(e) => handleToggleComplete(item, e)}
                    style={{ fontSize: '10.5px', padding: '3px 8px' }}
                  >
                    {item.completed === 1 ? '✓ Read' : '○ Mark Read'}
                  </button>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '10.5px', padding: '3px 8px' }}
                    >
                      arXiv ↗
                    </a>
                  )}
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  ★ {item.rating || 5}.0
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reader Modal */}
      {selectedDoc && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDoc(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.tag}>{selectedDoc.topic || selectedDoc.type}</span>
                <h2 className={styles.modalTitle} style={{ marginTop: '8px' }}>{selectedDoc.title}</h2>
                {selectedDoc.authors && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Authors: {selectedDoc.authors} • Year: {selectedDoc.year || '2024'}
                  </div>
                )}
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Architectural Synthesis & Theoretical Key Invariants
                </h4>
                <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)', marginTop: '6px' }}>
                  {selectedDoc.notes || 'No detailed analysis logged.'}
                </p>
              </div>

              {selectedDoc.url && (
                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '12px' }}
                  >
                    Open Source Paper (arXiv / PDF) ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="loadingSpinner" /><p>Loading Research Library...</p></div>}>
      <ResourcesContent />
    </Suspense>
  );
}
