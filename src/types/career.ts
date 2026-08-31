/**
 * CATALYST OS — CANONICAL DOMAIN TYPES & INTERFACES
 * Single source of truth for Career Graph, Evidence Models, and API Contracts.
 */

export type EvidenceLevel = 'CLAIM' | 'ASSESSED' | 'PROJECT' | 'VERIFIED' | 'SELF-REPORTED';

export interface EvidenceConfig {
  label: string;
  weight: number;
  description: string;
}

export interface RequiredSkill {
  name: string;
  category: string;
  targetLevel: number;
  weight: number;
}

export interface CareerRole {
  id: string;
  title: string;
  level: string;
  targetComp: string;
  description: string;
  requiredSkills: RequiredSkill[];
  criticalProjects?: string[];
}

export interface CareerTrack {
  category: string;
  roles: CareerRole[];
}

export interface Skill {
  id: string | number;
  name: string;
  category: string;
  current_level: number;
  target_level: number;
  importance?: 'low' | 'medium' | 'high';
  evidence_level?: EvidenceLevel;
  proficiency?: number;
}

export interface ProjectMilestone {
  id: string | number;
  project_id: string | number;
  title?: string;
  name?: string;
  completed: number | boolean;
  due_date?: string | null;
}

export interface Project {
  id: string | number;
  name: string;
  tagline?: string;
  description: string;
  technologies: string;
  skills_demonstrated?: string;
  status: 'planned' | 'in_progress' | 'completed';
  verification_status?: EvidenceLevel;
  github_url?: string | null;
  demo_url?: string | null;
  live_url?: string | null;
  is_featured?: number | boolean;
  milestones?: ProjectMilestone[];
}

export interface JobApplication {
  id: string | number;
  company: string;
  role: string;
  location?: string;
  work_model?: 'remote' | 'hybrid' | 'onsite';
  salary?: string;
  status: 'wishlist' | 'applied' | 'oa' | 'interview' | 'final' | 'offer' | 'rejected';
  match_score?: number;
  required_skills?: string;
  notes?: string;
  applied_date?: string | null;
}

export interface ReadinessBreakdownItem {
  score: number;
  label: string;
  weight: string;
  coveragePct?: number;
}

export interface ReadinessGap {
  name: string;
  category: string;
  current: number;
  target: number;
  delta: number;
  evidenceLevel: EvidenceLevel;
}

export interface ReadinessResult {
  overallScore: number;
  targetRoleTitle: string;
  breakdown: {
    skills: ReadinessBreakdownItem;
    portfolio: ReadinessBreakdownItem;
    resume: ReadinessBreakdownItem;
    applications: ReadinessBreakdownItem;
  };
  gaps: ReadinessGap[];
}

export interface NextBestAction {
  type: string;
  badge: string;
  title: string;
  reason: string;
  impact: string;
  effort: string;
  actionUrl: string;
  actionLabel: string;
}

export interface DemoPersona {
  id: string;
  personaName: string;
  badge: string;
  profile: {
    name: string;
    title: string;
    targetRole: string;
    level: string;
    location: string;
    bio: string;
    isDemo?: boolean;
  };
  skills: Skill[];
  projects: Project[];
  jobs: JobApplication[];
}

export interface Certification {
  id: string | number;
  name: string;
  provider: string;
  url?: string;
  status: 'planned' | 'in_progress' | 'completed';
  progress?: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  deadline?: string | null;
  notes?: string;
}

export interface TechnicalResource {
  id: string | number;
  title: string;
  authors?: string;
  arxivId?: string;
  year?: string;
  url?: string;
  type: 'paper' | 'rfc' | 'book' | 'article';
  topic?: string;
  completed: number | boolean;
  rating?: number;
  notes?: string;
}
