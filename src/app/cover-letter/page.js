'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import {
  IconCoverLetter,
  IconCheck,
} from '@/components/Icons';

const ROLE_PRESETS = [
  {
    company: 'Anthropic',
    role: 'Staff AI Engineer (Claude Research)',
    skills: 'PyTorch, Transformers, FlashAttention, Triton, Distributed Training, RLHF, vLLM',
    jd: 'Developing frontier model architectures, reinforcement learning from human feedback (RLHF), and high-throughput low-latency inference.'
  },
  {
    company: 'OpenAI',
    role: 'Senior ML Infrastructure Engineer',
    skills: 'PyTorch, CUDA, Kubernetes, Ray, NCCL, Slurm, vLLM, Triton',
    jd: 'Scaling distributed ML training clusters, optimizing GPU networking communication with NCCL, and building production model serving infrastructure.'
  },
  {
    company: 'Databricks',
    role: 'Solutions Architect — Machine Learning',
    skills: 'Python, SQL, Apache Spark, MLflow, Delta Lake, Feature Store, Production MLOps',
    jd: 'Designing end-to-end production data science pipelines and MLOps platforms on lakehouse architecture for enterprise customers.'
  }
];

export default function CoverLetterPage() {
  const [company, setCompany] = useState(ROLE_PRESETS[0].company);
  const [role, setRole] = useState(ROLE_PRESETS[0].role);
  const [requiredSkills, setRequiredSkills] = useState(ROLE_PRESETS[0].skills);
  const [jobDescription, setJobDescription] = useState(ROLE_PRESETS[0].jd);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [recruiterPitch, setRecruiterPitch] = useState('');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  const handleApplyPreset = (p) => {
    setCompany(p.company);
    setRole(p.role);
    setRequiredSkills(p.skills);
    setJobDescription(p.jd);
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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoverLetter(data.coverLetter);
        setRecruiterPitch(data.recruiterPitch);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          <IconCoverLetter size={13} />
          OUTREACH & PITCH GENERATOR
        </div>
        <h1 style={{ letterSpacing: '-0.03em', fontSize: '24px', fontWeight: 700 }}>Tailored Cover Letter & Recruiter Pitch</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
          Generate high-converting STAR cover letters and LinkedIn InMail notes customized with your verified projects and metrics.
        </p>

        {/* 1-Click Presets */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Role Presets:</span>
          {ROLE_PRESETS.map((p) => (
            <button
              key={p.company}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
              onClick={() => handleApplyPreset(p)}
            >
              {p.company} • {p.role.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Form */}
        <div className="card">
          <div className="card-title" style={{ fontSize: '13.5px', marginBottom: '14px' }}>Target Application Parameters</div>
          <form onSubmit={handleGenerate}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Target Company</label>
              <input
                className="input"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Anthropic, OpenAI, Databricks"
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
              <label className="form-label">Required Skills</label>
              <input
                className="input"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="PyTorch, Triton, FlashAttention"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Job Summary</label>
              <textarea
                className="input"
                style={{ minHeight: '80px', fontFamily: 'inherit' }}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '9px 16px', fontSize: '13px' }}
              disabled={loading}
            >
              {loading ? 'Synthesizing Tailored Pitch...' : 'Generate Pitch & Formal Letter'}
            </button>
          </form>
        </div>

        {/* Right Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* LinkedIn InMail Pitch */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="card-title" style={{ fontSize: '13px' }}>LinkedIn / Recruiter InMail Pitch (100 words)</div>
              {recruiterPitch && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                  onClick={handleCopyPitch}
                >
                  {copiedPitch ? '✓ Copied!' : 'Copy Pitch'}
                </button>
              )}
            </div>
            <textarea
              className={styles.outputBox}
              style={{ minHeight: '110px', fontSize: '12.5px' }}
              readOnly
              value={recruiterPitch || 'Click "Generate Pitch" or choose a preset to synthesize a tailored outreach note.'}
            />
          </div>

          {/* Formal STAR Cover Letter */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="card-title" style={{ fontSize: '13px' }}>Formal STAR Cover Letter</div>
              {coverLetter && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                  onClick={handleCopyLetter}
                >
                  {copiedLetter ? '✓ Copied!' : 'Copy Letter'}
                </button>
              )}
            </div>
            <textarea
              className={styles.outputBox}
              style={{ minHeight: '190px', fontSize: '12.5px' }}
              readOnly
              value={coverLetter || 'Tailored formal letter referencing your real database projects, metrics, and certifications.'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
