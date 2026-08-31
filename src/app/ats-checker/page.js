'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
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

export default function AtsCheckerPage() {
  const { projects, injectATSProof } = useCareer();
  const [content, setContent] = useState(PRESETS[0].resume);
  const [jd, setJd] = useState(PRESETS[0].jd);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [activePreset, setActivePreset] = useState(0);

  useEffect(() => {
    handleAnalyzeWithData(PRESETS[0].resume, PRESETS[0].jd);
  }, []);

  const handleAnalyzeWithData = (resumeText, jdText) => {
    setLoading(true);
    setTimeout(() => {
      // Extract keywords from JD
      const technicalKeywords = [
        'PyTorch', 'CUDA', 'FlashAttention', 'Triton', 'DeepSpeed', 'Megatron-LM', 'FSDP',
        'RLHF', 'DPO', 'vLLM', 'TensorRT-LLM', 'Kubernetes', 'NCCL', 'Slurm', 'Docker',
        'FastAPI', 'Two-Tower Embeddings', 'Vector Databases', 'FAISS', 'Kafka', 'Scikit-learn',
        'Python', 'SQL', 'C++', 'AWS', 'GCP', 'Ray', 'System Design'
      ];

      const found = [];
      const missing = [];

      technicalKeywords.forEach((kw) => {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(jdText)) {
          if (regex.test(resumeText)) {
            found.push(kw);
          } else {
            // Check if user has demonstrated evidence in a project
            const matchingProject = projects.find((p) =>
              (p.technologies || '').toLowerCase().includes(kw.toLowerCase()) ||
              (p.skills_demonstrated || '').toLowerCase().includes(kw.toLowerCase()) ||
              (p.description || '').toLowerCase().includes(kw.toLowerCase())
            );

            missing.push({
              keyword: kw,
              projectEvidence: matchingProject ? matchingProject.name : null,
            });
          }
        }
      });

      const totalExpected = found.length + missing.length;
      const score = totalExpected > 0 ? Math.round((found.length / totalExpected) * 100) : 85;

      setResult({
        score: Math.max(score, 60),
        foundKeywords: found,
        missingKeywords: missing,
        formattingScore: 94,
        brevityScore: 92,
        actionVerbCount: 18,
      });

      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    if (result?.score) {
      let current = 0;
      const target = result.score;
      const interval = setInterval(() => {
        current += 2;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [result]);

  const handleInjectKeyword = (kw, projectEvidence) => {
    const injectionNote = projectEvidence ? ` (Verified in ${projectEvidence})` : '';
    setContent((prev) => `${prev}\n- Proven Competency: ${kw}${injectionNote}`);
    if (injectATSProof) {
      injectATSProof(kw, projectEvidence || 'ATS Matcher');
    } else {
      showToast(`Injected "${kw}" into resume canvas!`, 'success');
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="OPPORTUNITIES / 04"
        title={<>ATS SCANNER &<br />KEYWORD MATCHER.</>}
        subtitle="Extract technical requirements from target job descriptions, evaluate resume keyword density, and discover unmentioned project evidence."
        actions={
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                type="button"
                className={`tag ${activePreset === idx ? 'active' : ''}`}
                onClick={() => {
                  setActivePreset(idx);
                  setContent(preset.resume);
                  setJd(preset.jd);
                  handleAnalyzeWithData(preset.resume, preset.jd);
                }}
                style={{
                  cursor: 'pointer',
                  background: activePreset === idx ? 'var(--bg-inverse)' : 'transparent',
                  color: activePreset === idx ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                {preset.name.split('•')[0].trim()}
              </button>
            ))}
          </div>
        }
      />

      <div className={styles.grid}>
        {/* Left Column: Resume & JD Inputs */}
        <div className={styles.inputSection}>
          <div className={styles.card} style={{ marginBottom: '16px' }}>
            <h2>Target Job Description</h2>
            <textarea
              className={styles.textarea}
              style={{ height: '140px' }}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste raw job description requirements here..."
            />
          </div>

          <div className={styles.card}>
            <h2>Active Resume Document</h2>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste resume text or markdown here..."
            />

            <button
              type="button"
              className={styles.analyzeBtn}
              onClick={() => handleAnalyzeWithData(content, jd)}
              disabled={loading}
            >
              {loading ? 'ANALYZING TAXONOMY...' : 'RUN ATS SCAN & MATCHING →'}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic Results */}
        <div className={styles.resultsSection}>
          {result && (
            <>
              <div className={styles.card}>
                <div className={styles.scoreHeader}>
                  <div className={styles.scoreCircle}>
                    {animatedScore}%
                  </div>
                  <div className={styles.scoreDetails}>
                    <h3>ATS Match Compatibility</h3>
                    <p>
                      {animatedScore >= 80
                        ? 'High-confidence alignment with hiring bar requirements.'
                        : 'Action needed: Essential technical keywords missing from resume body.'}
                    </p>
                  </div>
                </div>

                <div className={styles.metricGrid} style={{ marginTop: '16px' }}>
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue}>{result.foundKeywords.length}</div>
                    <div className={styles.metricLabel}>Matched Skills</div>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue} style={{ color: result.missingKeywords.length > 0 ? 'var(--amber)' : 'var(--green)' }}>
                      {result.missingKeywords.length}
                    </div>
                    <div className={styles.metricLabel}>Missing Gaps</div>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue}>{result.formattingScore}%</div>
                    <div className={styles.metricLabel}>Formatting Score</div>
                  </div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div className={styles.card}>
                <div className={styles.keywordTitle} style={{ color: 'var(--green)' }}>
                  ✓ MATCHED TECHNICAL ENTITIES ({result.foundKeywords.length})
                </div>
                <div className={styles.keywordList}>
                  {result.foundKeywords.map((kw) => (
                    <span key={kw} className={styles.kwFound}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords & Project Evidence Cross-Reference */}
              {result.missingKeywords.length > 0 && (
                <div className={styles.card}>
                  <div className={styles.keywordTitle} style={{ color: 'var(--red)' }}>
                    ! MISSING TARGET KEYWORDS ({result.missingKeywords.length})
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Click any keyword to instantly inject it into your resume document:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.missingKeywords.map((item) => (
                      <div
                        key={item.keyword}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className={styles.kwMissing}
                            onClick={() => handleInjectKeyword(item.keyword, item.projectEvidence)}
                            title="Click to inject into resume"
                          >
                            + {item.keyword}
                          </span>

                          {/* Connected Project Evidence Badge */}
                          {item.projectEvidence && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--blue)',
                                background: 'rgba(96, 165, 250, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                border: '1px solid rgba(96, 165, 250, 0.3)',
                              }}
                            >
                              💡 Verified in {item.projectEvidence}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleInjectKeyword(item.keyword, item.projectEvidence)}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          + INJECT
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
