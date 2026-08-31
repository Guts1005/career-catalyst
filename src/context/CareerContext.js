'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateCareerReadiness,
  generateNextBestAction,
  getRoleById,
  DEMO_PERSONAS,
  BENCHMARK_DEMO_DATA,
} from '@/lib/careerGraph';
import { evaluateStateDelta } from '@/lib/readinessDeltaEngine';
import { showToast, showReadinessFeedback } from '@/components/Toast';

const CareerContext = createContext(null);

export function CareerProvider({ children }) {
  // State Initialization
  const [activePersonaId, setActivePersonaId] = useState('sharvin_ml');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [targetRole, setTargetRoleState] = useState('senior_ml');
  const [userProfile, setUserProfile] = useState(BENCHMARK_DEMO_DATA.profile);

  const [skills, setSkills] = useState(BENCHMARK_DEMO_DATA.skills);
  const [projects, setProjects] = useState(BENCHMARK_DEMO_DATA.projects);
  const [jobs, setJobs] = useState(BENCHMARK_DEMO_DATA.jobs);
  const [certifications, setCertifications] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [resources, setResources] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state from server / localStorage on load
  const refreshCareerState = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        const savedOnboarded = localStorage.getItem('catalyst_onboarded');
        const savedRole = localStorage.getItem('catalyst_target_role');
        const savedDemo = localStorage.getItem('catalyst_demo_mode');
        const savedPersona = localStorage.getItem('catalyst_persona_id');

        if (savedOnboarded !== null) setIsOnboarded(savedOnboarded === 'true');
        if (savedRole) setTargetRoleState(savedRole);
        if (savedDemo !== null) setIsDemoMode(savedDemo === 'true');
        if (savedPersona) {
          const found = DEMO_PERSONAS.find((p) => p.id === savedPersona);
          if (found) {
            setActivePersonaId(savedPersona);
            setSkills(found.skills);
            setProjects(found.projects);
            setJobs(found.jobs);
            setUserProfile(found.profile);
          }
        }
      }

      // Fetch live DB entities concurrently
      const [skillsRes, projectsRes, jobsRes, resumeRes, certsRes, resourcesRes] = await Promise.all([
        fetch('/api/skills').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/projects').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/jobs').then((r) => (r.ok ? r.json() : { jobs: [] })),
        fetch('/api/resume').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/certifications').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/resources').then((r) => (r.ok ? r.json() : [])),
      ]);

      const fetchedSkills = Array.isArray(skillsRes) ? skillsRes : [];
      const fetchedProjects = Array.isArray(projectsRes) ? projectsRes : [];
      const fetchedJobs = jobsRes?.jobs || [];
      const fetchedCerts = Array.isArray(certsRes) ? certsRes : [];
      const fetchedResources = Array.isArray(resourcesRes) ? resourcesRes : [];

      if (fetchedCerts.length > 0) setCertifications(fetchedCerts);
      if (fetchedResources.length > 0) setResources(fetchedResources);

      // If user has database records, use them
      if (fetchedSkills.length > 0 || fetchedProjects.length > 0 || fetchedJobs.length > 0) {
        setSkills(fetchedSkills);
        setProjects(fetchedProjects);
        setJobs(fetchedJobs);
        if (resumeRes) setResumeData(resumeRes);
      }
    } catch (e) {
      console.error('Failed to sync career state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCareerState();
  }, [refreshCareerState]);

  // Switch Active Candidate Persona with rich sample datasets
  const selectPersona = useCallback((personaId) => {
    const found = DEMO_PERSONAS.find((p) => p.id === personaId) || DEMO_PERSONAS[0];
    setActivePersonaId(found.id);
    setUserProfile(found.profile);
    setTargetRoleState(found.profile.targetRole);
    setSkills(found.skills);
    setProjects(found.projects);
    setJobs(found.jobs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalyst_persona_id', found.id);
      localStorage.setItem('catalyst_target_role', found.profile.targetRole);
    }
    showToast(`Persona Calibrated: ${found.personaName} (${found.badge})`, 'success');
  }, []);

  // Synchronize a newly earned/updated Certification
  const syncCertification = useCallback((cert) => {
    setCertifications((prev) => {
      const idx = prev.findIndex((c) => c.id === cert.id);
      const next = idx >= 0 ? [...prev] : [cert, ...prev];
      if (idx >= 0) next[idx] = cert;

      const prevState = { targetRole, skills, projects, jobs, resumeData, certifications: prev, assessments: solvedProblems };
      const nextState = { ...prevState, certifications: next };

      const deltaResult = evaluateStateDelta(prevState, nextState, {
        actionType: 'CERTIFICATION_VERIFIED',
        entityName: cert.name || 'Accredited Credential',
        customReason: `Verified ${cert.issuer || 'cloud'} credential added bonus evidence to Pipeline & Interview Readiness.`,
      });

      if (deltaResult.isSignificant) {
        showReadinessFeedback(deltaResult);
      } else {
        showToast(`Certification Synced: ${cert.name}`, 'success');
      }

      return next;
    });
  }, [targetRole, skills, projects, jobs, resumeData, solvedProblems]);

  // Synchronize a Solved Algorithmic Problem
  const syncSolvedProblem = useCallback((problem) => {
    setSolvedProblems((prev) => {
      const idx = prev.findIndex((p) => p.id === problem.id);
      const nextSolved = idx >= 0 ? [...prev] : [problem, ...prev];
      if (idx >= 0) nextSolved[idx] = problem;

      // Update matching skill to VERIFIED evidence tier
      const prevSkills = skills;
      const nextSkills = prevSkills.map((s) => {
        const probTitle = (problem.title || '').toLowerCase();
        const probCat = (problem.category || '').toLowerCase();
        const sName = (s.name || '').toLowerCase();

        if (probTitle.includes(sName) || sName.includes(probTitle) || sName.includes(probCat)) {
          return {
            ...s,
            current_level: Math.min((s.current_level || 60) + 4, 100),
            evidence_level: 'VERIFIED',
          };
        }
        return s;
      });

      const prevState = { targetRole, skills: prevSkills, projects, jobs, resumeData, certifications, assessments: prev };
      const nextState = { ...prevState, skills: nextSkills, assessments: nextSolved };

      const deltaResult = evaluateStateDelta(prevState, nextState, {
        actionType: 'ALGORITHM_VERIFIED',
        entityName: problem.title || 'Technical Problem',
        customReason: `Solved systems algorithm verified code execution and upgraded competency tier.`,
      });

      setSkills(nextSkills);

      if (deltaResult.isSignificant) {
        showReadinessFeedback(deltaResult);
      } else {
        showToast(`Algorithm Solved: ${problem.title || 'Problem'} (+Readiness)`, 'success');
      }

      return nextSolved;
    });
  }, [targetRole, skills, projects, jobs, resumeData, certifications]);

  // Synchronize a Read Resource or Paper
  const syncResource = useCallback((resource) => {
    setResources((prev) => {
      const idx = prev.findIndex((r) => r.id === resource.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = resource;
        return next;
      }
      return [resource, ...prev];
    });
  }, []);

  // Bidirectional ATS Proof Injector: Upgrades skill evidence and links to resume
  const injectATSProof = useCallback((skillName, projectName) => {
    setSkills((prev) => {
      const next = prev.map((s) => {
        if (s.name.toLowerCase() === skillName.toLowerCase()) {
          return {
            ...s,
            current_level: Math.max(s.current_level || 0, 88),
            evidence_level: 'VERIFIED',
          };
        }
        return s;
      });

      const prevState = { targetRole, skills: prev, projects, jobs, resumeData, certifications, assessments: solvedProblems };
      const nextState = { ...prevState, skills: next };

      const deltaResult = evaluateStateDelta(prevState, nextState, {
        actionType: 'ATS_PROOF_INJECTED',
        entityName: `${skillName} from ${projectName}`,
        customReason: `Injected verified project evidence from "${projectName}" into ATS keyword proof canvas.`,
      });

      if (deltaResult.isSignificant) {
        showReadinessFeedback(deltaResult);
      } else {
        showToast(`Injected verified evidence for "${skillName}"!`, 'success');
      }

      return next;
    });
  }, [targetRole, projects, jobs, resumeData, certifications, solvedProblems]);

  // Set & Propagate Target Role
  const setTargetRole = useCallback((roleId) => {
    setTargetRoleState(roleId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalyst_target_role', roleId);
    }
    const roleDef = getRoleById(roleId);
    setUserProfile((prev) => ({ ...prev, targetRole: roleId, title: roleDef.title }));
    showToast(`Career OS Calibrated to ${roleDef.title}`, 'info');
  }, []);

  // Toggle Demo Mode vs Live Authentic Mode
  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('catalyst_demo_mode', String(next));
      }
      showToast(next ? 'Demo Benchmark Profile Activated' : 'Authentic User Mode Activated', 'info');
      return next;
    });
  }, []);

  // Complete Onboarding Wizard
  const completeOnboarding = useCallback((onboardingData) => {
    setIsOnboarded(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalyst_onboarded', 'true');
    }
    if (onboardingData.targetRole) {
      setTargetRole(onboardingData.targetRole);
    }
    if (onboardingData.name) {
      setUserProfile((prev) => ({
        ...prev,
        name: onboardingData.name,
        level: onboardingData.level || prev.level,
      }));
    }
    if (onboardingData.skills && onboardingData.skills.length > 0) {
      setSkills((prev) => [
        ...prev,
        ...onboardingData.skills.map((s, idx) => ({
          id: `onboard_${Date.now()}_${idx}`,
          name: s,
          category: 'Core Competency',
          current_level: 70,
          target_level: 90,
          evidence_level: 'SELF-REPORTED',
        })),
      ]);
    }
    showToast('Career Profile Initialized & Calibrated!', 'success');
  }, [setTargetRole]);

  // Log Rejection Feedback Loop (Converts Rejections into Priority Skill Gaps)
  const logRejectionFeedback = useCallback((jobId, company, reasonTopic) => {
    if (!reasonTopic) return;
    setSkills((prev) => {
      const existing = prev.find((s) => s.name.toLowerCase() === reasonTopic.toLowerCase());
      if (existing) {
        return prev.map((s) =>
          s.id === existing.id
            ? { ...s, importance: 'high', target_level: Math.max(s.target_level, 95) }
            : s
        );
      } else {
        return [
          ...prev,
          {
            id: `gap_${Date.now()}`,
            name: reasonTopic,
            category: 'Interview Feedback Gap',
            current_level: 40,
            target_level: 90,
            importance: 'high',
            evidence_level: 'CLAIM',
          },
        ];
      }
    });
    showToast(`Feedback recorded from ${company}: Prioritizing "${reasonTopic}" in Skill Gap Map!`, 'info');
  }, []);

  // Calculated Unified Readiness Telemetry
  const readiness = useMemo(() => {
    return calculateCareerReadiness({
      targetRole,
      skills,
      projects,
      jobs,
      resumeData,
      certifications,
      assessments: solvedProblems,
    });
  }, [targetRole, skills, projects, jobs, resumeData, certifications, solvedProblems]);

  // Calculated Next Best Action
  const nextBestAction = useMemo(() => {
    return generateNextBestAction({
      targetRole,
      skills,
      projects,
      jobs,
      readiness,
    });
  }, [targetRole, skills, projects, jobs, readiness]);

  const value = {
    activePersonaId,
    selectPersona,
    demoPersonas: DEMO_PERSONAS,
    isDemoMode,
    toggleDemoMode,
    isOnboarded,
    setIsOnboarded,
    completeOnboarding,
    userProfile,
    setUserProfile,
    targetRole,
    setTargetRole,
    skills,
    setSkills,
    projects,
    setProjects,
    jobs,
    setJobs,
    certifications,
    setCertifications,
    syncCertification,
    solvedProblems,
    setSolvedProblems,
    syncSolvedProblem,
    resources,
    setResources,
    syncResource,
    injectATSProof,
    resumeData,
    setResumeData,
    readiness,
    nextBestAction,
    logRejectionFeedback,
    refreshCareerState,
    loading,
  };

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
}
