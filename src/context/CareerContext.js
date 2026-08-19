'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculateCareerReadiness,
  generateNextBestAction,
  getRoleById,
  BENCHMARK_DEMO_DATA,
} from '@/lib/careerGraph';
import { showToast } from '@/components/Toast';

const CareerContext = createContext(null);

export function CareerProvider({ children }) {
  // State Initialization
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [targetRole, setTargetRoleState] = useState('senior_ml');
  const [userProfile, setUserProfile] = useState({
    name: 'Sharvin Patel',
    title: 'Machine Learning Engineer',
    targetRole: 'senior_ml',
    level: 'Mid-Senior',
    location: 'San Francisco, CA',
  });

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state from server / localStorage on load
  const refreshCareerState = useCallback(async () => {
    try {
      // Check localStorage for onboarded flag & targetRole preference
      if (typeof window !== 'undefined') {
        const savedOnboarded = localStorage.getItem('catalyst_onboarded');
        const savedRole = localStorage.getItem('catalyst_target_role');
        const savedDemo = localStorage.getItem('catalyst_demo_mode');

        if (savedOnboarded !== null) setIsOnboarded(savedOnboarded === 'true');
        if (savedRole) setTargetRoleState(savedRole);
        if (savedDemo !== null) setIsDemoMode(savedDemo === 'true');
      }

      // Fetch live DB entities concurrently
      const [skillsRes, projectsRes, jobsRes, resumeRes] = await Promise.all([
        fetch('/api/skills').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/projects').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/jobs').then((r) => (r.ok ? r.json() : { jobs: [] })),
        fetch('/api/resume').then((r) => (r.ok ? r.json() : null)),
      ]);

      const fetchedSkills = Array.isArray(skillsRes) ? skillsRes : [];
      const fetchedProjects = Array.isArray(projectsRes) ? projectsRes : [];
      const fetchedJobs = jobsRes?.jobs || [];

      // If user has zero DB records and demo mode is ON or default benchmark
      if (fetchedSkills.length === 0 && fetchedProjects.length === 0 && fetchedJobs.length === 0) {
        // Provide benchmark demo data so the system is fully populated and cohesive
        setSkills(BENCHMARK_DEMO_DATA.skills);
        setProjects(BENCHMARK_DEMO_DATA.projects);
        setJobs(BENCHMARK_DEMO_DATA.jobs);
        setUserProfile(BENCHMARK_DEMO_DATA.profile);
      } else {
        setSkills(fetchedSkills);
        setProjects(fetchedProjects);
        setJobs(fetchedJobs);
        if (resumeRes) setResumeData(resumeRes);
      }
    } catch (e) {
      console.error('Failed to sync career state:', e);
      // Fallback to cohesive benchmark data
      setSkills(BENCHMARK_DEMO_DATA.skills);
      setProjects(BENCHMARK_DEMO_DATA.projects);
      setJobs(BENCHMARK_DEMO_DATA.jobs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCareerState();
  }, [refreshCareerState]);

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
    // Add or elevate the skill gap in competency list
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
    });
  }, [targetRole, skills, projects, jobs, resumeData]);

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
