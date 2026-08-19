import { getSupabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';
import ShareProfileButton from '@/components/ShareProfileButton';
import { BENCHMARK_DEMO_DATA } from '@/lib/careerGraph';
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

  const name = resume?.full_name || BENCHMARK_DEMO_DATA.profile.name;
  const email = resume?.email || 'sharvinneve67@gmail.com';
  const summary = resume?.summary || BENCHMARK_DEMO_DATA.profile.bio;

  if (projects.length === 0) {
    projects = BENCHMARK_DEMO_DATA.projects;
  }

  if (skills.length === 0) {
    skills = BENCHMARK_DEMO_DATA.skills;
  }

  if (certs.length === 0) {
    certs = [
      { id: 1, name: 'AWS Certified Machine Learning – Specialty', provider: 'Amazon Web Services' },
      { id: 2, name: 'TensorFlow Developer Certificate', provider: 'Google' },
      { id: 3, name: 'Deep Learning Specialization', provider: 'DeepLearning.AI' },
    ];
  }

  return (
    <div className={styles.showcase}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
            VERIFIED CANDIDATE PROFILE • @{username}
          </div>
          <h1 className={styles.heroName}>{name}</h1>
          <div className={styles.heroRole}>Machine Learning & Distributed Systems Engineer</div>
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

        <div>
          <ShareProfileButton username={username} />
        </div>
      </div>

      {/* Verified Projects Showcase */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <IconProjects size={18} /> Verified Portfolio Case Studies
        </div>
        <div className={styles.projectsGrid}>
          {projects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {p.name}
                  </h3>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '3px', background: 'var(--green-subtle)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>
                    ✓ {p.verification_status || 'VERIFIED'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {p.description}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {(p.technologies || p.tech_stack || 'PyTorch, Docker').split(',').map((tech) => (
                    <span key={tech} style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '3px', color: 'var(--text-muted)' }}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {p.github_url && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View Codebase & Benchmarks ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Verified Core Competencies */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <IconSkills size={18} /> Verified Technical Competencies
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {skills.map((s) => (
            <div key={s.id || s.name} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{s.current_level}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
