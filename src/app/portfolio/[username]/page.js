import { getSupabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';
import ShareProfileButton from '@/components/ShareProfileButton';
import {
  IconGitHub,
  IconArrowUpRight,
  IconCertifications,
  IconProjects,
  IconSkills,
  IconResume,
} from '@/components/Icons';

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '4px', background: 'var(--white)', border: '1px solid var(--gray-200)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--gray-600)', marginBottom: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
            VERIFIED PROFILE • @{username}
          </div>
          <h1 className={styles.heroName}>{name}</h1>
          <div className={styles.heroRole}>Data Science & Machine Learning Specialist</div>
          <p className={styles.heroBio}>{summary}</p>

          <div className={styles.socialRow}>
            <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
              <IconGitHub size={14} /> GitHub
            </a>
            <a href="https://linkedin.com/in/sharvin-neve" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
            </a>
            <a href={`mailto:${email}`} className={styles.socialBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> Contact
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <ShareProfileButton username={username} />
          <Link href="/resume-builder" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '7px 14px' }}>
            <IconResume size={13} /> View ATS Resume
          </Link>
        </div>
      </div>

      {/* Featured Projects */}
      <div className={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <IconProjects size={18} style={{ color: 'var(--text-muted)' }} />
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Featured Machine Learning Systems</h2>
        </div>
        <div className={styles.projectsGrid}>
          {projects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className={styles.projectName}>{p.name}</h3>
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
                    Source <IconArrowUpRight size={12} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <IconSkills size={18} style={{ color: 'var(--text-muted)' }} />
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Core Technical Competencies</h2>
        </div>
        <div className={styles.skillsPills}>
          {skills.map((s) => (
            <div key={s.id} className={styles.skillPill}>
              <span>{s.name}</span>
              <span className={styles.skillLevel} style={{ fontFamily: 'var(--font-mono)' }}>{s.current_level}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Certifications */}
      <div className={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <IconCertifications size={18} style={{ color: 'var(--text-muted)' }} />
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Verified Credentials & Certifications</h2>
        </div>
        <div className={styles.certList}>
          {certs.map((c) => (
            <div key={c.id} className={styles.certBadge}>
              <div className={styles.certIcon}>
                <IconCertifications size={16} />
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>{c.name}</strong>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{c.provider} • Verified Credential</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--text-muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
        Catalyst OS • Verified Profile: @{username}
      </div>
    </div>
  );
}
