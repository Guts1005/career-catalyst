'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconCoverLetter, IconCheck } from '@/components/Icons';

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

  const handleAddSnippet = (type) => {
    if (type === 'impact') {
      setCoverLetter((prev) => prev + '\n\nIn my previous architecture, I reduced inference latency by 45% while decreasing VRAM footprint by 32% across multi-node clusters.');
    } else if (type === 'stack') {
      setCoverLetter((prev) => prev + '\n\nMy primary technical stack centers on PyTorch, Triton kernel optimization, FlashAttention, and high-throughput vLLM serving.');
    }
    showToast('Contextual bullet injected into letter!', 'info');
  };

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="OPPORTUNITIES / 05"
        title={<>COVER PITCH<br />& LETTERS.</>}
        subtitle="An editorial writing surface for role-tailored cover letters and recruiter pitch messages."
      />

      {/* 1-Click Quick Presets */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--gray-500)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>QUICK ROLE PRESETS:</span>
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
              <label className="form-label">Key Required Competencies</label>
              <input
                className="input"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. PyTorch, Triton, FlashAttention, Distributed Systems"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Job Description Summary</label>
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
              {loading ? 'Synthesizing STAR Application Pitch...' : 'GENERATE COVER PITCH →'}
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
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginLeft: '8px' }}>
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
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginLeft: '8px' }}>
                  {coverLetter.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleAddSnippet('impact')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  + Add Metric
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
