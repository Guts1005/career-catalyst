'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function CoverLetterPage() {
  const [company, setCompany] = useState('OpenAI');
  const [role, setRole] = useState('Machine Learning Engineer');
  const [requiredSkills, setRequiredSkills] = useState('PyTorch, Transformers, LLM Fine-Tuning, Distributed Training, FastAPI');
  const [jobDescription, setJobDescription] = useState('We are seeking an ML Engineer to develop state-of-the-art multimodal RAG systems and optimize high-throughput model inference.');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [recruiterPitch, setRecruiterPitch] = useState('');
  const [copiedPitch, setCopiedPitch] = useState(false);

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
          job_description: jobDescription
        })
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
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📝 1-Click Tailored Cover Letter & Recruiter Pitch</h1>
          <p className={styles.subtitle}>
            Instantly generate high-converting cover letters and LinkedIn outreach notes matching your database projects and metrics.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Input Form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Target Application Details</div>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Target Company *</label>
              <input
                className="input"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Anthropic, Databricks, Tesla"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Role *</label>
              <input
                className="input"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Machine Learning Engineer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Tech Stack / Keywords</label>
              <input
                className="input"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. PyTorch, CUDA, MLOps, AWS"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description Snippet (Optional)</label>
              <textarea
                className="textarea"
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or requirements..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Synthesizing with Database...' : '✨ Generate Tailored Letter & Pitch'}
            </button>
          </form>
        </div>

        {/* Live Output & Document Preview */}
        <div className={styles.previewSheet}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">Generated Documents</div>
            {coverLetter && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  🖨️ Print / Save as PDF
                </button>
              </div>
            )}
          </div>

          {coverLetter ? (
            <>
              {/* Formal Cover Letter */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  📄 Formal 1-Page Cover Letter
                </div>
                <div className={styles.previewContent}>
                  {coverLetter}
                </div>
              </div>

              {/* Recruiter DM Outreach */}
              <div className={styles.pitchBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    💬 LinkedIn Recruiter InMail Outreach (150 words)
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={handleCopyPitch}>
                    {copiedPitch ? '✓ Copied!' : '📋 Copy Pitch'}
                  </button>
                </div>
                <div className={styles.pitchText}>
                  {recruiterPitch}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ minHeight: '300px' }}>
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">Ready to Generate</div>
              <div className="empty-state-description">Fill in the target company and role to craft a tailored cover letter and recruiter pitch.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
