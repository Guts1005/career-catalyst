import { getSupabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';

export default async function PortfolioShowcasePage({ params }) {
  const { username } = await params;
  let resume = null;
  let certs = [];
  let projects = [];
  let skills = [];

  try {
    const supabase = getSupabase();
    const [resumeRes, certsRes, projRes, skillsRes] = await Promise.all([
      supabase.from('resumes').select('*').order('id', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('certifications').select('*').order('id', { ascending: true }),
      supabase.from('projects').select('*').order('id', { ascending: false }),
      supabase.from('skills').select('*').order('current_level', { ascending: false }).limit(12),
    ]);

    resume = resumeRes.data;
    certs = certsRes.data || [];
    projects = projRes.data || [];
    skills = skillsRes.data || [];
  } catch {
    // Graceful fallback to default profile
  }

  const name = resume?.full_name || 'Sharvin Neve';
  const email = resume?.email || 'sharvinneve67@gmail.com';
  const summary = resume?.summary || 'Machine Learning Engineer with hands-on experience building production deep learning systems, multi-modal RAG architectures, and scalable cloud ML pipelines.';

  // Fallback defaults if database was empty
  if (certs.length === 0) {
    certs = [
      { id: 1, name: 'AWS Certified Machine Learning – Specialty', provider: 'Amazon' },
      { id: 2, name: 'TensorFlow Developer Certificate', provider: 'Google' },
      { id: 3, name: 'Google Cloud Professional ML Engineer', provider: 'Google Cloud' },
      { id: 4, name: 'Deep Learning Specialization', provider: 'DeepLearning.AI' },
    ];
  }

  if (skills.length === 0) {
    skills = [
      { id: 1, name: 'Python', current_level: 90 },
      { id: 2, name: 'PyTorch', current_level: 85 },
      { id: 3, name: 'SQL', current_level: 80 },
      { id: 4, name: 'Transformers & LLMs', current_level: 85 },
      { id: 5, name: 'Scikit-learn', current_level: 85 },
      { id: 6, name: 'Docker & MLOps', current_level: 75 },
    ];
  }

  if (projects.length === 0) {
    projects = [
      {
        id: 1,
        name: 'Enterprise Multi-Modal RAG Engine',
        description: 'Engineered hybrid dense-sparse vector search using LangChain, FAISS, and BM25 with cross-encoder re-ranking.',
        tech_stack: 'Python, PyTorch, LangChain, FAISS, FastAPI, Docker',
        impact: '45% reduction in query latency, 94.2% retrieval accuracy',
        github_url: 'https://github.com/Guts1005',
      },
    ];
  }

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
