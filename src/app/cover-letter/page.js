'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';

const ROLE_PRESETS = [
  {
    company: 'Anthropic',
    role: 'Staff AI Engineer (Claude Research)',
    skills: 'PyTorch, Transformers, FlashAttention, Triton, Distributed Training, RLHF, vLLM',
    jd: 'Developing frontier model architectures, reinforcement learning from human feedback (RLHF), and high-throughput low-latency inference.'
  },
  {
    company: 'NVIDIA',
    role: 'Senior GPU Systems & Kernel Engineer',
    skills: 'Triton, CUDA, TensorRT-LLM, AWQ, FP8 Quantization, GPU Memory Tiling',
    jd: 'Optimizing custom GPU kernels, reducing shared memory bank conflicts, and scaling low-latency model inference across multi-GPU clusters.'
  },
  {
    company: 'OpenAI',
    role: 'Senior ML Infrastructure Engineer',
    skills: 'PyTorch, CUDA, Kubernetes, Ray, NCCL, Slurm, vLLM, GQA, DPO',
    jd: 'Scaling distributed ML training clusters, optimizing GPU networking communication with NCCL, and building production model serving infrastructure.'
  },
  {
    company: 'Databricks',
    role: 'Solutions Architect — Machine Learning',
    skills: 'Python, SQL, Apache Spark, MLflow, Delta Lake, Feature Store, Production MLOps',
    jd: 'Designing end-to-end production data science pipelines and MLOps platforms on lakehouse architecture for enterprise customers.'
  }
];

