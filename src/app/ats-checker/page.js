'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import {
  IconATS,
  IconCheck,
  IconArrowUpRight,
} from '@/components/Icons';

const PRESETS = [
  {
    name: 'Anthropic • Staff AI Engineer',
    role: 'Staff AI Engineer (Claude 3.5 Sonnet Team)',
    resume: `Sharvin Neve
sharvinneve67@gmail.com | +1 (555) 342-8901 | San Francisco, CA | github.com/Guts1005 | linkedin.com/in/sharvin-neve

PROFESSIONAL SUMMARY
Results-driven Machine Learning Engineer with experience designing scalable transformer architectures, multi-modal RAG systems, and distributed model inference. Proficient in PyTorch, Triton, FlashAttention, and RLHF alignment workflows.

EDUCATION
B.S. in Computer Science & Data Science — University of Technology (GPA: 3.85 / 4.00, Expected May 2026)
Coursework: Distributed Systems, Deep Learning, Linear Algebra, Probability & Optimization

TECHNICAL SKILLS
- Languages: Python, C++, SQL, CUDA
- Deep Learning & LLMs: PyTorch, Transformers, FlashAttention, HuggingFace, vLLM, DeepSpeed, RLHF, DPO
- Systems & Cloud: Docker, Kubernetes, AWS, GCP, FastAPI, Triton Inference Server

PROJECTS & EXPERIENCE
Machine Learning Research Assistant — AI & Vision Lab (Jan 2025 – Present)
- Engineered high-throughput multi-modal transformer pipeline in PyTorch, reducing inference latency by 45% using KV-cache optimizations.
- Containerized distributed inference serving with Docker and FastAPI on AWS EC2, maintaining sub-120ms p99 latency.
- Implemented automated semantic search indexing using dense vector embeddings and cross-encoder re-ranking.`,
    jd: `Role: Staff AI Engineer — Alignment & Large Model Training
We are looking for an exceptional engineer to work on frontier model architectures, reinforcement learning from human feedback (RLHF), and high-throughput low-latency inference.
Requirements:
- Deep expertise in PyTorch, CUDA, FlashAttention, and Triton kernel optimization.
- Proven track record with distributed training frameworks (DeepSpeed, Megatron-LM, FSDP).
- Experience with RLHF, Direct Preference Optimization (DPO), and model safety guardrails.
- High proficiency in low-latency serving stacks (vLLM, TensorRT-LLM, Triton).`
  },
  {
    name: 'OpenAI • Senior ML Infra',
    role: 'Senior ML Infrastructure Engineer',
    resume: `Sharvin Neve
sharvinneve67@gmail.com | San Francisco, CA | github.com/Guts1005

SUMMARY
Machine Learning Infrastructure Specialist with focus on high-performance distributed training, NCCL GPU communication, and production inference clusters.

SKILLS: Python, C++, PyTorch, Docker, Kubernetes, Ray, NCCL, vLLM, FastAPI, AWS EC2, Slurm

EXPERIENCE
- Scaled distributed ML training jobs across multi-node GPU clusters with PyTorch FSDP.
- Optimized model serving infrastructure handling 500k+ daily inference requests with zero downtime.`,
    jd: `Senior Machine Learning Infrastructure Engineer
Requirements:
- Strong background in distributed computing, GPU networking (NCCL, InfiniBand), and Kubernetes.
- Experience with PyTorch FSDP, Slurm cluster scheduling, and high-performance inference engines.
- Proficiency in Python, C++, and profiling GPU kernels.`
  },
  {
    name: 'Spotify • RecSys Scientist',
    role: 'Machine Learning Engineer — Personalization',
    resume: `Sharvin Neve
sharvinneve67@gmail.com | San Francisco, CA | linkedin.com/in/sharvin-neve

SUMMARY
Data Scientist & ML Engineer specializing in recommendation systems, two-tower embedding models, and real-time feature pipelines.

SKILLS: Python, SQL, Scikit-learn, PyTorch, Two-Tower Embeddings, Vector Search (FAISS), Kafka, GCP

EXPERIENCE
- Implemented real-time recommendation retrieval using approximate nearest neighbor indexing.
- Engineered automated A/B experimentation pipeline for online model evaluation.`,
    jd: `Machine Learning Engineer — Personalization & Recommendation
Requirements:
- Deep experience in Two-Tower Recommendation Systems, Collaborative Filtering, and Graph Neural Networks.
- Strong knowledge of Vector Databases (FAISS, Milvus), Kafka streaming, and Scikit-learn.
- Proven experience running large-scale online A/B tests and statistical significance evaluation.`
  }
];

