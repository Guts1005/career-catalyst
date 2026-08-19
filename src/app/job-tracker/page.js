'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { IconJobs, IconCheck, IconArrowUpRight } from '@/components/Icons';

const STAGES = [
  { key: 'wishlist', label: 'Wishlist', dotClass: 'status-dot-gray' },
  { key: 'applied', label: 'Applied', dotClass: 'status-dot-blue' },
  { key: 'oa', label: 'Assessment / OA', dotClass: 'status-dot-amber' },
  { key: 'interview', label: 'Interview Round', dotClass: 'status-dot-purple' },
  { key: 'final', label: 'Final Round', dotClass: 'status-dot-orange' },
  { key: 'offer', label: 'Offers / Decided', dotClass: 'status-dot-green' },
];

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

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
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

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
        setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: nextStage } : j)));
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob({ ...selectedJob, status: nextStage });
        }
        showToast(`${companyName || 'Application'} advanced to ${nextStage.toUpperCase()}`, 'info');
      }
    } catch (err) {
      console.error('Error moving job stage:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== jobId));
        setSelectedJob(null);
        showToast('Application record removed', 'info');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return j.company?.toLowerCase().includes(q) || j.role?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="OPPORTUNITIES / 03"
        title={<>APPLICATION<br />PIPELINE.</>}
        subtitle="Track target AI, Machine Learning, and Data Science roles from initial outreach through technical rounds and final offers."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            + ADD TARGET ROLE
          </button>
        }
      />

      {/* Pipeline Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
          <input
            ref={searchInputRef}
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pipeline... (Press / to focus)"
            style={{ fontSize: '12.5px', paddingRight: '32px' }}
          />
          <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', border: '1px solid var(--gray-200)', borderRadius: '3px', padding: '1px 5px' }}>
            /
          </span>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>
          TOTAL TARGETS: {filteredJobs.length}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className={styles.kanbanBoard}>
        {STAGES.map((stg) => {
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
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>
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
                            <span key={sk} style={{ fontSize: '10px', background: 'var(--off-white)', border: '1px solid var(--gray-100)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                              {sk.trim()}
                            </span>
                          ))}
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
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  TARGET APPLICATION RECORD
                </span>
                <h3 className="modal-title" style={{ fontSize: '18px', marginTop: '2px' }}>
                  {selectedJob.company} — {selectedJob.role}
                </h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>CURRENT STATUS</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>
                    {selectedJob.status}
                  </div>
                </div>
                <div style={{ background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>LOCATION / MODEL</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px' }}>
                    {selectedJob.location || 'Remote'}
                  </div>
                </div>
                <div style={{ background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>COMPENSATION</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '2px' }}>
                    {selectedJob.salary || '$160k - $220k'}
                  </div>
                </div>
              </div>

              {selectedJob.required_skills && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '6px' }}>
                    TECHNICAL STACK REQUIREMENTS:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedJob.required_skills.split(',').map((sk) => (
                      <span key={sk} style={{ fontSize: '11px', background: 'var(--off-white)', border: '1px solid var(--gray-200)', padding: '3px 8px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
                        ✓ {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.notes && (
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '4px' }}>
                    APPLICATION NOTES & INTEL:
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', background: 'var(--off-white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--gray-100)' }}>
                    {selectedJob.notes}
                  </p>
                </div>
              )}

              {/* Stage Mover Selector */}
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginBottom: '8px' }}>
                  ADVANCE STAGE:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleMoveStage(selectedJob.id, s.key, selectedJob.company)}
                      style={{
                        background: selectedJob.status === s.key ? 'var(--black)' : 'var(--white)',
                        color: selectedJob.status === s.key ? 'var(--white)' : 'var(--black)',
                        border: '1px solid',
                        borderColor: selectedJob.status === s.key ? 'var(--black)' : 'var(--gray-200)',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handleDeleteJob(selectedJob.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                REMOVE RECORD
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/cover-letter" className="btn btn-secondary btn-sm">
                  DRAFT COVER PITCH →
                </Link>
                {selectedJob.job_url && (
                  <a href={selectedJob.job_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    OPEN JOB POST ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Target Job Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Track New Target Role</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    className="input"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Anthropic, OpenAI, Meta"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Title *</label>
                  <input
                    className="input"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Staff AI Engineer"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Salary</label>
                    <input
                      className="input"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. $180,000 - $240,000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    className="input"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="e.g. PyTorch, CUDA, Triton, FlashAttention"
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
