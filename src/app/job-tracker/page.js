'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

const STAGES = [
  { key: 'wishlist', label: 'Wishlist', icon: '⭐' },
  { key: 'applied', label: 'Applied', icon: '📤' },
  { key: 'oa', label: 'Assessment / OA', icon: '💻' },
  { key: 'interview', label: 'Interview', icon: '🎙️' },
  { key: 'final', label: 'Final Round', icon: '🤝' },
  { key: 'offer', label: 'Offers / Decided', icon: '🎉' },
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
          applied_date: status !== 'wishlist' ? new Date().toISOString().split('T')[0] : null
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
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
    }
  };

  const handleMoveStage = async (jobId, nextStage) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStage })
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (e) {
      console.error('Error moving stage:', e);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job application?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
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
        <p>Loading Career Pipeline...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📌 Job Application Tracker & Role Matcher</h1>
          <p className={styles.subtitle}>
            Manage your high-priority DS/ML job pipeline from Wishlist to Offer with automatic skill matching.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Job Target
        </button>
      </div>

      {/* Kanban Board */}
      <div className={styles.boardContainer}>
        {STAGES.map((stage, sIdx) => {
          const stageJobs = jobs.filter((j) => j.status === stage.key);
          const prevStage = sIdx > 0 ? STAGES[sIdx - 1].key : null;
          const nextStage = sIdx < STAGES.length - 1 ? STAGES[sIdx + 1].key : null;

          return (
            <div key={stage.key} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span>{stage.icon}</span> {stage.label}
                </div>
                <span className={styles.columnCount}>{stageJobs.length}</span>
              </div>

              <div className={styles.cardList}>
                {stageJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No roles in this stage
                  </div>
                ) : (
                  stageJobs.map((job) => (
                    <div key={job.id} className={styles.jobCard}>
                      <div className={styles.jobCardHeader}>
                        <div>
                          <div className={styles.jobCompany}>{job.company}</div>
                          <div className={styles.jobRole}>{job.role}</div>
                        </div>
                        {job.match_score > 0 && (
                          <span className={`${styles.matchBadge} ${
                            job.match_score >= 80 ? styles.matchHigh : job.match_score >= 50 ? styles.matchMedium : styles.matchLow
                          }`}>
                            🎯 {job.match_score}%
                          </span>
                        )}
                      </div>

                      <div className={styles.jobMeta}>
                        {job.location && <span className={styles.jobMetaItem}>📍 {job.location}</span>}
                        {job.work_model && <span className={styles.jobMetaItem}>🌐 {job.work_model}</span>}
                        {job.salary && <span className={styles.jobMetaItem}>💰 {job.salary}</span>}
                      </div>

                      {job.notes && <div className={styles.jobNotes}>{job.notes}</div>}

                      <div className={styles.stageButtons}>
                        {prevStage ? (
                          <button 
                            className={styles.stageBtn} 
                            onClick={() => handleMoveStage(job.id, prevStage)}
                            title={`Move to ${prevStage}`}
                          >
                            ← Prev
                          </button>
                        ) : <div />}

                        <button 
                          className={styles.deleteBtn} 
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete application"
                        >
                          🗑️
                        </button>

                        {nextStage ? (
                          <button 
                            className={styles.stageBtn} 
                            onClick={() => handleMoveStage(job.id, nextStage)}
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
              <div className="modal-title">Add Target Job Application</div>
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
                    placeholder="e.g. Anthropic, Google, Snowflake"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Role / Position *</label>
                  <input 
                    className="input" 
                    required 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    placeholder="e.g. Machine Learning Engineer"
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
                    <label className="form-label">Salary Range</label>
                    <input 
                      className="input" 
                      value={salary} 
                      onChange={(e) => setSalary(e.target.value)} 
                      placeholder="e.g. $130k - $160k"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Stage</label>
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
                  <label className="form-label">Required Skills (Comma separated for match score)</label>
                  <input 
                    className="input" 
                    value={requiredSkills} 
                    onChange={(e) => setRequiredSkills(e.target.value)} 
                    placeholder="Python, PyTorch, Docker, SQL, FastAPI"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Posting URL</label>
                  <input 
                    className="input" 
                    value={jobUrl} 
                    onChange={(e) => setJobUrl(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Recruiter Contact</label>
                  <textarea 
                    className="textarea" 
                    rows={2} 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Recruiter info, interview notes, key technical prep items..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
