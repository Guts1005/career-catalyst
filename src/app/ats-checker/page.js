'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconATS, IconCheck, IconArrowUpRight } from '@/components/Icons';

const PRESETS = [
  {
    name: 'Anthropic • Staff AI Engineer',
    role: 'Staff AI Engineer (Claude Research)',
    resume: `Sharvin Neve
sharvinneve67@gmail.com | San Francisco, CA | github.com/Guts1005 | linkedin.com/in/sharvin-neve

PROFESSIONAL SUMMARY
Results-driven Machine Learning Engineer with experience designing scalable transformer architectures, multi-modal RAG systems, and distributed model inference. Proficient in PyTorch, Triton, FlashAttention, and RLHF alignment workflows.

EDUCATION
B.S. in Computer Science & Data Science — University of Technology (GPA: 3.85 / 4.00, Expected May 2026)

TECHNICAL SKILLS
- Languages: Python, C++, SQL, CUDA
- Deep Learning & LLMs: PyTorch, Transformers, FlashAttention, HuggingFace, vLLM, DeepSpeed, RLHF, DPO
- Systems & Cloud: Docker, Kubernetes, AWS, GCP, FastAPI, Triton Inference Server

EXPERIENCE & PROJECTS
Machine Learning Research Assistant — AI & Vision Lab
- Engineered high-throughput multi-modal transformer pipeline in PyTorch, reducing inference latency by 45% using KV-cache optimizations.
- Containerized distributed inference serving with Docker and FastAPI on AWS EC2, maintaining sub-120ms p99 latency.
- Implemented automated semantic search indexing using dense vector embeddings and cross-encoder re-ranking.`,
    jd: `Role: Staff AI Engineer — Large Model Training & Systems
Requirements:
- Deep expertise in PyTorch, CUDA, FlashAttention, and Triton kernel optimization.
- Proven track record with distributed training frameworks (DeepSpeed, Megatron-LM, FSDP).
- Experience with RLHF, Direct Preference Optimization (DPO), and model safety guardrails.
- High proficiency in low-latency serving stacks (vLLM, TensorRT-LLM, Triton).`
  },
  {
    name: 'OpenAI • ML Infrastructure',
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

const ANALYSIS_STEPS = [
  'Parsing document structure & typography...',
  'Extracting technical entities & skill taxonomy...',
  'Cross-referencing against target job description...',
  'Calculating recruiter score & ATS compliance...',
];

export default function AtsCheckerPage() {
  const [content, setContent] = useState(PRESETS[0].resume);
  const [jd, setJd] = useState(PRESETS[0].jd);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [activePreset, setActivePreset] = useState(0);

  useEffect(() => {
    handleAnalyzeWithData(PRESETS[0].resume, PRESETS[0].jd);
  }, []);

  const handleAnalyzeWithData = async (resumeText, jdText) => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 200);

    try {
      const res = await fetch('/api/ats-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeText, jd: jdText }),
      });
      const data = await res.json();
      
      clearInterval(stepInterval);
      setAnalysisStep(ANALYSIS_STEPS.length);

      const parsedMatches = typeof data.keyword_matches === 'string' ? JSON.parse(data.keyword_matches || '[]') : data.keyword_matches || [];
      const parsedMissing = typeof data.missing_keywords === 'string' ? JSON.parse(data.missing_keywords || '[]') : data.missing_keywords || [];
      const parsedIssues = typeof data.format_issues === 'string' ? JSON.parse(data.format_issues || '[]') : data.format_issues || [];

      const targetScore = data.score || 88;
      setResult({
        ...data,
        keyword_matches: parsedMatches,
        missing_keywords: parsedMissing,
        format_issues: parsedIssues,
      });

      // Animate score 0 -> targetScore
      let current = 0;
      const step = targetScore / 20;
      const scoreTimer = setInterval(() => {
        current += step;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(scoreTimer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, 25);
    } catch (error) {
      console.error('Analysis failed:', error);
      clearInterval(stepInterval);
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
    setContent((prev) => prev + `\n- Built production implementation using ${kw}.`);
    showToast(`Keyword "${kw}" injected into resume!`, 'success');
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="OPPORTUNITIES / 06"
        title={<>ATS<br />ANALYSIS.</>}
        subtitle="Evaluate keyword match rate, structural readability, and missing technical competencies against target job descriptions."
      />

      {/* 1-Click Live Benchmarks */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>1-CLICK BENCHMARKS:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleApplyPreset(idx)}
            className="btn btn-secondary"
            style={{
              fontSize: '11.5px',
              padding: '4px 10px',
              background: activePreset === idx ? 'var(--black)' : 'var(--white)',
              borderColor: activePreset === idx ? 'var(--black)' : 'var(--gray-200)',
              color: activePreset === idx ? '#ffffff' : 'var(--black)',
              fontWeight: activePreset === idx ? 600 : 400,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {/* Left Column: Input Form */}
        <div className={styles.inputSection}>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--black)' }}>Candidate Resume</span>
              <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)' }}>
                {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw ATS resume text here..."
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--black)' }}>Target Job Description</span>
              <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)' }}>
                {jd.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              className={styles.textarea}
              style={{ height: '140px' }}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste target job description..."
            />

            <button
              type="button"
              className={styles.analyzeBtn}
              onClick={() => handleAnalyzeWithData(content, jd)}
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Evaluating Compliance Pipeline...' : 'RUN ATS SCAN →'}
            </button>
          </div>
        </div>

        {/* Right Column: Live Analysis Output */}
        <div className={styles.resultsSection}>
          {loading ? (
            <div className={styles.card} style={{ padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--black)', marginBottom: '16px', fontWeight: 700 }}>
                ANALYZING DOCUMENT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', maxWidth: '340px', margin: '0 auto', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                {ANALYSIS_STEPS.map((step, sIdx) => (
                  <div key={step} style={{ color: sIdx <= analysisStep ? 'var(--black)' : 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{sIdx < analysisStep ? '✓' : sIdx === analysisStep ? '●' : '○'}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : result ? (
            <div className={styles.card}>
              <div className={styles.scoreHeader}>
                <div className={styles.scoreCircle}>
                  {animatedScore}%
                </div>
                <div className={styles.scoreDetails}>
                  <h3>Overall ATS Match Score</h3>
                  <p>
                    {animatedScore >= 80
                      ? 'Strong match. Candidate profile passes automated resume screening filters.'
                      : 'Moderate match. Review missing technical keywords below to boost ranking.'}
                  </p>
                </div>
              </div>

              {/* Metrics Overview */}
              <div className={styles.metricGrid} style={{ marginTop: '16px' }}>
                <div className={styles.metricItem}>
                  <div className={styles.metricValue}>{result.keyword_matches?.length || 0}</div>
                  <div className={styles.metricLabel}>Matched Skills</div>
                </div>
                <div className={styles.metricItem}>
                  <div className={styles.metricValue} style={{ color: result.missing_keywords?.length > 0 ? 'var(--amber)' : 'var(--green)' }}>
                    {result.missing_keywords?.length || 0}
                  </div>
                  <div className={styles.metricLabel}>Missing Terms</div>
                </div>
                <div className={styles.metricItem}>
                  <div className={styles.metricValue}>{result.format_issues?.length || 0}</div>
                  <div className={styles.metricLabel}>Structure Flags</div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div className={styles.keywordBlock}>
                <div className={styles.keywordTitle}>Verified Competencies ({result.keyword_matches?.length || 0})</div>
                <div className={styles.keywordList}>
                  {result.keyword_matches?.map((kw) => (
                    <span key={kw} className={styles.kwFound}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords with 1-Click Injection */}
              {result.missing_keywords?.length > 0 && (
                <div className={styles.keywordBlock}>
                  <div className={styles.keywordTitle}>
                    Missing Competencies (Click to Inject):
                  </div>
                  <div className={styles.keywordList}>
                    {result.missing_keywords?.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => handleInjectKeyword(kw)}
                        className={styles.kwMissing}
                        title="Click to insert into resume"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
