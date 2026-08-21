'use client';

import { useState } from 'react';
import styles from './OnboardingModal.module.css';
import { useCareer } from '@/context/CareerContext';
import { CAREER_TRACKS, getRoleById } from '@/lib/careerGraph';

const POPULAR_SKILLS = [
  'Python',
  'PyTorch',
  'SQL',
  'Docker',
  'FastAPI',
  'Machine Learning',
  'Distributed Systems',
  'Vector Search',
  'Kubernetes',
  'Git',
  'MLOps',
  'Spark',
];

export default function OnboardingModal({ isOpen, onClose }) {
  const { completeOnboarding } = useCareer();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('Sharvin Neve');
  const [targetRole, setTargetRole] = useState('senior_ml');
  const [experienceLevel, setExperienceLevel] = useState('Early Career');
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'Machine Learning']);
  const [customSkill, setCustomSkill] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  if (!isOpen) return null;

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      name,
      targetRole,
      level: experienceLevel,
      skills: selectedSkills,
      githubUsername,
    });
    if (onClose) onClose();
  };

  const selectedRoleDef = getRoleById(targetRole);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Progress Header */}
        <div className={styles.header}>
          <div className={styles.stepBadge}>
            STEP 0{step} OF 03 • ONBOARDING CALIBRATION
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Career Track & Goal */}
        {step === 1 && (
          <div className={styles.body}>
            <h2 className={styles.title}>WHAT ARE YOU WORKING TOWARD?</h2>
            <p className={styles.subtitle}>
              Catalyst OS tailors its competency radar, project recommendations, and interview prep to your target role.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>YOUR NAME</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CURRENT STAGE</label>
              <div className={styles.pillGrid}>
                {['Student', 'Fresh Graduate', 'Early Career', 'Experienced', 'Career Switcher'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`${styles.selectPill} ${experienceLevel === lvl ? styles.selectPillActive : ''}`}
                    onClick={() => setExperienceLevel(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>TARGET TECHNICAL ROLE</label>
              <div className={styles.roleGrid}>
                {CAREER_TRACKS.flatMap((t) => t.roles).map((role) => (
                  <div
                    key={role.id}
                    className={`${styles.roleCard} ${targetRole === role.id ? styles.roleCardActive : ''}`}
                    onClick={() => setTargetRole(role.id)}
                  >
                    <div className={styles.roleCardTop}>
                      <span className={styles.roleTitle}>{role.title}</span>
                      <span className={styles.roleLevel}>{role.level}</span>
                    </div>
                    <p className={styles.roleDesc}>{role.description}</p>
                    <div className={styles.roleComp}>{role.targetComp}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(2)}
                style={{ width: '100%', minHeight: '46px' }}
              >
                CONTINUE TO SKILL CHECK →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Current Competency Check */}
        {step === 2 && (
          <div className={styles.body}>
            <h2 className={styles.title}>SELECT YOUR CURRENT SKILLS</h2>
            <p className={styles.subtitle}>
              Choose what you already know. Catalyst will compare this against <strong>{selectedRoleDef.title}</strong> requirements to identify your high-ROI gaps.
            </p>

            <div className={styles.pillGrid} style={{ marginTop: '16px' }}>
              {POPULAR_SKILLS.map((sk) => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    className={`${styles.selectPill} ${isSelected ? styles.selectPillActive : ''}`}
                    onClick={() => toggleSkill(sk)}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sk}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <input
                type="text"
                className="input"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom skill (e.g. Triton, Ray, MLflow)..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-secondary">
                ADD
              </button>
            </form>

            <div className={styles.footer} style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1, minHeight: '46px' }}
              >
                ← BACK
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(3)}
                style={{ flex: 2, minHeight: '46px' }}
              >
                CONTINUE TO PROOF & SYNC →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Evidence & Initial Diagnosis */}
        {step === 3 && (
          <div className={styles.body}>
            <h2 className={styles.title}>LINK EXISTING EVIDENCE</h2>
            <p className={styles.subtitle}>
              Connect your GitHub or start clean. Catalyst will generate your initial Career Readiness Diagnostic immediately.
            </p>

            <div className={styles.formGroup} style={{ marginTop: '16px' }}>
              <label className={styles.label}>GITHUB USERNAME (OPTIONAL)</label>
              <input
                type="text"
                className="input"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. Guts1005"
              />
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryTitle}>INITIAL CALIBRATION PREVIEW</div>
              <div className={styles.summaryItem}>
                <span>Target Role:</span>
                <strong>{selectedRoleDef.title}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Baseline Skills Claimed:</span>
                <strong>{selectedSkills.length} competencies</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Target Requirements:</span>
                <strong>{selectedRoleDef.requiredSkills.length} core benchmarks</strong>
              </div>
            </div>

            <div className={styles.footer} style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(2)}
                style={{ flex: 1, minHeight: '46px' }}
              >
                ← BACK
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinish}
                style={{ flex: 2, minHeight: '46px' }}
              >
                INITIALIZE CAREER OS ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
