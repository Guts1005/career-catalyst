'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import {
  IconProjects,
  IconSandbox,
  IconATS,
  IconAssessment,
  IconResume,
  IconGitHub,
  IconArrowUpRight,
  IconCheck,
  IconJobs,
  IconSalary,
  IconSkills,
  IconInterview,
  IconCoding,
  IconBlueprints,
} from '@/components/Icons';

export default function HomePage() {
  const [terminalTab, setTerminalTab] = useState('stack');
  const [activeLab, setActiveLab] = useState('rag');

  // Lab 1: RAG Simulator State
  const [ragQuery, setRagQuery] = useState('How does KV-cache compression accelerate transformer decoding?');
  const [ragRunning, setRagRunning] = useState(false);
  const [ragResult, setRagResult] = useState({
    denseScore: 0.94,
    sparseScore: 0.88,
    rrfRank: 1,
    latencyMs: 38,
    response: 'KV-cache compression eliminates redundant Key and Value tensor recomputations across autoregressive decoding steps, decreasing GPU memory bandwidth bottlenecks and achieving ~3.2x throughput speedup.',
  });

  // Lab 2: GPU Latency & VRAM Estimator
  const [modelSize, setModelSize] = useState('8B');
  const [batchSize, setBatchSize] = useState(8);
  const [seqLength, setSeqLength] = useState(2048);

  const calculateGPU = () => {
    const params = modelSize === '8B' ? 8 : modelSize === '13B' ? 13 : 70;
    const baseVram = params * 2; // FP16
    const kvCacheGb = ((2 * 32 * 32 * 128 * 2 * seqLength * batchSize) / (1024 ** 3)).toFixed(1);
    const totalVram = (baseVram + parseFloat(kvCacheGb) + 2).toFixed(1);
    const tokensPerSec = Math.round((batchSize * 1000) / (params * 3.5));
    return { baseVram, kvCacheGb, totalVram, tokensPerSec };
  };

  const gpuMetrics = calculateGPU();

  const handleRunRag = () => {
    setRagRunning(true);
    setTimeout(() => {
      setRagRunning(false);
      showToast('Hybrid dense-sparse retrieval synthesized in 38ms!', 'success');
    }, 450);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('sharvinneve67@gmail.com');
    showToast('Email address copied to clipboard: sharvinneve67@gmail.com', 'success');
  };

  return (
    <div className={styles.pageContainer}>
      {/* ─── Floating Top Navbar (Awwwards Style) ────────────────── */}
      <nav className={styles.topNav}>
        <Link href="/" className={styles.navBrand}>
          <div className={styles.navAvatar}>S</div>
          <div>
            <div className={styles.navName}>Sharvin Neve</div>
          </div>
        </Link>

        <div className={styles.navLinks}>
          <a href="#work" className={styles.navLink}>Featured Work</a>
          <a href="#lab" className={styles.navLink}>Interactive Lab</a>
          <a href="#competencies" className={styles.navLink}>Competencies</a>
          <a href="#tools" className={styles.navLink}>Platform Tools</a>
        </div>

        <div className={styles.navActions}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyEmail}
            style={{ fontSize: '11.5px', padding: '5px 11px' }}
          >
            Contact
          </button>
          <Link
            href="/resume-builder"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '11.5px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <IconResume size={12} /> ATS Resume
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            Available for Senior / Staff ML Roles • San Francisco, CA
          </div>

          <h1 className={styles.heroTitle}>
            Architecting <span className={styles.heroGradient}>Production AI Systems</span> & Scalable ML Infrastructure.
          </h1>

          <p className={styles.heroSubtitle}>
            Hi, I’m <strong>Sharvin Neve</strong>. I build high-throughput multi-modal transformer architectures, low-latency GPU serving pipelines, and intelligent developer tools.
          </p>

          <div className={styles.heroCtaRow}>
            <a href="#lab" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '13.5px' }}>
              Launch Interactive Lab ↓
            </a>
            <a
              href="https://github.com/Guts1005"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconGitHub size={14} /> GitHub @Guts1005
            </a>
            <a
              href="https://linkedin.com/in/sharvin-neve"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
            </a>
          </div>
        </div>

        {/* Hero Interactive Terminal Widget */}
        <div className={styles.heroTerminal}>
          <div className={styles.terminalTop}>
            <div className={styles.terminalDots}>
              <div className={styles.terminalDot} style={{ background: '#ef4444' }} />
              <div className={styles.terminalDot} style={{ background: '#f59e0b' }} />
              <div className={styles.terminalDot} style={{ background: '#10b981' }} />
            </div>

            <div className={styles.terminalTabs}>
              <button
                className={`${styles.terminalTab} ${terminalTab === 'stack' ? styles.activeTab : ''}`}
                onClick={() => setTerminalTab('stack')}
              >
                stack.py
              </button>
              <button
                className={`${styles.terminalTab} ${terminalTab === 'impact' ? styles.activeTab : ''}`}
                onClick={() => setTerminalTab('impact')}
              >
                metrics.json
              </button>
              <button
                className={`${styles.terminalTab} ${terminalTab === 'about' ? styles.activeTab : ''}`}
                onClick={() => setTerminalTab('about')}
              >
                bio.md
              </button>
            </div>
          </div>

          <div className={styles.terminalBody}>
            {terminalTab === 'stack' && (
              <div>
                <div className={styles.terminalLine}>
                  <span className={styles.terminalPrompt}>$</span> cat core_stack.py
                </div>
                <div style={{ color: 'var(--text-muted)' }}># Production Engineering Stack</div>
                <div><span style={{ color: '#a78bfa' }}>FRAMEWORKS</span> = [<span style={{ color: '#34d399' }}>"PyTorch"</span>, <span style={{ color: '#34d399' }}>"Transformers"</span>, <span style={{ color: '#34d399' }}>"FlashAttention"</span>, <span style={{ color: '#34d399' }}>"vLLM"</span>]</div>
                <div><span style={{ color: '#a78bfa' }}>INFRA</span> = [<span style={{ color: '#34d399' }}>"CUDA"</span>, <span style={{ color: '#34d399' }}>"Docker"</span>, <span style={{ color: '#34d399' }}>"Kubernetes"</span>, <span style={{ color: '#34d399' }}>"AWS EC2"</span>]</div>
                <div><span style={{ color: '#a78bfa' }}>VECTOR_SEARCH</span> = [<span style={{ color: '#34d399' }}>"Qdrant"</span>, <span style={{ color: '#34d399' }}>"FAISS"</span>, <span style={{ color: '#34d399' }}>"Cross-Encoders"</span>]</div>
                <div><span style={{ color: '#a78bfa' }}>LANGUAGES</span> = [<span style={{ color: '#34d399' }}>"Python"</span>, <span style={{ color: '#34d399' }}>"C++"</span>, <span style={{ color: '#34d399' }}>"SQL"</span>, <span style={{ color: '#34d399' }}>"Bash"</span>]</div>
                <div style={{ marginTop: '10px', color: 'var(--success)' }}>✓ Ready for zero-shot distributed training & inference</div>
              </div>
            )}

            {terminalTab === 'impact' && (
              <div>
                <div className={styles.terminalLine}>
                  <span className={styles.terminalPrompt}>$</span> jq '.production_benchmarks'
                </div>
                <div style={{ color: '#38bdf8' }}>&#123;</div>
                <div style={{ paddingLeft: '14px' }}>"retrieval_latency_reduction": <span style={{ color: '#34d399' }}>"45%"</span>,</div>
                <div style={{ paddingLeft: '14px' }}>"vector_accuracy_p99": <span style={{ color: '#34d399' }}>"94.2%"</span>,</div>
                <div style={{ paddingLeft: '14px' }}>"serving_p99_latency": <span style={{ color: '#34d399' }}>"&lt; 120ms"</span>,</div>
                <div style={{ paddingLeft: '14px' }}>"daily_request_volume": <span style={{ color: '#34d399' }}>"500,000+"</span></div>
                <div style={{ color: '#38bdf8' }}>&#125;</div>
              </div>
            )}

            {terminalTab === 'about' && (
              <div>
                <div className={styles.terminalLine}>
                  <span className={styles.terminalPrompt}>$</span> head -n 5 bio.md
                </div>
                <div className={styles.terminalHighlight}>Sharvin Neve</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  BS in Computer Science & Data Science (3.85 GPA). Specializes in hybrid RAG search architectures, GPU kernel optimization, and end-to-end MLOps deployment pipelines.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Section 2: Interactive ML Lab (Hands-on Wow Factor) ──── */}
      <section id="lab" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <IconSandbox size={12} /> LIVE INTERACTIVE LABORATORY
          </div>
          <h2 className={styles.sectionTitle}>Hands-On Engineering Playgrounds</h2>
          <p className={styles.sectionSubtitle}>
            Interact directly with real-time vector search clustering, GPU memory allocation models, and ATS compliance parsers.
          </p>
        </div>

        <div className={styles.labCard}>
          <div className={styles.labNav}>
            <button
              className={`${styles.labNavBtn} ${activeLab === 'rag' ? styles.activeLab : ''}`}
              onClick={() => setActiveLab('rag')}
            >
              🧪 Multi-Modal Hybrid RAG Visualizer
            </button>
            <button
              className={`${styles.labNavBtn} ${activeLab === 'gpu' ? styles.activeLab : ''}`}
              onClick={() => setActiveLab('gpu')}
            >
              ⚡ GPU Latency & VRAM Estimator
            </button>
            <button
              className={`${styles.labNavBtn} ${activeLab === 'ats' ? styles.activeLab : ''}`}
              onClick={() => setActiveLab('ats')}
            >
              📋 ATS Scanner Benchmark
            </button>
          </div>

          <div className={styles.labContent}>
            {/* LAB 1: RAG VISUALIZER */}
            {activeLab === 'rag' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '13px' }}>Simulate User Query Input:</label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Hybrid RRF (Dense + BM25)</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    className="input"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleRunRag}
                    disabled={ragRunning}
                    style={{ fontSize: '12.5px', padding: '0 18px', whiteSpace: 'nowrap' }}
                  >
                    {ragRunning ? 'Retrieving...' : 'Run Pipeline'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cosine Similarity</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: '2px' }}>
                      {ragResult.denseScore}
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BM25 Keyword Match</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--warning)', marginTop: '2px' }}>
                      {ragResult.sparseScore}
                    </div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>p99 Retrieval Latency</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)', marginTop: '2px' }}>
                      {ragResult.latencyMs}ms
                    </div>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Re-ranked Cross-Encoder Output (Top-1 Grounded Passage):
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {ragResult.response}
                  </div>
                </div>
              </div>
            )}

            {/* LAB 2: GPU ESTIMATOR */}
            {activeLab === 'gpu' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label className="form-label">Base Model Architecture</label>
                    <select className="select" value={modelSize} onChange={(e) => setModelSize(e.target.value)}>
                      <option value="8B">Llama-3 (8 Billion Params)</option>
                      <option value="13B">Mistral / Llama-2 (13 Billion Params)</option>
                      <option value="70B">Llama-3 / Claude Class (70 Billion Params)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Concurrent Batch Size</label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>{batchSize}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="64"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Context Length (Tokens)</label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>{seqLength}</span>
                    </div>
                    <input
                      type="range"
                      min="512"
                      max="8192"
                      step="512"
                      value={seqLength}
                      onChange={(e) => setSeqLength(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '14px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated Throughput</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)', marginTop: '4px' }}>
                      {gpuMetrics.tokensPerSec} tok/s
                    </div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>KV-Cache Memory Footprint</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--warning)', marginTop: '4px' }}>
                      {gpuMetrics.kvCacheGb} GB
                    </div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required GPU VRAM</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: '4px' }}>
                      {gpuMetrics.totalVram} GB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAB 3: ATS SCANNER SIMULATOR */}
            {activeLab === 'ats' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Staff AI Engineer @ Anthropic (Claude Research)</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluated against candidate resume keywords</div>
                  </div>
                  <Link href="/ats-checker" className="btn btn-primary btn-sm" style={{ fontSize: '11.5px' }}>
                    Open Full ATS Suite ↗
                  </Link>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span className="badge badge-completed" style={{ fontSize: '11.5px', padding: '4px 10px' }}>✓ PyTorch (100% Match)</span>
                  <span className="badge badge-completed" style={{ fontSize: '11.5px', padding: '4px 10px' }}>✓ FlashAttention (100% Match)</span>
                  <span className="badge badge-completed" style={{ fontSize: '11.5px', padding: '4px 10px' }}>✓ Triton GPU Kernels</span>
                  <span className="badge badge-completed" style={{ fontSize: '11.5px', padding: '4px 10px' }}>✓ vLLM Serving</span>
                  <span className="badge badge-planned" style={{ fontSize: '11.5px', padding: '4px 10px' }}>+ Direct Preference Optimization (DPO)</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ 88/100 Top-Tier ATS Compatibility • Zero formatting violations
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Section 3: Featured Production Projects ──────────────── */}
      <section id="work" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <IconProjects size={12} /> PRODUCTION CASE STUDIES
          </div>
          <h2 className={styles.sectionTitle}>Featured Machine Learning Systems</h2>
          <p className={styles.sectionSubtitle}>
            End-to-end architectures engineered for low latency, high throughput, and measurable production impact.
          </p>
        </div>

        <div className={styles.projectsGrid}>
          {/* Project 1 */}
          <div className={styles.projectCard}>
            <div>
              <div className={styles.projectTop}>
                <div>
                  <div className={styles.projectCategory}>GEN AI & RAG ARCHITECTURES</div>
                  <h3 className={styles.projectName}>Enterprise Multi-Modal RAG Engine</h3>
                </div>
              </div>

              <p className={styles.projectDesc}>
                Engineered hybrid dense-sparse vector retrieval uniting Qdrant embeddings with BM25 keyword matching and cross-encoder re-ranking for enterprise technical documentation.
              </p>

              <div className={styles.projectImpact}>
                🎯 45% latency reduction • 94.2% retrieval accuracy on technical benchmarks
              </div>
            </div>

            <div className={styles.projectFooter}>
              <div className={styles.projectStack}>PyTorch • Qdrant • FastAPI • Docker</div>
              <div className={styles.projectLinks}>
                <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  Source <IconArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div className={styles.projectCard}>
            <div>
              <div className={styles.projectTop}>
                <div>
                  <div className={styles.projectCategory}>INFERENCE & SERVING INFRASTRUCTURE</div>
                  <h3 className={styles.projectName}>High-Throughput GPU Inference Serving</h3>
                </div>
              </div>

              <p className={styles.projectDesc}>
                Architected high-throughput model serving cluster with vLLM PagedAttention and FlashAttention-2 kernels, handling continuous batching with sub-120ms p99 latency.
              </p>

              <div className={styles.projectImpact}>
                🎯 3.2x throughput increase • 500k+ daily inference requests handled with 0 downtime
              </div>
            </div>

            <div className={styles.projectFooter}>
              <div className={styles.projectStack}>CUDA • Triton • Kubernetes • vLLM</div>
              <div className={styles.projectLinks}>
                <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  Source <IconArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Project 3 */}
          <div className={styles.projectCard}>
            <div>
              <div className={styles.projectTop}>
                <div>
                  <div className={styles.projectCategory}>RECOMMENDATION & RETRIEVAL</div>
                  <h3 className={styles.projectName}>Two-Tower Real-Time Recommendation</h3>
                </div>
              </div>

              <p className={styles.projectDesc}>
                Built scalable recommendation retrieval service leveraging dual-encoder user/item embeddings in FAISS with real-time Kafka event streams and automated A/B testing.
              </p>

              <div className={styles.projectImpact}>
                🎯 +18.4% click-through rate • Sub-25ms vector candidate retrieval
              </div>
            </div>

            <div className={styles.projectFooter}>
              <div className={styles.projectStack}>Python • FAISS • Kafka • Scikit-learn</div>
              <div className={styles.projectLinks}>
                <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  Source <IconArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: Competency Matrix & Credentials ───────────── */}
      <section id="competencies" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <IconSkills size={12} /> VERIFIED COMPETENCIES
          </div>
          <h2 className={styles.sectionTitle}>Technical Core & Credentials</h2>
          <p className={styles.sectionSubtitle}>
            Specialized competencies across theoretical machine learning and production deployment.
          </p>
        </div>

        <div className={styles.skillsGrid}>
          <div className={styles.skillBox}>
            <div className={styles.skillBoxTitle}>Deep Learning & LLMs</div>
            <div className={styles.skillPills}>
              <span className={styles.skillPillItem}>PyTorch</span>
              <span className={styles.skillPillItem}>Transformers</span>
              <span className={styles.skillPillItem}>FlashAttention</span>
              <span className={styles.skillPillItem}>HuggingFace</span>
              <span className={styles.skillPillItem}>vLLM</span>
              <span className={styles.skillPillItem}>DPO / RLHF</span>
            </div>
          </div>

          <div className={styles.skillBox}>
            <div className={styles.skillBoxTitle}>Systems & MLOps</div>
            <div className={styles.skillPills}>
              <span className={styles.skillPillItem}>Docker</span>
              <span className={styles.skillPillItem}>Kubernetes</span>
              <span className={styles.skillPillItem}>AWS / GCP</span>
              <span className={styles.skillPillItem}>FastAPI</span>
              <span className={styles.skillPillItem}>MLflow</span>
              <span className={styles.skillPillItem}>CI / CD</span>
            </div>
          </div>

          <div className={styles.skillBox}>
            <div className={styles.skillBoxTitle}>Vector Search & Data</div>
            <div className={styles.skillPills}>
              <span className={styles.skillPillItem}>Qdrant</span>
              <span className={styles.skillPillItem}>FAISS</span>
              <span className={styles.skillPillItem}>PostgreSQL</span>
              <span className={styles.skillPillItem}>Apache Spark</span>
              <span className={styles.skillPillItem}>Kafka</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5: Full Platform Tools Access ────────────────── */}
      <section id="tools" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>
            <IconJobs size={12} /> CAREER OS SUITE
          </div>
          <h2 className={styles.sectionTitle}>Engineering Platform Tools</h2>
          <p className={styles.sectionSubtitle}>
            Proprietary interactive tools built for job pipeline tracking, interview simulation, and compensation modeling.
          </p>
        </div>

        <div className={styles.toolsGrid}>
          <Link href="/ats-checker" className={styles.toolTile}>
            <div className={styles.toolTileName}>ATS Resume Scanner</div>
            <div className={styles.toolTileDesc}>Keyword density & ATS parsing compliance checker</div>
          </Link>
          <Link href="/mock-interview" className={styles.toolTile}>
            <div className={styles.toolTileName}>Technical Assessment</div>
            <div className={styles.toolTileDesc}>Timed mock interview rounds with live rubric scoring</div>
          </Link>
          <Link href="/algorithm-sandbox" className={styles.toolTile}>
            <div className={styles.toolTileName}>Math & Loss Sandbox</div>
            <div className={styles.toolTileDesc}>Interactive loss surface descent & attention simulator</div>
          </Link>
          <Link href="/job-tracker" className={styles.toolTile}>
            <div className={styles.toolTileName}>Application Pipeline</div>
            <div className={styles.toolTileDesc}>Kanban board with automatic skill matching</div>
          </Link>
          <Link href="/salary-insights" className={styles.toolTile}>
            <div className={styles.toolTileName}>Salary Intelligence</div>
            <div className={styles.toolTileDesc}>Tech hub benchmarks & counter-offer scripts</div>
          </Link>
          <Link href="/resume-builder" className={styles.toolTile}>
            <div className={styles.toolTileName}>Resume Editor</div>
            <div className={styles.toolTileDesc}>Live database-synced ATS resume compiler</div>
          </Link>
        </div>
      </section>

      {/* ─── Section 6: Contact & Hiring CTA ──────────────────────── */}
      <section className={styles.contactCta}>
        <h2 className={styles.contactTitle}>Let's Build Something High-Impact Together.</h2>
        <p className={styles.contactSubtitle}>
          I am actively interviewing for Senior / Staff Machine Learning Engineer, Research Engineer, and MLOps roles.
        </p>

        <div className={styles.contactActions}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopyEmail}
            style={{ padding: '10px 24px', fontSize: '13.5px' }}
          >
            Copy Direct Email: sharvinneve67@gmail.com
          </button>
          <Link
            href="/resume-builder"
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '13.5px' }}
          >
            View Full ATS Resume
          </Link>
        </div>
      </section>
    </div>
  );
}
