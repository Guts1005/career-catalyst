/**
 * Centralized Semantic Four-Phase Navigation Configuration
 * Defines the canonical 4 career phases and secondary showcase areas.
 */

import {
  IconDashboard,
  IconAnalytics,
  IconResume,
  IconCoverLetter,
  IconJobs,
  IconInterview,
  IconAssessment,
  IconCertifications,
  IconProjects,
  IconBlueprints,
  IconCoding,
  IconSandbox,
  IconSkills,
  IconResources,
  IconSalary,
  IconATS,
  IconGitHub,
  IconPortfolio,
} from '@/components/Icons';

export const NAVIGATION_PHASES = [
  {
    id: 'command-center',
    phaseNumber: '01',
    title: 'COMMAND CENTER',
    purpose: 'Understand where you currently stand',
    items: [
      { href: '/', label: 'Executive Overview', shortLabel: 'Overview', icon: IconDashboard },
      { href: '/analytics', label: 'Career Analytics', shortLabel: 'Analytics', icon: IconAnalytics },
    ],
  },
  {
    id: 'build-proof',
    phaseNumber: '02',
    title: 'BUILD PROOF',
    purpose: 'Build and validate technical evidence',
    items: [
      { href: '/projects', label: 'Portfolio Projects', shortLabel: 'Projects', icon: IconProjects },
      { href: '/skills', label: 'Competency Matrix', shortLabel: 'Skills', icon: IconSkills },
      { href: '/coding-tracker', label: 'Systems Coding', shortLabel: 'Coding', icon: IconCoding },
      { href: '/certifications', label: 'Certifications', shortLabel: 'Certs', icon: IconCertifications },
      { href: '/resources', label: 'Research Library', shortLabel: 'Papers', icon: IconResources },
      { href: '/github', label: 'GitHub Evidence', shortLabel: 'GitHub', icon: IconGitHub },
    ],
  },
  {
    id: 'land-the-role',
    phaseNumber: '03',
    title: 'LAND THE ROLE',
    purpose: 'Convert verified proof into hiring opportunities',
    items: [
      { href: '/job-tracker', label: 'Job Pipeline', shortLabel: 'Pipeline', icon: IconJobs },
      { href: '/ats-checker', label: 'ATS Keyword Matcher', shortLabel: 'ATS Match', icon: IconATS },
      { href: '/resume-builder', label: 'Resume Canvas', shortLabel: 'Resume', icon: IconResume },
      { href: '/cover-letter', label: 'Pitch Studio', shortLabel: 'Cover Pitch', icon: IconCoverLetter },
    ],
  },
  {
    id: 'interview-close',
    phaseNumber: '04',
    title: 'INTERVIEW & CLOSE',
    purpose: 'Convert opportunities into successful offers',
    items: [
      { href: '/interview-prep', label: 'Technical Question Bank', shortLabel: 'Questions', icon: IconInterview },
      { href: '/mock-interview', label: 'System Design Simulator', shortLabel: 'Mock Interview', icon: IconAssessment },
      { href: '/salary-insights', label: 'Compensation & Equity', shortLabel: 'Compensation', icon: IconSalary },
    ],
  },
];

export const SECONDARY_NAV_ITEMS = [
  { href: '/portfolio/sharvin', label: 'Public Portfolio Showcase', shortLabel: 'Public Showcase', icon: IconPortfolio },
  { href: '/algorithm-sandbox', label: 'Triton Latency Sandbox', shortLabel: 'GPU Sandbox', icon: IconSandbox },
  { href: '/project-generator', label: 'Architecture Blueprints', shortLabel: 'Blueprints', icon: IconBlueprints },
];

export const MOBILE_PRIMARY_TABS = [
  { href: '/', label: 'Overview', icon: IconDashboard },
  { href: '/projects', label: 'Proof', icon: IconProjects },
  { href: '/job-tracker', label: 'Pipeline', icon: IconJobs },
  { href: '/ats-checker', label: 'ATS', icon: IconATS },
];
