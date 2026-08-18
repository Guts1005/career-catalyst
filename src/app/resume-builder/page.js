'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

export default function ResumeBuilderPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);

  // Selections
  const [includeAllCerts, setIncludeAllCerts] = useState(true);
  const [includeAllProjects, setIncludeAllProjects] = useState(true);
  const [includeAllSkills, setIncludeAllSkills] = useState(true);

  const fetchResumeData = useCallback(async () => {
    try {
      const res = await fetch('/api/resume');
      const json = await res.json();
      if (json.resume) {
        setData(json);
        const r = json.resume;
        setFullName(r.full_name || '');
        setEmail(r.email || '');
        setPhone(r.phone || '');
        setLocation(r.location || '');
        setLinkedinUrl(r.linkedin_url || '');
        setGithubUrl(r.github_url || '');
        setPortfolioUrl(r.portfolio_url || '');
        setSummary(r.summary || '');
        setEducationList(r.education || []);
        setExperienceList(r.experience || []);
      }
    } catch (e) {
      console.error('Failed to load resume:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumeData();
  }, [fetchResumeData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Primary DS/ML Resume',
          full_name: fullName,
          email,
          phone,
          location,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl,
          summary,
          template_name: 'modern-ats',
          education: educationList,
          experience: experienceList
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving resume:', e);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      {
        role: 'Data Science / ML Intern',
        company: 'Company Name',
        location: 'Location',
        dates: 'Jun 2025 – Aug 2025',
        bullets: ['Engineered ML pipeline improving performance by 25%.']
      }
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experienceList];
    updated[index][field] = value;
    setExperienceList(updated);
  };

  const handleAddBullet = (expIndex) => {
    const updated = [...experienceList];
    updated[expIndex].bullets.push('Developed model architecture using Python and PyTorch.');
    setExperienceList(updated);
  };

  const handleUpdateBullet = (expIndex, bulletIndex, value) => {
    const updated = [...experienceList];
    updated[expIndex].bullets[bulletIndex] = value;
    setExperienceList(updated);
  };

  const handleDeleteBullet = (expIndex, bulletIndex) => {
    const updated = [...experienceList];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setExperienceList(updated);
  };

  const handleDeleteExperience = (index) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="loadingSpinner" />
        <p>Loading Resume Studio...</p>
      </div>
    );
  }

  const liveCertifications = data?.liveData?.certifications || [];
  const liveProjects = data?.liveData?.projects || [];
  const liveSkillsByCategory = data?.liveData?.skillsByCategory || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>📄 AI Resume Studio & PDF Exporter</h1>
          <p className={styles.headerSubtitle}>
            Auto-generate and fine-tune an ATS-optimized Data Science & ML resume synced directly with your database.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className="btn btn-secondary" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Saved' : '💾 Save Changes'}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Export PDF / Print
          </button>
        </div>
      </div>

      <div className={styles.builderGrid}>
        {/* Editor Controls */}
        <div className={styles.editorPanel}>
          {/* Contact Information */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>👤 Personal & Contact Info</div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Full Name</label>
              <input 
                className={styles.input} 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Sharvin Neve"
              />
            </div>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email</label>
                <input 
                  className={styles.input} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone</label>
                <input 
                  className={styles.input} 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Location</label>
              <input 
                className={styles.input} 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>LinkedIn</label>
                <input 
                  className={styles.input} 
                  value={linkedinUrl} 
                  onChange={(e) => setLinkedinUrl(e.target.value)} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>GitHub</label>
                <input 
                  className={styles.input} 
                  value={githubUrl} 
                  onChange={(e) => setGithubUrl(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>🎯 Executive Summary</div>
            </div>
            <textarea 
              className={styles.textarea} 
              rows={4} 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              placeholder="Highlight your DS/ML expertise, top languages, and passion..."
            />
          </div>

          {/* Synced Database Data Toggles */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>⚡ Integrated Database Sync</div>
              <span className={styles.sectionBadge}>Live Data</span>
            </div>
            <div className={styles.toggleList}>
              <label className={styles.toggleItem}>
                <span className={styles.toggleLabel}>
                  🏆 Include Completed Certifications ({liveCertifications.length})
                </span>
                <input 
                  type="checkbox" 
                  checked={includeAllCerts} 
                  onChange={(e) => setIncludeAllCerts(e.target.checked)} 
                />
              </label>
              <label className={styles.toggleItem}>
                <span className={styles.toggleLabel}>
                  🚀 Include Tracked Projects ({liveProjects.length})
                </span>
                <input 
                  type="checkbox" 
                  checked={includeAllProjects} 
                  onChange={(e) => setIncludeAllProjects(e.target.checked)} 
                />
              </label>
              <label className={styles.toggleItem}>
                <span className={styles.toggleLabel}>
                  🎯 Include Categorized Technical Skills
                </span>
                <input 
                  type="checkbox" 
                  checked={includeAllSkills} 
                  onChange={(e) => setIncludeAllSkills(e.target.checked)} 
                />
              </label>
            </div>
          </div>

          {/* Experience Section */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>💼 Experience & Research</div>
              <button className="btn btn-secondary btn-sm" onClick={handleAddExperience}>
                + Add Experience
              </button>
            </div>

            {experienceList.map((exp, expIdx) => (
              <div key={expIdx} className={styles.expItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Experience #{expIdx + 1}</strong>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteExperience(expIdx)}>
                    Remove
                  </button>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Role</label>
                    <input 
                      className={styles.input} 
                      value={exp.role} 
                      onChange={(e) => handleUpdateExperience(expIdx, 'role', e.target.value)} 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Organization / Company</label>
                    <input 
                      className={styles.input} 
                      value={exp.company} 
                      onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)} 
                    />
                  </div>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Location</label>
                    <input 
                      className={styles.input} 
                      value={exp.location} 
                      onChange={(e) => handleUpdateExperience(expIdx, 'location', e.target.value)} 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Dates</label>
                    <input 
                      className={styles.input} 
                      value={exp.dates} 
                      onChange={(e) => handleUpdateExperience(expIdx, 'dates', e.target.value)} 
                    />
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label className={styles.inputLabel}>Impact Bullets (STAR Method)</label>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} className={styles.bulletInputRow}>
                      <input 
                        className={styles.input} 
                        value={b} 
                        onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)} 
                      />
                      <button 
                        className={styles.deleteBtn} 
                        onClick={() => handleDeleteBullet(expIdx, bIdx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ marginTop: '4px' }}
                    onClick={() => handleAddBullet(expIdx)}
                  >
                    + Add Bullet
                  </button>
                </div>
              </div>
            ))}

            <div className={styles.starBox}>
              <div className={styles.starTitle}>💡 High-Impact STAR Formula for DS/ML:</div>
              <div className={styles.starDesc}>
                [Action Verb: <em>Architected/Trained/Optimized</em>] + [System: <em>Transformer pipeline/XGBoost classifier</em>] + [Technologies: <em>PyTorch, Docker, AWS</em>] + [Quantifiable Metric: <em>improved latency by 35% / +94% precision</em>].
              </div>
            </div>
          </div>
        </div>

        {/* Live Printable Preview Paper */}
        <div className={styles.previewSticky}>
          <div className={styles.paperWrapper} id="resume-paper">
            {/* Header */}
            <div className={styles.paperHeader}>
              <h1 className={styles.paperName}>{fullName || 'Your Name'}</h1>
              <div className={styles.paperContact}>
                {email && <span>✉️ {email}</span>}
                {phone && <span>📞 {phone}</span>}
                {location && <span>📍 {location}</span>}
                {linkedinUrl && <span>🔗 {linkedinUrl}</span>}
                {githubUrl && <span>🐙 {githubUrl}</span>}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Professional Summary</div>
                <p className={styles.paperSummary}>{summary}</p>
              </div>
            )}

            {/* Technical Skills */}
            {includeAllSkills && Object.keys(liveSkillsByCategory).length > 0 && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Technical Skills</div>
                {Object.entries(liveSkillsByCategory).map(([cat, skills]) => (
                  <div key={cat} className={styles.paperSkillCategory}>
                    <strong>{cat}:</strong> {skills.join(', ')}
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {experienceList.length > 0 && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Experience & Research</div>
                {experienceList.map((exp, idx) => (
                  <div key={idx} className={styles.paperEntry}>
                    <div className={styles.paperEntryHeader}>
                      <div>
                        <span className={styles.paperEntryTitle}>{exp.role}</span> — <span className={styles.paperEntrySubtitle}>{exp.company}</span>
                      </div>
                      <div className={styles.paperEntryDates}>{exp.dates} | {exp.location}</div>
                    </div>
                    <ul className={styles.paperBullets}>
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {includeAllProjects && liveProjects.length > 0 && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Key Machine Learning & AI Projects</div>
                {liveProjects.map((p) => (
                  <div key={p.id} className={styles.paperEntry}>
                    <div className={styles.paperEntryHeader}>
                      <div>
                        <span className={styles.paperEntryTitle}>{p.name}</span>
                        {p.category && <span className={styles.paperEntrySubtitle}> ({p.category})</span>}
                      </div>
                      <div className={styles.paperEntryDates}>
                        {p.github_url && <span>github.com</span>}
                      </div>
                    </div>
                    {p.tech_stack && (
                      <div className={styles.paperTechTags}>Technologies: {p.tech_stack}</div>
                    )}
                    <ul className={styles.paperBullets}>
                      {p.description && <li>{p.description}</li>}
                      {p.impact && <li><strong>Impact:</strong> {p.impact}</li>}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {includeAllCerts && liveCertifications.length > 0 && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Certifications & Credentials</div>
                <ul className={styles.paperBullets}>
                  {liveCertifications.map((c) => (
                    <li key={c.id}>
                      <strong>{c.name}</strong> — {c.provider} {c.status === 'completed' ? '(Verified / Earned)' : `(${c.progress}% Completed)`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education */}
            {educationList.length > 0 && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Education</div>
                {educationList.map((edu, idx) => (
                  <div key={idx} className={styles.paperEntry}>
                    <div className={styles.paperEntryHeader}>
                      <span className={styles.paperEntryTitle}>{edu.institution}</span>
                      <span className={styles.paperEntryDates}>{edu.graduation_year}</span>
                    </div>
                    <div className={styles.paperEntrySubtitle}>
                      {edu.degree} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </div>
                    {edu.coursework && (
                      <div style={{ fontSize: '10.5px', color: '#4b5563', marginTop: '2px' }}>
                        Coursework: {edu.coursework}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
