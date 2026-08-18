import { getDb } from '@/lib/db';
import styles from './page.module.css';
import Link from 'next/link';

export default async function PortfolioShowcasePage({ params }) {
  const { username } = await params;
  const db = getDb();

  const resume = db.prepare('SELECT * FROM resumes ORDER BY id DESC LIMIT 1').get();
  const certs = db.prepare("SELECT * FROM certifications WHERE status = 'completed' ORDER BY id ASC").all();
  const projects = db.prepare("SELECT * FROM projects WHERE status = 'completed' OR status = 'in_progress' ORDER BY id DESC").all();
  const skills = db.prepare('SELECT * FROM skills ORDER BY current_level DESC LIMIT 12').all();

  const name = resume?.full_name || 'Sharvin Neve';
  const email = resume?.email || 'sharvinneve67@gmail.com';
  const summary = resume?.summary || 'Machine Learning Engineer with hands-on experience building production deep learning systems, multi-modal RAG architectures, and scalable cloud ML pipelines.';

  return (
    <div className={styles.showcase}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div>
          <span className="tag" style={{ marginBottom: '8px' }}>Verified ML Engineer Portfolio</span>
          <h1 className={styles.heroName}>{name}</h1>
          <div className={styles.heroRole}>Data Science & Machine Learning Specialist</div>
          <p className={styles.heroBio}>{summary}</p>

          <div className={styles.socialRow}>
            <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
              🐙 GitHub
            </a>
            <a href="https://linkedin.com/in/sharvin-neve" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
              💼 LinkedIn
            </a>
            <a href={`mailto:${email}`} className={styles.socialBtn}>
              ✉️ Contact
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Link href="/resume-builder" className="btn btn-primary">
            📄 View Full ATS Resume
          </Link>
        </div>
      </div>

      {/* Featured Projects */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🚀 Featured Machine Learning Systems</h2>
        <div className={styles.projectsGrid}>
          {projects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className={styles.projectName}>{p.name}</h3>
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px' }}>
                    Code ↗
                  </a>
                )}
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {p.description}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <strong>Stack:</strong> {p.tech_stack}
              </div>
              {p.impact && (
                <div className={styles.projectImpact}>
                  🎯 {p.impact}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Core Competencies */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🎯 Core Technical Competencies</h2>
        <div className={styles.skillsPills}>
          {skills.map((s) => (
            <div key={s.id} className={styles.skillPill}>
              <span>{s.name}</span>
              <span className={styles.skillLevel}>{s.current_level}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Certifications */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🏆 Verified Credentials & Certifications</h2>
        <div className={styles.certList}>
          {certs.map((c) => (
            <div key={c.id} className={styles.certBadge}>
              <div className={styles.certIcon}>🏆</div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{c.name}</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.provider} • Verified Credential</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--text-muted)', fontSize: '12px' }}>
        ⚡ Powered by Career Catalyst OS • Verified Profile: @{username}
      </div>
    </div>
  );
}
