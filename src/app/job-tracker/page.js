'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import { IconJobs, IconCheck, IconArrowUpRight } from '@/components/Icons';

const STAGES = [
  { key: 'wishlist', label: 'Wishlist', dotClass: 'status-dot-gray' },
  { key: 'applied', label: 'Applied', dotClass: 'status-dot-blue' },
  { key: 'oa', label: 'Assessment / OA', dotClass: 'status-dot-amber' },
  { key: 'interview', label: 'Interview Round', dotClass: 'status-dot-purple' },
  { key: 'final', label: 'Final Round', dotClass: 'status-dot-orange' },
  { key: 'offer', label: 'Offers / Decided', dotClass: 'status-dot-green' },
  { key: 'rejected', label: 'Archived / Outcome', dotClass: 'status-dot-red' },
];

const REJECTION_REASONS = [
  'System Design & Architecture',
  'Distributed Systems & Concurrency',
  'MLOps & Production Deployment',
  'Coding & Algorithm Optimization',
  'Years of Seniority Experience',
];

export default function JobTrackerPage() {
  const { jobs: contextJobs, logRejectionFeedback, refreshCareerState } = useCareer();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileStage, setMobileStage] = useState('all');
  const searchInputRef = useRef(null);

  // Rejection Feedback State
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, jobId: null, company: '' });
  const [customRejectionReason, setCustomRejectionReason] = useState('');

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [workModel, setWorkModel] = useState('remote');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState('wishlist');
  const [jobUrl, setJobUrl] = useState('');
  const [recruiterContact, setRecruiterContact] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [notes, setNotes] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
      } else if (contextJobs && contextJobs.length > 0) {
        setJobs(contextJobs);
      } else {
        setJobs([
          { id: 1, company: 'Anthropic', role: 'ML Systems Engineer', location: 'San Francisco, CA', work_model: 'hybrid', salary: '$210,000 - $270,000', status: 'interview', match_score: 95, required_skills: 'PyTorch, Triton, CUDA, Distributed Systems' },
          { id: 2, company: 'NVIDIA', role: 'Inference Performance Engineer', location: 'Santa Clara, CA', work_model: 'onsite', salary: '$195,000 - $250,000', status: 'oa', match_score: 92, required_skills: 'C++, CUDA, TensorRT-LLM, FlashAttention' },
          { id: 3, company: 'Cohere', role: 'Distributed Training Engineer', location: 'Remote', work_model: 'remote', salary: '$185,000 - $240,000', status: 'applied', match_score: 89, required_skills: 'DeepSpeed, PyTorch, Ray, Megatron-LM' },
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
      setJobs(contextJobs || []);
    } finally {
      setLoading(false);
    }
  }, [contextJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !isModalOpen && !selectedJob) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedJob(null);
        setIsModalOpen(false);
        setRejectionModal({ isOpen: false, jobId: null, company: '' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedJob]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!company || !role) return;

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          location,
          work_model: workModel,
          salary,
          status,
          job_url: jobUrl,
          recruiter_contact: recruiterContact,
          required_skills: requiredSkills,
          notes,
          applied_date: status !== 'wishlist' ? new Date().toISOString().split('T')[0] : null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        showToast(`Target role at ${company} added to pipeline!`, 'success');
        setCompany('');
        setRole('');
        setLocation('');
        setSalary('');
        setJobUrl('');
        setRecruiterContact('');
        setRequiredSkills('');
        setNotes('');
        fetchJobs();
        refreshCareerState();
      }
    } catch (err) {
      console.error('Error creating job:', err);
      showToast('Failed to create job target', 'error');
    }
  };

  const handleMoveStage = async (jobId, nextStage, companyName) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStage }),
      });
      if (res.ok) {
        showToast(`Stage updated for ${companyName} → ${nextStage.toUpperCase()}`, 'success');
        setSelectedJob((prev) => (prev ? { ...prev, status: nextStage } : null));
        fetchJobs();
        refreshCareerState();

        // If moved to rejected, trigger feedback modal to turn loss into skill gap intelligence
        if (nextStage === 'rejected') {
          setRejectionModal({ isOpen: true, jobId, company: companyName });
        }
      }
    } catch (e) {
      console.error('Error moving job stage:', e);
    }
  };

  const handleSubmitRejectionFeedback = (reason) => {
    logRejectionFeedback(rejectionModal.jobId, rejectionModal.company, reason);
    setRejectionModal({ isOpen: false, jobId: null, company: '' });
    setCustomRejectionReason('');
  };

  const handleDeleteJob = async (id, companyName) => {
    if (!window.confirm(`Delete ${companyName} from your pipeline?`)) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Application record for ${companyName} deleted`, 'info');
        setSelectedJob(null);
        fetchJobs();
        refreshCareerState();
      }
    } catch (e) {
      console.error('Error deleting job:', e);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.company?.toLowerCase().includes(q) ||
      j.role?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.required_skills?.toLowerCase().includes(q)
    );
  });

  const displayedStages = mobileStage === 'all' ? STAGES : STAGES.filter((s) => s.key === mobileStage);

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="OPPORTUNITIES / 03"
        title={<>APPLICATION<br />PIPELINE.</>}
        subtitle="A high-velocity opportunity funnel tracking technical roles, compensation percentiles, and interview stages."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            + ADD TARGET ROLE
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, or skills... (/)"
            style={{ fontSize: '12.5px', paddingRight: '30px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '3px', padding: '1px 5px' }}>
            /
          </span>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          TOTAL TARGETS: {filteredJobs.length}
        </div>
      </div>

      {/* Mobile Segmented Stage Selector */}
      <div className={styles.mobileStageSelector}>
        <button
          type="button"
          className={`${styles.mobileStagePill} ${mobileStage === 'all' ? styles.mobileStagePillActive : ''}`}
          onClick={() => setMobileStage('all')}
        >
          ALL ({filteredJobs.length})
        </button>
        {STAGES.map((s) => {
          const count = filteredJobs.filter((j) => j.status === s.key).length;
          return (
            <button
              key={s.key}
              type="button"
              className={`${styles.mobileStagePill} ${mobileStage === s.key ? styles.mobileStagePillActive : ''}`}
              onClick={() => setMobileStage(s.key)}
            >
              <span className={`status-dot ${s.dotClass}`} style={{ marginRight: '4px' }} />
              {s.label.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Columns */}
      <div className={styles.kanbanBoard}>
        {displayedStages.map((stg) => {
          const colJobs = filteredJobs.filter((j) => j.status === stg.key);

          return (
            <div key={stg.key} className={styles.column}>
              <div className={styles.colHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`status-dot ${stg.dotClass}`} />
                  <span className={styles.colTitle}>{stg.label}</span>
                </div>
                <span className={styles.colCount}>{colJobs.length}</span>
              </div>

              <div className={styles.colCards}>
                {colJobs.length === 0 ? (
                  <div className={styles.emptyCol}>No roles in {stg.label.toLowerCase()}</div>
                ) : (
                  colJobs.map((j) => (
                    <div
                      key={j.id}
                      className={styles.jobCard}
                      onClick={() => setSelectedJob(j)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.companyName}>{j.company}</span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {j.match_score ? `${j.match_score}% MATCH` : '88% MATCH'}
                        </span>
                      </div>

                      <div className={styles.roleName}>{j.role}</div>

                      <div className={styles.cardMeta}>
                        <span>{j.location || 'Remote'}</span>
                        {j.salary && <span>• {j.salary}</span>}
                      </div>

                      {j.required_skills && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {j.required_skills.split(',').slice(0, 3).map((sk) => (
                            <span key={sk} style={{ fontSize: '10px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {sk.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Connected Interview Intelligence CTA (Connection C) */}
                      {['interview', 'final', 'oa'].includes(j.status) && (
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                          <Link
                            href={`/interview-prep?company=${encodeURIComponent(j.company)}&role=${encodeURIComponent(j.role)}&stage=${encodeURIComponent(j.status)}`}
                            className="btn btn-secondary btn-sm"
                            style={{
                              width: '100%',
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              padding: '5px 8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'var(--bg-surface)',
                              borderColor: 'var(--purple)',
                              color: 'var(--purple)',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Prepare technical questions for ${j.company} ${j.role} interview`}
                          >
                            <span>🎯 PREPARE FOR {j.company.toUpperCase()}</span>
                            <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Contextual Job Detail Preview Drawer ───────────────────── */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  TARGET APPLICATION RECORD
                </span>
                <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '2px' }}>
                  {selectedJob.company} — {selectedJob.role}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Connected Interview Preparation & Simulation Banner (Connections C & D) */}
              {['interview', 'final', 'oa'].includes(selectedJob.status) && (
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderLeft: '3px solid var(--purple)', padding: '12px 14px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--purple)', fontWeight: 800 }}>
                      ⚡ ACTIVE TECHNICAL INTERVIEW STAGE
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Prepare system design, architecture trade-offs, or run an AI simulation for {selectedJob.company}.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/interview-prep?company=${encodeURIComponent(selectedJob.company)}&role=${encodeURIComponent(selectedJob.role)}`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      🎯 QUESTION BANK →
                    </Link>
                    <Link
                      href={`/mock-interview?company=${encodeURIComponent(selectedJob.company)}&role=${encodeURIComponent(selectedJob.role)}`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      🎙️ SIMULATE ROUND →
                    </Link>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CURRENT STATUS</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                    {selectedJob.status}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LOCATION / MODEL</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>
                    {selectedJob.location || 'Remote'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>COMPENSATION</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>
                    {selectedJob.salary || '$180k - $240k'}
                  </div>
                </div>
              </div>

              {selectedJob.required_skills && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Required Technical Skills
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedJob.required_skills.split(',').map((sk) => (
                      <span key={sk} style={{ fontSize: '11px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        ✓ {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.notes && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Interview & Recruiter Notes
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-subtle)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {selectedJob.notes}
                  </p>
                </div>
              )}

              {/* Quick Stage Progression Trigger */}
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Move to Next Interview Stage:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      disabled={selectedJob.status === s.key}
                      onClick={() => handleMoveStage(selectedJob.id, s.key, selectedJob.company)}
                      className={`btn btn-sm ${selectedJob.status === s.key ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '11px', padding: '5px 8px' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleDeleteJob(selectedJob.id, selectedJob.company)}
                style={{ color: 'var(--red)', fontSize: '11.5px' }}
              >
                Delete Target Role
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedJob(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Rejection Feedback & Skill Gap Capture Modal ───────────── */}
      {rejectionModal.isOpen && (
        <div className="modal-overlay" onClick={() => setRejectionModal({ isOpen: false, jobId: null, company: '' })}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Turn Feedback into Skill Growth</h3>
              <button className="modal-close" onClick={() => setRejectionModal({ isOpen: false, jobId: null, company: '' })}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                What technical topic or gap was highlighted by <strong>{rejectionModal.company}</strong>? Catalyst will elevate this competency in your Skill Gap Map to strengthen future applications.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {REJECTION_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSubmitRejectionFeedback(reason)}
                    style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '12px', padding: '10px 14px' }}
                  >
                    + Prioritize: {reason}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  className="input"
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="Or enter custom topic (e.g. Triton, Ray)..."
                  style={{ flex: 1, fontSize: '12px' }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => customRejectionReason.trim() && handleSubmitRejectionFeedback(customRejectionReason.trim())}
                  disabled={!customRejectionReason.trim()}
                >
                  SAVE GAP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Role Modal ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Track Target Application</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Anthropic, Cohere, NVIDIA"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Title *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior ML Engineer"
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Model</label>
                    <select className="input" value={workModel} onChange={(e) => setWorkModel(e.target.value)}>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Compensation</label>
                    <input
                      type="text"
                      className="input"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="$220k - $290k"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Stage</label>
                  <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="oa">Assessment / OA</option>
                    <option value="interview">Interview Round</option>
                    <option value="final">Final Round</option>
                    <option value="offer">Offer Received</option>
                    <option value="rejected">Archived / Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="PyTorch, Triton, Distributed Training, CUDA"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Prep Topics</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Recruiter contact, expected system design questions..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Target Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