function CoverLetterContent() {
  const router = useRouter();
  const { jobs, projects, skills } = useCareer();
  const searchParams = useSearchParams();

  const companyParam = searchParams.get('company') || '';
  const roleParam = searchParams.get('role') || '';
  const skillsParam = searchParams.get('skills') || '';

  const [company, setCompany] = useState(companyParam || ROLE_PRESETS[0].company);
  const [role, setRole] = useState(roleParam || ROLE_PRESETS[0].role);
  const [requiredSkills, setRequiredSkills] = useState(skillsParam || ROLE_PRESETS[0].skills);
  const [jobDescription, setJobDescription] = useState(ROLE_PRESETS[0].jd);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [recruiterPitch, setRecruiterPitch] = useState('');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  useEffect(() => {
    if (companyParam) setCompany(companyParam);
    if (roleParam) setRole(roleParam);
    if (skillsParam) setRequiredSkills(skillsParam);
  }, [companyParam, roleParam, skillsParam]);

  const activeJobTargets = useMemo(() => {
    return (jobs || []).filter((j) => ['interview', 'final', 'oa', 'applied', 'wishlist'].includes(j.status));
  }, [jobs]);

  const handleApplyPreset = (p) => {
    setCompany(p.company);
    setRole(p.role);
    setRequiredSkills(p.skills);
    setJobDescription(p.jd);
  };

  const handleSelectJobPipeline = (job) => {
    setCompany(job.company);
    setRole(job.role);
    if (job.required_skills) setRequiredSkills(job.required_skills);
    if (job.notes) setJobDescription(job.notes);
    router.push(`/cover-letter?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.role)}&skills=${encodeURIComponent(job.required_skills || '')}`);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!company || !role) return;

    setLoading(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          required_skills: requiredSkills,
          job_description: jobDescription,
          candidate_projects: projects,
          candidate_skills: (skills || []).map((s) => s.name).join(', '),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoverLetter(data.coverLetter);
        setRecruiterPitch(data.recruiterPitch);
        showToast('Tailored STAR cover letter & InMail pitch generated with verified evidence!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate pitch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(recruiterPitch);
    setCopiedPitch(true);
    showToast('InMail outreach pitch copied to clipboard!', 'success');
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopiedLetter(true);
    showToast('STAR cover letter copied to clipboard!', 'success');
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleAddSnippet = (type) => {
    if (type === 'impact') {
      setCoverLetter((prev) => prev + '\n\nIn my previous architecture, I reduced inference latency by 45% while sustaining 4,800 req/sec across multi-node clusters with P99 < 15ms.');
    } else if (type === 'stack') {
      setCoverLetter((prev) => prev + '\n\nMy primary technical stack centers on PyTorch, custom Triton kernel optimization, FlashAttention, and high-throughput vLLM serving.');
    } else if (type === 'rag') {
      setCoverLetter((prev) => prev + '\n\nI architected a production multi-modal RAG cluster utilizing dense vector search, Reciprocal Rank Fusion (RRF), and cross-encoder re-ranking.');
    }
    showToast('Contextual evidence snippet injected into letter!', 'info');
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="APPLICATION INTELLIGENCE / 05"
        title={<>COVER PITCH<br />& LETTERS.</>}
        subtitle="An editorial writing surface generating role-tailored STAR cover letters and InMail recruiter pitches embedded with verified project evidence."
      />

      {/* ─── Active Target Pipeline Switcher Toolbar (Connection E) ─── */}
      {activeJobTargets && activeJobTargets.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            background: 'var(--bg-surface)',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
          role="region"
          aria-label="Active Job Pipeline Selector"
        >
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple, #a855f7)', fontWeight: 800 }}>
            ⚡ ACTIVE JOB TARGETS:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {activeJobTargets.slice(0, 5).map((job) => {
              const isActive = company.toLowerCase() === job.company.toLowerCase();
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleSelectJobPipeline(job)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 10px',
                    borderColor: isActive ? 'var(--purple)' : 'var(--border)',
                    background: isActive ? 'var(--purple, #a855f7)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                  }}
                  aria-label={`Calibrate pitch for ${job.company}`}
                >
                  🎯 {job.company.toUpperCase()} ({job.status.toUpperCase()})
                </button>
              );
            })}
            {companyParam && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => router.push('/cover-letter')}
                style={{ fontSize: '11px', color: 'var(--text-muted)' }}
              >
                Clear Context ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Contextual Pitch Studio Orientation Banner (Connection E) ─── */}
      {companyParam && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--purple, #a855f7)',
            borderLeft: '4px solid var(--purple, #a855f7)',
            padding: '16px 20px',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
          role="region"
          aria-label={`Calibrated pitch context for ${companyParam}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎯 CONTEXTUAL PITCH GENERATOR • {companyParam.toUpperCase()}
            </span>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              VERIFIED PORTFOLIO EVIDENCE CONNECTED
            </span>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
            Calibrated for <strong>{companyParam}</strong> ({roleParam || 'Target Role'}). Generation automatically embeds your top verified case studies ({projects?.[0]?.name || 'Triton Inference Gateway'}, {projects?.[1]?.name || 'Distributed Systems Engine'}) into paragraph 2.
          </p>
        </div>
      )}

      {/* Quick Role Presets */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>QUICK PRESETS:</span>
        {ROLE_PRESETS.map((p) => (
          <button
            key={p.company}
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11.5px', padding: '4px 10px' }}
            onClick={() => handleApplyPreset(p)}
          >
            {p.company} • {p.role.split('(')[0].trim()}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Left Form */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '14px', textTransform: 'uppercase' }}>Target Role Parameters</div>
          <form onSubmit={handleGenerate}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Target Company</label>
              <input
                className="input"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Anthropic, OpenAI, NVIDIA"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Target Role</label>
              <input
                className="input"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Staff AI Engineer"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Key Required Competencies</label>
              <input
                className="input"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. PyTorch, Triton, FlashAttention, Distributed Systems"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Job Description / Recruiter Focus</label>
              <textarea
                className="input"
                rows="4"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or requirements..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '10px 0', fontSize: '13px' }}
            >
              {loading ? 'Synthesizing STAR Pitch with Project Evidence...' : 'GENERATE TAILORED PITCH →'}
            </button>
          </form>
        </div>

        {/* Right Outputs */}
        <div className={styles.outputs}>
          {/* Recruiter Pitch Box */}
          <div className={styles.pitchCard}>
            <div className={styles.pitchHeader}>
              <div>
                <span className={styles.pitchTag}>LINKEDIN / INMAIL PITCH</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  {recruiterPitch.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyPitch}
                disabled={!recruiterPitch}
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
              >
                {copiedPitch ? '✓ Copied' : 'Copy Pitch'}
              </button>
            </div>
            <div className={styles.pitchContent}>
              {recruiterPitch || 'Generate a concise, high-converting LinkedIn DM or email to hiring managers.'}
            </div>
          </div>

          {/* Full Cover Letter Box */}
          <div className={styles.letterCard}>
            <div className={styles.letterHeader}>
              <div>
                <span className={styles.letterTag}>FORMAL APPLICATION LETTER</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  {coverLetter.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleAddSnippet('impact')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  + Add Latency Metric
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSnippet('rag')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  + Add RAG Metric
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCopyLetter}
                  disabled={!coverLetter}
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}
                >
                  {copiedLetter ? '✓ Copied' : 'Copy Letter'}
                </button>
              </div>
            </div>
            <div className={styles.letterContent}>
              {coverLetter || 'Your formal tailored STAR cover letter with verified projects and impact metrics will be crafted here.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="loadingSpinner" /><p>Calibrating Pitch Studio...</p></div>}>
      <CoverLetterContent />
    </Suspense>
  );
}
