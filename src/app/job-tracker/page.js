'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import {
  IconJobs,
  IconCheck,
} from '@/components/Icons';

const STAGES = [
  { key: 'wishlist', label: 'Wishlist', dotColor: 'var(--text-muted)' },
  { key: 'applied', label: 'Applied', dotColor: 'var(--info)' },
  { key: 'oa', label: 'Assessment / OA', dotColor: 'var(--warning)' },
  { key: 'interview', label: 'Interview Round', dotColor: '#a855f7' },
  { key: 'final', label: 'Final Round', dotColor: '#f97316' },
  { key: 'offer', label: 'Offers / Decided', dotColor: 'var(--success)' },
];

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        showToast(`${companyName || 'Role'} moved to ${nextStage.toUpperCase()}`, 'info');
        fetchJobs();
      }
    } catch (e) {
      console.error('Error moving stage:', e);
    }
  };

  const handleDeleteJob = async (jobId, companyName) => {
    if (!window.confirm(`Delete application for ${companyName}?`)) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Application for ${companyName} removed`, 'info');
        fetchJobs();
      }
    } catch (e) {
      console.error('Error deleting job:', e);
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="loadingSpinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>Loading Application Pipeline...</p>
      </div>
    );
  }

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

      {/* Kanban Board */}
      <div className={styles.boardContainer}>
        {STAGES.map((stage, sIdx) => {
          const stageJobs = jobs.filter((j) => j.status === stage.key);
          const prevStage = sIdx > 0 ? STAGES[sIdx - 1].key : null;
          const nextStage = sIdx < STAGES.length - 1 ? STAGES[sIdx + 1].key : null;

          return (
            <div key={stage.key} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: stage.dotColor }} />
                  <span>{stage.label}</span>
                </div>
                <span className={styles.columnCount} style={{ fontFamily: 'var(--font-mono)' }}>{stageJobs.length}</span>
              </div>

              <div className={styles.cardList}>
                {stageJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Empty Stage
                  </div>
                ) : (
                  stageJobs.map((job) => (
                    <div key={job.id} className={styles.jobCard}>
                      <div className={styles.jobCardHeader}>
                        <div>
                          <div className={styles.jobCompany} style={{ fontWeight: 600 }}>{job.company}</div>
                          <div className={styles.jobRole} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.role}</div>
                        </div>
                        {job.match_score > 0 && (
                          <span
                            className={`${styles.matchBadge} ${
                              job.match_score >= 80 ? styles.matchHigh : job.match_score >= 50 ? styles.matchMedium : styles.matchLow
                            }`}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}
                          >
                            {job.match_score}% Match
                          </span>
                        )}
                      </div>

                      <div className={styles.jobMeta}>
                        {job.location && <span className={styles.jobMetaItem}>{job.location}</span>}
                        {job.work_model && <span className={styles.jobMetaItem}>• {job.work_model}</span>}
                        {job.salary && <span className={styles.jobMetaItem}>• {job.salary}</span>}
                      </div>

                      {job.notes && <div className={styles.jobNotes}>{job.notes}</div>}

                      <div className={styles.stageButtons}>
                        {prevStage ? (
                          <button
                            className={styles.stageBtn}
                            onClick={() => handleMoveStage(job.id, prevStage, job.company)}
                            title={`Move to ${prevStage}`}
                          >
                            ← Prev
                          </button>
                        ) : <div />}

                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteJob(job.id, job.company)}
                          title="Delete application"
                          style={{ fontSize: '11px' }}
                        >
                          Delete
                        </button>

                        {nextStage ? (
                          <button
                            className={styles.stageBtn}
                            onClick={() => handleMoveStage(job.id, nextStage, job.company)}
                            title={`Move to ${nextStage}`}
                          >
                            Next →
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Job Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>Add Target Job Application</div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
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
                    placeholder="e.g. Anthropic, OpenAI, Databricks"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Role *</label>
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
                    <label className="form-label">Work Model</label>
                    <select
                      className="select"
                      value={workModel}
                      onChange={(e) => setWorkModel(e.target.value)}
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Target Compensation</label>
                    <input
                      className="input"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. $190k - $240k"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pipeline Stage</label>
                    <select
                      className="select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Required Skills (Comma separated)</label>
                  <input
                    className="input"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="PyTorch, Triton, Distributed Training"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes & Recruiter Contact</label>
                  <textarea
                    className="input"
                    style={{ minHeight: '60px', fontFamily: 'inherit' }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key talking points or referral context..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Target Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
