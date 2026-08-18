'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function AtsCheckerPage() {
  const [content, setContent] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/ats-checker');
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ats-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, jd })
      });
      const data = await res.json();
      setResult({
        ...data,
        keyword_matches: JSON.parse(data.keyword_matches || '[]'),
        missing_keywords: JSON.parse(data.missing_keywords || '[]'),
        format_issues: JSON.parse(data.format_issues || '[]')
      });
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setContent(item.content);
    setResult({
      ...item,
      keyword_matches: JSON.parse(item.keyword_matches || '[]'),
      missing_keywords: JSON.parse(item.missing_keywords || '[]'),
      format_issues: JSON.parse(item.format_issues || '[]')
    });
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG Gauge calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result 
    ? circumference - (result.score / 100) * circumference 
    : circumference;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>ATS Resume Checker</h1>
        <p>Analyze your resume against AI/ML job requirements and optimize for Applicant Tracking Systems.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.inputSection}>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0 }}>Paste Your Resume</h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                  onClick={() => setContent(`Sharvin Neve
sharvinneve67@gmail.com | +1 (555) 342-8901 | San Francisco, CA | github.com/Guts1005 | linkedin.com/in/sharvin-neve

PROFESSIONAL SUMMARY
Results-driven Machine Learning Engineer with 2+ years experience building production deep learning pipelines, transformer architectures, and scalable cloud ML deployments. Proficient in PyTorch, TensorFlow, MLOps, and vector search systems.

EDUCATION
B.S. in Computer Science & Data Science - University of Technology (GPA: 3.85/4.00, Expected May 2026)
Coursework: Machine Learning, Deep Learning, Distributed Systems, Linear Algebra, Probability & Statistics

TECHNICAL SKILLS
- Languages: Python, SQL, C++, Bash
- ML & Deep Learning: PyTorch, TensorFlow, Scikit-learn, HuggingFace, Keras, OpenCV, spaCy
- Cloud & MLOps: Docker, AWS, GCP, FastAPI, MLflow, Feast, CI/CD, Git

WORK EXPERIENCE & PROJECTS
Machine Learning Research Assistant — AI Lab (Jan 2025 – Present)
- Engineered multi-modal RAG medical synthesis pipeline in PyTorch, boosting retrieval accuracy by 35% and reducing latency by 45%.
- Containerized deep learning inference server using Docker and FastAPI on AWS EC2, maintaining sub-120ms response time.
- Implemented automated data cleaning and feature engineering in Python/Pandas across 500k+ records.

CERTIFICATIONS
- TensorFlow Developer Certificate (Google)
- AWS Certified Machine Learning – Specialty (Amazon)`)}
                >
                  ⚡ Load Sample Resume
                </button>
              </div>
            </div>
            <textarea 
              className={styles.textarea}
              placeholder="Paste your resume text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 8px' }}>
              <h2 style={{ margin: 0 }}>Job Description (Optional)</h2>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() => setJd(`We are looking for a Machine Learning Engineer with strong experience in Python, PyTorch, TensorFlow, and MLOps.
Requirements:
- Strong knowledge of deep learning architectures, CNNs, Transformers, and NLP.
- Experience with Docker, AWS/GCP, FastAPI, and model deployment.
- Proficiency in SQL, feature engineering, and statistical analysis.
- Proven ability to optimize inference latency and handle production data pipelines.`)}
              >
                + Load Sample Job Description
              </button>
            </div>
            <textarea 
              className={styles.textarea}
              style={{ height: '100px' }}
              placeholder="Paste job description to tailor analysis..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
            
            <button 
              className={styles.analyzeBtn}
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        </div>

        <div className={styles.resultsSection}>
          {result ? (
            <div className={styles.card}>
              <div className={styles.scoreHeader}>
                <div className={styles.gaugeContainer}>
                  <svg className={styles.gaugeSvg}>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f8cff" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="75" cy="75" r={radius} 
                      className={styles.gaugeBg} 
                    />
                    <circle 
                      cx="75" cy="75" r={radius} 
                      className={styles.gaugeProgress}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className={styles.scoreText}>
                    {result.score}<span>/100</span>
                  </div>
                </div>
                <div className={styles.feedbackBox}>
                  <p>{result.feedback}</p>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h3 className={styles.sectionTitle}>Keywords Found</h3>
                <div className={styles.badges}>
                  {result.keyword_matches.length > 0 ? (
                    result.keyword_matches.map(kw => (
                      <span key={kw} className={`${styles.badge} ${styles.badgeMatch}`}>{kw}</span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No standard keywords detected.</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 className={styles.sectionTitle}>Missing Keywords</h3>
                <div className={styles.badges}>
                  {result.missing_keywords.length > 0 ? (
                    result.missing_keywords.map(kw => (
                      <span key={kw} className={`${styles.badge} ${styles.badgeMiss}`}>{kw}</span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Great job covering core keywords!</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 className={styles.sectionTitle}>Format & Content Issues</h3>
                {result.format_issues.length > 0 ? (
                  <ul className={styles.issueList}>
                    {result.format_issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--success)' }}>✓ No major format issues detected.</p>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3>No Analysis Yet</h3>
              <p>Paste your resume and click Analyze to see your ATS score.</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Previous Checks</h2>
        {history.length > 0 ? (
          <div className={styles.historyGrid}>
            {history.map(item => (
              <div 
                key={item.id} 
                className={styles.historyCard}
                onClick={() => loadHistoryItem(item)}
              >
                <div className={styles.historyHeader}>
                  <div className={styles.historyScore}>Score: {item.score}</div>
                  <div className={styles.historyDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.historyPreview}>
                  {item.content.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No previous resume checks found.</p>
        )}
      </div>
    </div>
  );
}