export default function AtsCheckerPage() {
  const [content, setContent] = useState(PRESETS[0].resume);
  const [jd, setJd] = useState(PRESETS[0].jd);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activePreset, setActivePreset] = useState(0);

  useEffect(() => {
    fetchHistory();
    // Auto-run first preset on load for instant Aha! moment
    handleAnalyzeWithData(PRESETS[0].resume, PRESETS[0].jd);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ats-checker');
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch {
      /* ignore */
    }
  };

  const handleAnalyzeWithData = async (resumeText, jdText) => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ats-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeText, jd: jdText }),
      });
      const data = await res.json();
      setResult({
        ...data,
        keyword_matches: typeof data.keyword_matches === 'string' ? JSON.parse(data.keyword_matches || '[]') : data.keyword_matches || [],
        missing_keywords: typeof data.missing_keywords === 'string' ? JSON.parse(data.missing_keywords || '[]') : data.missing_keywords || [],
        format_issues: typeof data.format_issues === 'string' ? JSON.parse(data.format_issues || '[]') : data.format_issues || [],
      });
      fetchHistory();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (idx) => {
    setActivePreset(idx);
    const p = PRESETS[idx];
    setContent(p.resume);
    setJd(p.jd);
    handleAnalyzeWithData(p.resume, p.jd);
  };

  const handleInjectKeyword = (kw) => {
    setContent((prev) => prev + `\n- Proficient in ${kw} and enterprise implementation.`);
    showToast(`Keyword "+ ${kw}" injected into resume!`, 'success');
  };

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const score = result?.score || 0;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          <IconATS size={13} />
          ATS OPTIMIZATION ENGINE
        </div>
        <h1 style={{ letterSpacing: '-0.03em', fontSize: '24px', fontWeight: 700 }}>ATS Resume Scanner & Keyword Matcher</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
          Simulate enterprise ATS filters (Workday, Greenhouse, Lever) and optimize keyword density for top AI/ML engineering roles.
        </p>

        {/* 1-Click Instant Presets */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>1-Click Live Benchmarks:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(idx)}
              className="btn btn-secondary"
              style={{
                fontSize: '11.5px',
                padding: '4px 10px',
                background: activePreset === idx ? 'var(--bg-active)' : 'var(--bg-secondary)',
                borderColor: activePreset === idx ? 'var(--accent)' : 'var(--border)',
                color: activePreset === idx ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activePreset === idx ? 600 : 400,
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Column: Input Form */}
        <div className={styles.inputSection}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="card-title" style={{ fontSize: '13px' }}>Resume Text</div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              className={styles.textarea}
              style={{ minHeight: '180px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              placeholder="Paste your plain text resume here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
              <div className="card-title" style={{ fontSize: '13px' }}>Target Job Description</div>
            </div>
            <textarea
              className={styles.textarea}
              style={{ minHeight: '100px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              placeholder="Paste job description..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '14px', padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => handleAnalyzeWithData(content, jd)}
              disabled={loading || !content.trim()}
            >
              <IconATS size={15} />
              {loading ? 'Evaluating ATS Scoring Matrix...' : 'Run ATS Compliance Audit'}
            </button>
          </div>
        </div>

        {/* Right Column: Instant Live Analysis */}
        <div className={styles.resultsSection}>
          {result ? (
            <div className="card">
              <div className={styles.scoreHeader}>
                <div className={styles.gaugeContainer}>
                  <svg className={styles.gaugeSvg} viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r={radius} className={styles.gaugeBg} strokeWidth="8" />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      className={styles.gaugeProgress}
                      strokeWidth="8"
                      stroke={score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className={styles.scoreText}>
                    <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{score}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>

                <div className={styles.feedbackBox}>
                  <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: score >= 80 ? 'var(--success-subtle)' : 'var(--warning-subtle)', color: score >= 80 ? 'var(--success)' : 'var(--warning)', fontSize: '11px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                    {score >= 80 ? '✓ HIGH PROBABILITY MATCH' : '⚠ KEYWORD OPTIMIZATION RECOMMENDED'}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {result.feedback}
                  </p>
                </div>
              </div>

              {/* Matched Keywords */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Matched Technical Keywords ({result.keyword_matches?.length || 0})
                  </span>
                </div>
                <div className={styles.badges}>
                  {result.keyword_matches?.map((kw) => (
                    <span key={kw} className={`${styles.badge} ${styles.badgeMatch}`} style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px' }}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords with 1-Click Injection */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>
                    Missing High-Weight Keywords ({result.missing_keywords?.length || 0})
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click keyword to inject</span>
                </div>
                <div className={styles.badges}>
                  {result.missing_keywords?.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => handleInjectKeyword(kw)}
                      className={`${styles.badge} ${styles.badgeMiss}`}
                      style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      title="Click to append to resume"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & System Compliance */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ATS Parser Structural Compliance
                </span>
                <div style={{ marginTop: '8px' }}>
                  {result.format_issues?.length > 0 ? (
                    <ul className={styles.issueList} style={{ fontSize: '12.5px' }}>
                      {result.format_issues.map((issue, i) => (
                        <li key={i} style={{ color: 'var(--warning)', marginBottom: '4px' }}>• {issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--success)' }}>
                      <IconCheck size={14} /> Zero structural or formatting violations detected. Ready for submission.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <IconATS size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Ready for Evaluation</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Select one of the 1-click benchmarks above or paste your own job description.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
