'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';
import PageHeader from '@/components/PageHeader';
import { useCareer } from '@/context/CareerContext';
import {
  IconResume,
  IconCertifications,
  IconProjects,
  IconSkills,
  IconCheck,
} from '@/components/Icons';

export default function ResumeBuilderPage() {
  const {
    userProfile,
    skills: careerSkills,
    projects: careerProjects,
    injectedBullets,
    acceptInjectedBullet,
    dismissInjectedBullet,
  } = useCareer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('Sharvin Neve');
  const [email, setEmail] = useState('sharvinneve67@gmail.com');
  const [phone, setPhone] = useState('+1 (555) 342-8901');
  const [location, setLocation] = useState('San Francisco, CA');
  const [linkedinUrl, setLinkedinUrl] = useState('linkedin.com/in/sharvin-neve');
  const [githubUrl, setGithubUrl] = useState('github.com/Guts1005');
  const [portfolioUrl, setPortfolioUrl] = useState('career-catalyst.dev');
  const [summary, setSummary] = useState(
    'Machine Learning Engineer specializing in high-throughput PyTorch inference, custom Triton GPU kernels, multi-modal RAG systems, and distributed training clusters. Proven track record in reducing P99 latency and scaling LLM serving architectures.'
  );
  const [educationList, setEducationList] = useState([
    {
      institution: 'University of Technology',
      degree: 'B.S. in Computer Science & Data Science',
      dates: '2022 – 2026',
      gpa: '3.88 / 4.00',
      location: 'San Francisco, CA',
      coursework: 'Distributed Systems, Deep Learning, GPU Kernel Architecture, Operating Systems',
    },
  ]);
  const [experienceList, setExperienceList] = useState([
    {
      company: 'Frontier AI Research Lab',
      role: 'Machine Learning Research Engineer',
      dates: '2024 – Present',
      location: 'San Francisco, CA',
      bullets: [
        'Engineered custom Triton C++ kernels for online FlashAttention-2 tiling, reducing KV-cache VRAM demand by 45%.',
        'Implemented distributed model serving with vLLM and FastAPI on 8x H100 clusters, sustaining 4,800 req/sec with P99 < 15ms.',
        'Architected hybrid vector retrieval system combining dense embeddings with BM25 sparse indices and cross-encoder re-ranking.',
      ],
    },
  ]);

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
        if (r.full_name) setFullName(r.full_name);
        if (r.email) setEmail(r.email);
        if (r.phone) setPhone(r.phone);
        if (r.location) setLocation(r.location);
        if (r.linkedin_url) setLinkedinUrl(r.linkedin_url);
        if (r.github_url) setGithubUrl(r.github_url);
        if (r.portfolio_url) setPortfolioUrl(r.portfolio_url);
        if (r.summary) setSummary(r.summary);
        if (r.education?.length) setEducationList(r.education);
        if (r.experience?.length) setExperienceList(r.experience);
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
          title: 'Primary ML/DS Resume',
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
          experience: experienceList,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        showToast('Resume profile saved to cloud database!', 'success');
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving resume:', e);
      showToast('Failed to save resume changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBullet = (expIndex) => {
    const next = [...experienceList];
    next[expIndex].bullets.push('Spearheaded end-to-end ML pipeline with measurable latency reduction.');
    setExperienceList(next);
  };

  const handleDeleteBullet = (expIndex, bulletIndex) => {
    const next = [...experienceList];
    next[expIndex].bullets = next[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setExperienceList(next);
  };

  // Connection F: Accept an ATS-injected bullet and insert into first experience entry
  const handleAcceptInjectedBullet = (bullet) => {
    const next = [...experienceList];
    if (next.length > 0) {
      next[0].bullets.push(bullet.bulletText);
      setExperienceList(next);
    }
    acceptInjectedBullet(bullet.id);
    showToast(`Achievement bullet for "${bullet.keyword}" inserted into resume experience!`, 'success');
  };

  // Generate Overleaf-Compatible LaTeX Code
  const generateLatexSource = () => {
    return `% Overleaf / TeX Live Compatible ATS Resume
\\documentclass[letterpaper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlist[itemize]{noitemsep, topsep=2pt, leftmargin=1.5em}

\\begin{document}
\\begin{center}
    {\\LARGE \\textbf{${fullName}}} \\\\[3pt]
    \\small ${email} $|$ ${phone} $|$ ${location} $|$ \\href{https://${githubUrl}}{${githubUrl}} $|$ \\href{https://${linkedinUrl}}{${linkedinUrl}}
\\end{center}

\\vspace{4pt}
\\noindent\\textbf{\\uppercase{Professional Summary}}
\\hrule
\\vspace{3pt}
\\noindent\\small ${summary}

\\vspace{8pt}
\\noindent\\textbf{\\uppercase{Technical Competencies}}
\\hrule
\\vspace{3pt}
\\begin{itemize}
    \\item \\textbf{Machine Learning \\& Systems:} PyTorch, Triton, FlashAttention, CUDA, vLLM, DeepSpeed, Ray
    \\item \\textbf{Infrastructure \\& Tools:} Docker, Kubernetes, AWS EC2, GCP, FastAPI, Git, CI/CD, Linux
    \\item \\textbf{Data Systems:} Vector Databases (FAISS, Milvus), SQL, Apache Spark, Kafka
\\end{itemize}

\\vspace{8pt}
\\noindent\\textbf{\\uppercase{Experience \\& Engineering Research}}
\\hrule
\\vspace{3pt}
${experienceList
  .map(
    (exp) => `\\noindent\\textbf{${exp.role}} \\hfill \\textbf{${exp.dates}} \\\\
\\textit{${exp.company}} \\hfill \\textit{${exp.location}}
\\begin{itemize}
${exp.bullets.map((b) => `    \\item ${b}`).join('\n')}
\\end{itemize}
\\vspace{4pt}`
  )
  .join('\n')}

\\noindent\\textbf{\\uppercase{Education}}
\\hrule
\\vspace{3pt}
${educationList
  .map(
    (edu) => `\\noindent\\textbf{${edu.institution}} \\hfill \\textbf{${edu.dates}} \\\\
\\textit{${edu.degree}} (GPA: ${edu.gpa}) \\hfill \\textit{${edu.location}} \\\\
\\small Coursework: ${edu.coursework}`
  )
  .join('\n')}

\\end{document}`;
  };

  // Generate GitHub Markdown Resume
  const generateMarkdownResume = () => {
    return `# ${fullName}
${email} • ${phone} • ${location} • [GitHub](https://${githubUrl}) • [LinkedIn](https://${linkedinUrl})

## Professional Summary
${summary}

## Technical Competencies
- **Machine Learning & Systems:** PyTorch, Triton, FlashAttention, CUDA, vLLM, DeepSpeed, Ray
- **Infrastructure & Tools:** Docker, Kubernetes, AWS, GCP, FastAPI, Git, Linux
- **Data Systems:** Vector Search (FAISS/Milvus), SQL, Spark, Kafka

## Experience & Engineering
${experienceList
  .map(
    (exp) => `### ${exp.role} — ${exp.company}
*${exp.dates} | ${exp.location}*
${exp.bullets.map((b) => `- ${b}`).join('\n')}
`
  )
  .join('\n')}

## Education
${educationList
  .map(
    (edu) => `### ${edu.institution}
*${edu.degree} (GPA: ${edu.gpa}) — ${edu.dates}*
Coursework: ${edu.coursework}
`
  )
  .join('\n')}`;
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(generateLatexSource());
    showToast('LaTeX source copied to clipboard (Overleaf ready)!', 'success');
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownResume());
    showToast('Markdown resume copied to clipboard!', 'success');
  };

  const liveSkills = careerSkills.length > 0 ? careerSkills : [
    { name: 'PyTorch & CUDA', category: 'Machine Learning' },
    { name: 'Distributed Systems', category: 'Systems' },
    { name: 'Docker & Kubernetes', category: 'Infrastructure' },
    { name: 'Vector Search (FAISS)', category: 'Data Systems' },
  ];

  const liveProjects = careerProjects.length > 0 ? careerProjects : [
    {
      id: 1,
      name: 'Triton Low-Latency Inference Gateway',
      description: 'Custom Triton C++ kernel serving Llama-3 with dynamic batching and P99 latency < 14ms under 5k QPS.',
      technologies: 'C++, PyTorch, Triton, CUDA, Docker',
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        chapter="PORTFOLIO & PROOF / 08"
        title={<>ATS RESUME BUILDER &<br />LATEX EXPORT.</>}
        subtitle="Produce high-density, ATS-compliant technical resumes synced with your portfolio proof and verified credentials."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopyMarkdown} style={{ fontSize: '11.5px', padding: '6px 12px' }}>
              📝 COPY MARKDOWN
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCopyLatex} style={{ fontSize: '11.5px', padding: '6px 12px' }}>
              📄 COPY LATEX CODE
            </button>
            <a href="/api/backup?format=jsonresume" className="btn btn-secondary" style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}>
              💾 JSON RESUME
            </a>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: '11.5px', padding: '6px 14px' }}>
              {saving ? 'SAVING...' : 'SAVE RESUME ✓'}
            </button>
          </div>
        }
      />

      <div className={styles.editorGrid}>
        {/* Left: Input Form */}
        <div className={styles.formSection}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Contact & Identity</div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Full Name</label>
              <input className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email</label>
                <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone</label>
                <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Location</label>
              <input className={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>GitHub Profile</label>
                <input className={styles.input} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>LinkedIn Profile</label>
                <input className={styles.input} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Professional Summary</div>
            </div>
            <textarea
              className={styles.textarea}
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Work Experience & Research</div>
            </div>
            {experienceList.map((exp, expIdx) => (
              <div key={expIdx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Role Title</label>
                    <input
                      className={styles.input}
                      value={exp.role}
                      onChange={(e) => {
                        const next = [...experienceList];
                        next[expIdx].role = e.target.value;
                        setExperienceList(next);
                      }}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Company / Lab</label>
                    <input
                      className={styles.input}
                      value={exp.company}
                      onChange={(e) => {
                        const next = [...experienceList];
                        next[expIdx].company = e.target.value;
                        setExperienceList(next);
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label className={styles.inputLabel}>Bullet Points & Achievements</label>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <input
                        className={styles.input}
                        value={b}
                        onChange={(e) => {
                          const next = [...experienceList];
                          next[expIdx].bullets[bIdx] = e.target.value;
                          setExperienceList(next);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteBullet(expIdx, bIdx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleAddBullet(expIdx)}
                    style={{ fontSize: '11px', marginTop: '4px' }}
                  >
                    + ADD ACHIEVEMENT BULLET
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Connection F: ATS-Injected Evidence Bullets Pending Review */}
          {injectedBullets && injectedBullets.filter((b) => !b.accepted).length > 0 && (
            <div className={styles.sectionCard} style={{ borderLeft: '3px solid var(--blue)' }}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle} style={{ color: 'var(--blue)' }}>
                  📋 ATS Evidence Bullets — Pending Review ({injectedBullets.filter((b) => !b.accepted).length})
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                These structured achievement bullets were generated from your ATS Keyword Matcher injections. Accept to insert into your resume, or dismiss.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {injectedBullets.filter((b) => !b.accepted).map((bullet) => (
                  <div
                    key={bullet.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--blue)',
                          background: 'rgba(96, 165, 250, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          border: '1px solid rgba(96, 165, 250, 0.3)',
                          fontWeight: 700,
                        }}>
                          {bullet.keyword}
                        </span>
                        {bullet.projectEvidence && (
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            from {bullet.projectEvidence}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptInjectedBullet(bullet)}
                          style={{ fontSize: '10.5px', padding: '3px 10px' }}
                        >
                          ✓ ACCEPT & INSERT
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => dismissInjectedBullet(bullet.id)}
                          style={{ fontSize: '10.5px', padding: '3px 8px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.55 }}>
                      {bullet.bulletText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Clean Printable Paper Preview */}
        <div className={styles.previewSticky}>
          <div className={styles.paperWrapper} id="resume-paper">
            <div className={styles.paperHeader}>
              <h1 className={styles.paperName}>{fullName}</h1>
              <div className={styles.paperContact}>
                <span>{email}</span> • <span>{phone}</span> • <span>{location}</span>
                <br />
                <span>{githubUrl}</span> • <span>{linkedinUrl}</span>
              </div>
            </div>

            {summary && (
              <div className={styles.paperSection}>
                <div className={styles.paperSectionHeading}>Professional Summary</div>
                <p className={styles.paperSummary}>{summary}</p>
              </div>
            )}

            <div className={styles.paperSection}>
              <div className={styles.paperSectionHeading}>Technical Competencies</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Verified Skills:</strong> {liveSkills.map((s) => s.name).join(' • ')}
              </div>
            </div>

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

            <div className={styles.paperSection}>
              <div className={styles.paperSectionHeading}>Key Technical Projects & Artifacts</div>
              {liveProjects.map((p, idx) => (
                <div key={idx} className={styles.paperEntry}>
                  <div className={styles.paperEntryHeader}>
                    <span className={styles.paperEntryTitle}>{p.name}</span>
                    <span className={styles.paperEntryDates}>Verified Codebase</span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    {p.description}
                  </p>
                </div>
              ))}
            </div>

            <div className={styles.paperSection}>
              <div className={styles.paperSectionHeading}>Education</div>
              {educationList.map((edu, idx) => (
                <div key={idx} className={styles.paperEntry}>
                  <div className={styles.paperEntryHeader}>
                    <div>
                      <span className={styles.paperEntryTitle}>{edu.institution}</span> — <span className={styles.paperEntrySubtitle}>{edu.degree}</span>
                    </div>
                    <div className={styles.paperEntryDates}>{edu.dates}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GPA: {edu.gpa} • Coursework: {edu.coursework}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
