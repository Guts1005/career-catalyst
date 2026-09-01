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
  const [injectedBullets, setInjectedBullets] = useState([]);
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

  // Bidirectional ATS Proof Injector: Upgrades skill evidence, links to resume, and generates structured bullet
  const injectATSProof = useCallback((skillName, projectName) => {
    // Generate a structured STAR achievement bullet for resume injection (Connection F)
    const BULLET_TEMPLATES = {
      'PyTorch': `Engineered high-throughput PyTorch model training pipelines with mixed-precision (AMP) optimization, reducing GPU memory consumption by 38% across distributed training clusters.`,
      'CUDA': `Developed custom CUDA kernels for attention mechanism optimization, achieving 2.3× throughput improvement over baseline implementations on H100 GPUs.`,
      'FlashAttention': `Implemented FlashAttention-2 online softmax tiling with custom SRAM management, reducing KV-cache memory demand by 45% on multi-GPU inference clusters.`,
      'Triton': `Architected custom Triton GPU kernel pipelines for fused attention and MLP operations, eliminating shared memory bank conflicts and achieving sub-15ms P99 serving latency.`,
      'DeepSpeed': `Scaled distributed model training with DeepSpeed ZeRO-3 optimizer partitioning across 64-GPU clusters, reducing memory footprint by 8× while maintaining linear throughput scaling.`,
      'RLHF': `Implemented end-to-end RLHF alignment pipeline with reward model training, PPO optimization loops, and safety guardrail evaluation achieving 94% harmlessness scores.`,
      'DPO': `Designed Direct Preference Optimization (DPO) training pipeline eliminating reward model dependency, reducing alignment compute cost by 60% while maintaining preference accuracy.`,
      'vLLM': `Deployed production vLLM serving infrastructure with PagedAttention and continuous batching, sustaining 4,800 req/sec with P99 latency < 15ms under peak load.`,
      'Kubernetes': `Orchestrated auto-scaling ML inference clusters on Kubernetes with custom HPA policies, achieving 99.95% uptime and sub-second cold-start container initialization.`,
      'NCCL': `Optimized NCCL All-Reduce communication topology across multi-node GPU clusters, reducing gradient synchronization overhead by 35% with ring-based collective operations.`,
      'Docker': `Containerized distributed ML training and inference workloads with Docker multi-stage builds, reducing image size by 62% and deployment cycle time by 4×.`,
      'TensorRT-LLM': `Integrated TensorRT-LLM with FP8/INT8 quantization for production LLM serving, achieving 3.1× inference speedup with < 0.5% accuracy degradation.`,
      'FAISS': `Built production vector similarity search infrastructure using FAISS IVF-PQ indexing, serving 50M+ embeddings with sub-5ms query latency at 99th percentile.`,
      'Kafka': `Engineered real-time ML feature pipelines with Apache Kafka streaming, processing 2M+ events/sec with exactly-once semantics and end-to-end latency < 200ms.`,
      'Ray': `Scaled distributed hyperparameter optimization with Ray Tune across 32-node clusters, reducing model selection time by 8× with early stopping and population-based training.`,
    };

    const bulletText = BULLET_TEMPLATES[skillName] ||
      `Demonstrated proven competency in ${skillName}${projectName ? ` through verified work on "${projectName}"` : ''}, contributing to production system reliability and engineering velocity.`;

    // Store the injected bullet for Resume Canvas consumption
    setInjectedBullets((prev) => {
      // Avoid duplicates
      if (prev.some((b) => b.keyword === skillName)) return prev;
      return [...prev, {
        id: `ats-${Date.now()}-${skillName.replace(/\s+/g, '-').toLowerCase()}`,
        keyword: skillName,
        projectEvidence: projectName || null,
        bulletText,
        injectedAt: new Date().toISOString(),
        accepted: false,
      }];
    });

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
        customReason: `Injected verified project evidence from "${projectName}" into ATS keyword proof canvas. Resume bullet generated for Review.`,
      });

      if (deltaResult.isSignificant) {
        showReadinessFeedback(deltaResult);
      } else {
        showToast(`Injected "${skillName}" — resume bullet ready for review in Resume Canvas!`, 'success');
      }

      return next;
    });
  }, [targetRole, projects, jobs, resumeData, certifications, solvedProblems]);

  // Accept or dismiss an injected bullet (Connection F)
  const acceptInjectedBullet = useCallback((bulletId) => {
    setInjectedBullets((prev) => prev.map((b) => b.id === bulletId ? { ...b, accepted: true } : b));
  }, []);

  const dismissInjectedBullet = useCallback((bulletId) => {
    setInjectedBullets((prev) => prev.filter((b) => b.id !== bulletId));
  }, []);

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

  // Calculated Active Interview Applications (Connection C)
  const activeInterviews = useMemo(() => {
    return (jobs || []).filter((j) => ['interview', 'final', 'oa', 'technical'].includes(j.status));
  }, [jobs]);

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
    activeInterviews,
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
    injectedBullets,
    acceptInjectedBullet,
    dismissInjectedBullet,
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
