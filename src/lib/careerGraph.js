/**
 * CATALYST OS — CANONICAL CAREER GRAPH & EVIDENCE ENGINE
 * Single source of truth for target roles, required competencies,
 * evidence weighting, readiness algorithms, and Next Best Action scoring.
 */

// ─── Track & Role Framework ─────────────────────────────────────────
export const CAREER_TRACKS = [
  {
    category: 'ENTRY & EARLY CAREER',
    roles: [
      {
        id: 'junior_data_scientist',
        title: 'Associate Data Scientist',
        level: 'Entry',
        targetComp: '$95k - $130k',
        description: 'Focus on exploratory data analysis, feature engineering, baseline ML models, and statistical hypothesis testing.',
        requiredSkills: [
          { name: 'Python', category: 'Programming', targetLevel: 85, weight: 1.0 },
          { name: 'SQL', category: 'Data Systems', targetLevel: 80, weight: 1.0 },
          { name: 'Pandas & NumPy', category: 'Data Systems', targetLevel: 85, weight: 0.9 },
          { name: 'Scikit-Learn', category: 'Machine Learning', targetLevel: 80, weight: 0.9 },
          { name: 'Statistical Testing', category: 'Theory', targetLevel: 75, weight: 0.8 },
          { name: 'Data Visualization', category: 'Theory', targetLevel: 75, weight: 0.7 },
        ],
        criticalProjects: ['Customer Churn Prediction with SHAP Interpretability', 'E-Commerce A/B Testing & Revenue Analysis'],
      },
      {
        id: 'junior_ml_engineer',
        title: 'Junior ML Engineer',
        level: 'Entry',
        targetComp: '$110k - $145k',
        description: 'Focus on clean Python pipelines, containerization, model training scripts, and REST inference APIs.',
        requiredSkills: [
          { name: 'Python', category: 'Programming', targetLevel: 85, weight: 1.0 },
          { name: 'PyTorch', category: 'Machine Learning', targetLevel: 80, weight: 1.0 },
          { name: 'Docker', category: 'Infrastructure', targetLevel: 75, weight: 0.9 },
          { name: 'FastAPI', category: 'Infrastructure', targetLevel: 75, weight: 0.8 },
          { name: 'Git & CI/CD', category: 'Infrastructure', targetLevel: 70, weight: 0.7 },
          { name: 'SQL', category: 'Data Systems', targetLevel: 70, weight: 0.7 },
        ],
        criticalProjects: ['Real-Time FastApi Model Serving with Docker', 'Computer Vision Object Detection Pipeline'],
      },
    ],
  },
  {
    category: 'INTERMEDIATE / CORE',
    roles: [
      {
        id: 'senior_ml',
        title: 'Machine Learning Engineer',
        level: 'Mid-Senior',
        targetComp: '$165k - $220k',
        description: 'High-throughput inference, PyTorch optimization, distributed training pipelines, and production MLOps.',
        requiredSkills: [
          { name: 'PyTorch & CUDA', category: 'Machine Learning', targetLevel: 90, weight: 1.0 },
          { name: 'MLOps & Deployment', category: 'Infrastructure', targetLevel: 85, weight: 1.0 },
          { name: 'Distributed Systems', category: 'Systems', targetLevel: 80, weight: 0.9 },
          { name: 'Docker & Kubernetes', category: 'Infrastructure', targetLevel: 80, weight: 0.9 },
          { name: 'Feature Stores (Feast/Redis)', category: 'Data Systems', targetLevel: 75, weight: 0.8 },
          { name: 'System Design', category: 'Systems', targetLevel: 80, weight: 0.8 },
          { name: 'CI/CD & Model Monitoring', category: 'Infrastructure', targetLevel: 75, weight: 0.7 },
        ],
        criticalProjects: ['Distributed LLM Fine-Tuning with DeepSpeed', 'Production Triton Inference Gateway with P99 < 15ms'],
      },
      {
        id: 'ai_engineer',
        title: 'AI Application Engineer',
        level: 'Mid-Senior',
        targetComp: '$150k - $210k',
        description: 'Multi-modal RAG systems, vector embeddings, agentic workflows, LLM evaluation, and structured tool calling.',
        requiredSkills: [
          { name: 'Python', category: 'Programming', targetLevel: 90, weight: 1.0 },
          { name: 'Vector Search (FAISS/Milvus)', category: 'Data Systems', targetLevel: 90, weight: 1.0 },
          { name: 'RAG Architecture & Eval', category: 'Machine Learning', targetLevel: 90, weight: 1.0 },
          { name: 'LangChain & LlamaIndex', category: 'Machine Learning', targetLevel: 80, weight: 0.8 },
          { name: 'FastAPI & Async Streaming', category: 'Infrastructure', targetLevel: 85, weight: 0.9 },
          { name: 'Prompt Engineering & DSPy', category: 'Theory', targetLevel: 80, weight: 0.8 },
        ],
        criticalProjects: ['Multi-Modal Agentic Research Engine with RAG & Citations', 'Self-Reflective Coding Assistant with AST Verification'],
      },
      {
        id: 'data_engineer',
        title: 'Data Systems Engineer',
        level: 'Mid-Senior',
        targetComp: '$145k - $195k',
        description: 'Large-scale batch and streaming ETL, Apache Kafka, Spark, dbt transformations, and data lakehouse architecture.',
        requiredSkills: [
          { name: 'SQL & Query Optimization', category: 'Data Systems', targetLevel: 95, weight: 1.0 },
          { name: 'Python', category: 'Programming', targetLevel: 85, weight: 0.9 },
          { name: 'Apache Spark & PySpark', category: 'Data Systems', targetLevel: 85, weight: 1.0 },
          { name: 'Kafka / Real-Time Streaming', category: 'Systems', targetLevel: 80, weight: 0.9 },
          { name: 'dbt & Snowflake / BigQuery', category: 'Data Systems', targetLevel: 80, weight: 0.8 },
          { name: 'Airflow / Prefect Orchestration', category: 'Infrastructure', targetLevel: 75, weight: 0.8 },
        ],
        criticalProjects: ['Real-Time Clickstream Ingestion with Kafka and ClickHouse', '10TB Batch Transformation Lakehouse with dbt & Iceberg'],
      },
    ],
  },
  {
    category: 'ADVANCED & LEADERSHIP',
    roles: [
      {
        id: 'staff_ml_architect',
        title: 'Staff ML Systems Architect',
        level: 'Staff / Principal',
        targetComp: '$240k - $360k+',
        description: 'End-to-end ML platform architecture, custom Triton/CUDA kernels, multi-GPU cluster scaling, and organizational technical leadership.',
        requiredSkills: [
          { name: 'PyTorch Internals & CUDA', category: 'Machine Learning', targetLevel: 95, weight: 1.0 },
          { name: 'Large-Scale Distributed Systems', category: 'Systems', targetLevel: 95, weight: 1.0 },
          { name: 'ML Platform Design', category: 'Systems', targetLevel: 90, weight: 1.0 },
          { name: 'Ray / Kubernetes Orchestration', category: 'Infrastructure', targetLevel: 85, weight: 0.9 },
          { name: 'Hardware Acceleration (H100/TPU)', category: 'Infrastructure', targetLevel: 85, weight: 0.8 },
          { name: 'Technical Strategy & Mentorship', category: 'Leadership', targetLevel: 90, weight: 0.8 },
        ],
        criticalProjects: ['Multi-Node Tensor Parallel Inference Engine from Scratch', 'Enterprise-Scale Feature Store and Real-Time ML Platform'],
      },
    ],
  },
];

// Helper to look up a role definition by ID
export function getRoleById(roleId) {
  for (const track of CAREER_TRACKS) {
    const found = track.roles.find((r) => r.id === roleId);
    if (found) return found;
  }
  // Default to ML Engineer
  return CAREER_TRACKS[1].roles[0];
}

// ─── Evidence Weight Multipliers ────────────────────────────────────
export const EVIDENCE_LEVELS = {
  CLAIM: { label: 'Self-Claimed', weight: 0.35, description: 'Listed on profile without linked project or repo' },
  ASSESSED: { label: 'Assessment Passed', weight: 0.65, description: 'Validated via technical quiz or mock interview' },
  PROJECT: { label: 'Project Built', weight: 0.85, description: 'Demonstrated in documented portfolio project' },
  VERIFIED: { label: 'Verified Codebase', weight: 1.0, description: 'Backed by live GitHub repo / public deployment' },
};

// ─── Canonical Readiness Score Calculator ───────────────────────────
export function calculateCareerReadiness({
  targetRole,
  skills = [],
  projects = [],
  jobs = [],
  resumeData = null,
  assessments = [],
  certifications = [],
}) {
  const roleDef = typeof targetRole === 'string' ? getRoleById(targetRole) : targetRole || getRoleById('senior_ml');
  const required = roleDef.requiredSkills || [];

  // 1. Skill Mastery Score (30% weight)
  let totalSkillWeight = 0;
  let earnedSkillPoints = 0;

  required.forEach((req) => {
    totalSkillWeight += req.weight;
    const userSkill = skills.find((s) => s.name?.toLowerCase() === req.name.toLowerCase());
    if (userSkill) {
      const cur = userSkill.current_level || userSkill.proficiency || 0;
      const target = req.targetLevel || 100;
      const evidence = EVIDENCE_LEVELS[userSkill.evidence_level || 'CLAIM'] || EVIDENCE_LEVELS.CLAIM;
      const ratio = Math.min(cur / target, 1.0) * evidence.weight;
      earnedSkillPoints += ratio * req.weight;
    }
  });

  const skillScore = totalSkillWeight > 0 ? Math.round((earnedSkillPoints / totalSkillWeight) * 100) : 60;

  // 2. Portfolio Evidence Coverage (30% weight)
  const projectDemonstratedSkills = new Set();
  projects.forEach((p) => {
    const rawSkills = p.skills_demonstrated || p.technologies || '';
    rawSkills.split(',').forEach((sk) => projectDemonstratedSkills.add(sk.trim().toLowerCase()));
  });

  let coveredRequired = 0;
  required.forEach((req) => {
    if (projectDemonstratedSkills.has(req.name.toLowerCase())) {
      coveredRequired++;
    }
  });

  const portfolioCoverage = required.length > 0 ? Math.round((coveredRequired / required.length) * 100) : 50;
  const projectCompletionBonus = projects.filter((p) => p.status === 'completed').length >= 2 ? 10 : 0;
  const portfolioScore = Math.min(Math.round(portfolioCoverage * 0.9 + projectCompletionBonus), 100);

  // 3. Resume / ATS Alignment Score (20% weight)
  const resumeScore = resumeData?.atsScore || (resumeData?.full_name ? 86 : 75);

  // 4. Application & Interview Activity (20% weight)
  const activeApplications = jobs.length;
  const interviewCount = jobs.filter((j) => ['interview', 'final', 'offer'].includes(j.status)).length;
  const appScore = Math.min(Math.round(activeApplications * 6 + interviewCount * 18 + (assessments.length > 0 ? 20 : 15)), 100);

  // Overall Weighted Score
  const overall = Math.round(
    skillScore * 0.30 +
    portfolioScore * 0.30 +
    resumeScore * 0.20 +
    appScore * 0.20
  );

  return {
    overallScore: Math.min(Math.max(overall, 20), 98),
    targetRoleTitle: roleDef.title,
    breakdown: {
      skills: { score: skillScore, label: 'Core Competency Match', weight: '30%' },
      portfolio: { score: portfolioScore, coveragePct: portfolioCoverage, label: 'Portfolio Evidence Coverage', weight: '30%' },
      resume: { score: resumeScore, label: 'ATS & Resume Alignment', weight: '20%' },
      applications: { score: appScore, label: 'Pipeline & Interview Readiness', weight: '20%' },
    },
    gaps: required
      .map((req) => {
        const userSkill = skills.find((s) => s.name?.toLowerCase() === req.name.toLowerCase());
        const cur = userSkill ? userSkill.current_level || 0 : 0;
        return {
          name: req.name,
          category: req.category,
          current: cur,
          target: req.targetLevel,
          delta: Math.max(req.targetLevel - cur, 0),
          evidenceLevel: userSkill?.evidence_level || 'CLAIM',
        };
      })
      .filter((g) => g.delta > 0)
      .sort((a, b) => b.delta - a.delta),
  };
}

// ─── Next Best Action Engine ────────────────────────────────────────
export function generateNextBestAction({ targetRole, skills = [], projects = [], jobs = [], readiness }) {
  const roleDef = typeof targetRole === 'string' ? getRoleById(targetRole) : targetRole || getRoleById('senior_ml');
  const roleTitle = roleDef.title;

  // Scenario 1: Critical pending interview
  const upcomingInterview = jobs.find((j) => j.status === 'interview' || j.status === 'final');
  if (upcomingInterview) {
    return {
      type: 'INTERVIEW_PREP',
      badge: 'HIGH URGENCY',
      title: `Prepare Technical System Design for ${upcomingInterview.company}`,
      reason: `You have an active interview round for ${upcomingInterview.role}. Review system design and latency optimization invariants.`,
      impact: '+25% Interview Confidence',
      effort: '3–5 hours',
      actionUrl: `/interview-prep?company=${encodeURIComponent(upcomingInterview.company)}`,
      actionLabel: 'OPEN INTERVIEW PREP →',
    };
  }

  // Scenario 2: Zero projects in portfolio
  if (projects.length === 0) {
    const recProject = roleDef.criticalProjects?.[0] || 'Production ML Inference Platform';
    return {
      type: 'BUILD_PROJECT',
      badge: 'HIGH IMPACT',
      title: `Build Your First Core Project: ${recProject}`,
      reason: `Your target ${roleTitle} path requires concrete engineering evidence. Building this project will close ${Math.min(roleDef.requiredSkills.length, 4)} critical skill gaps simultaneously.`,
      impact: '+30% Portfolio Evidence Coverage',
      effort: '12–18 hours',
      actionUrl: `/projects?template=${encodeURIComponent(recProject)}`,
      actionLabel: 'START PROJECT BUILDER →',
    };
  }

  // Scenario 3: Large Skill Gap Detected
  const biggestGap = readiness?.gaps?.[0];
  if (biggestGap && biggestGap.delta >= 20) {
    return {
      type: 'CLOSE_SKILL_GAP',
      badge: 'CRITICAL DELTA',
      title: `Bridge Skill Deficit: Master ${biggestGap.name}`,
      reason: `Target ${roleTitle} hiring bars require ${biggestGap.target}% proficiency in ${biggestGap.name}. Your current verified level is ${biggestGap.current}%.`,
      impact: `+${Math.round(biggestGap.delta * 0.4)}% Readiness Score`,
      effort: '8–12 hours',
      actionUrl: `/skills?focus=${encodeURIComponent(biggestGap.name)}`,
      actionLabel: 'VIEW COMPETENCY ROADMAP →',
    };
  }

  // Scenario 4: No active job applications
  if (jobs.length < 3) {
    return {
      type: 'EXPAND_PIPELINE',
      badge: 'OPPORTUNITY SPRINT',
      title: `Log 3 High-Match ${roleTitle} Opportunities`,
      reason: 'Your portfolio has evidence. Expand your top-of-funnel pipeline to trigger recruiter outreach and technical screens.',
      impact: '+15% Pipeline Momentum',
      effort: '1–2 hours',
      actionUrl: '/job-tracker',
      actionLabel: 'ADD TARGET ROLES →',
    };
  }

  // Default: Verify Project on GitHub
  return {
    type: 'VERIFY_EVIDENCE',
    badge: 'PROOF BOOST',
    title: 'Link GitHub Repositories to Verify Project Evidence',
    reason: 'Upgrading self-claimed project items to Verified Codebases with unit tests elevates your hiring signal.',
    impact: '+12% Evidence Confidence',
    effort: '30 mins',
    actionUrl: '/github',
    actionLabel: 'SYNC GITHUB REPOSITORIES →',
  };
}

// ─── 3 Rich Interactive Candidate Personas (Real-World Benchmark Testing Data) ──
export const DEMO_PERSONAS = [
  {
    id: 'sharvin_ml',
    personaName: 'Sharvin Neve',
    badge: '🚀 ML Systems Specialist',
    profile: {
      name: 'Sharvin Neve',
      title: 'Machine Learning Engineer',
      targetRole: 'senior_ml',
      level: 'Mid-Senior',
      location: 'San Francisco, CA (Open to Remote)',
      bio: 'ML Systems Engineer building high-throughput PyTorch inference pipelines, Triton GPU kernels, and distributed training systems.',
      isDemo: true,
    },
    skills: [
      { id: 1, name: 'PyTorch & CUDA', category: 'Machine Learning', current_level: 92, target_level: 95, evidence_level: 'VERIFIED' },
      { id: 2, name: 'Distributed Systems', category: 'Systems', current_level: 85, target_level: 90, evidence_level: 'PROJECT' },
      { id: 3, name: 'MLOps & Deployment', category: 'Infrastructure', current_level: 88, target_level: 90, evidence_level: 'VERIFIED' },
      { id: 4, name: 'Docker & Kubernetes', category: 'Infrastructure', current_level: 84, target_level: 85, evidence_level: 'PROJECT' },
      { id: 5, name: 'Vector Search (FAISS)', category: 'Data Systems', current_level: 90, target_level: 90, evidence_level: 'VERIFIED' },
      { id: 6, name: 'System Design', category: 'Systems', current_level: 82, target_level: 85, evidence_level: 'ASSESSED' },
    ],
    projects: [
      {
        id: 1,
        name: 'Triton Low-Latency Inference Gateway',
        description: 'Custom Triton C++ kernel serving Llama-3 with dynamic batching and P99 latency < 13.8ms under 5,000 req/sec load.',
        technologies: 'C++, PyTorch, Triton, CUDA, Docker',
        skills_demonstrated: 'PyTorch & CUDA, MLOps & Deployment, Docker & Kubernetes',
        status: 'completed',
        verification_status: 'VERIFIED',
        github_url: 'https://github.com/sharvin/triton-inference-gateway',
        is_featured: 1,
      },
      {
        id: 2,
        name: 'Multi-Modal Vector Search & RAG Cluster',
        description: 'Distributed hybrid BM25 + dense embedding vector search engine indexing 10M research papers with Milvus and Ray.',
        technologies: 'Python, FAISS, Milvus, Ray, FastAPI',
        skills_demonstrated: 'Vector Search (FAISS), Distributed Systems, Python',
        status: 'completed',
        verification_status: 'VERIFIED',
        github_url: 'https://github.com/sharvin/rag-vector-cluster',
        is_featured: 1,
      },
    ],
    jobs: [
      { id: 1, company: 'Anthropic', role: 'ML Systems Engineer', location: 'San Francisco, CA', salary: '$210k - $270k', status: 'interview', match_score: 95 },
      { id: 2, company: 'NVIDIA', role: 'Inference Performance Engineer', location: 'Santa Clara, CA', salary: '$195k - $250k', status: 'oa', match_score: 92 },
      { id: 3, company: 'Cohere', role: 'Distributed Training Engineer', location: 'Remote', salary: '$185k - $240k', status: 'applied', match_score: 89 },
    ],
  },
  {
    id: 'elena_ai',
    personaName: 'Elena Rostova',
    badge: '🤖 AI & RAG Architect',
    profile: {
      name: 'Elena Rostova',
      title: 'AI Application Engineer',
      targetRole: 'ai_engineer',
      level: 'Senior Architect',
      location: 'New York, NY (Hybrid)',
      bio: 'AI Engineer designing agentic tool-calling workflows, multi-modal vector search, DSPy prompt optimization, and self-correcting code evaluators.',
      isDemo: true,
    },
    skills: [
      { id: 1, name: 'Python', category: 'Programming', current_level: 95, target_level: 95, evidence_level: 'VERIFIED' },
      { id: 2, name: 'Vector Search (FAISS/Milvus)', category: 'Data Systems', current_level: 94, target_level: 95, evidence_level: 'VERIFIED' },
      { id: 3, name: 'RAG Architecture & Eval', category: 'Machine Learning', current_level: 92, target_level: 90, evidence_level: 'VERIFIED' },
      { id: 4, name: 'LangChain & LlamaIndex', category: 'Machine Learning', current_level: 88, target_level: 85, evidence_level: 'PROJECT' },
      { id: 5, name: 'FastAPI & Async Streaming', category: 'Infrastructure', current_level: 90, target_level: 90, evidence_level: 'VERIFIED' },
      { id: 6, name: 'Prompt Engineering & DSPy', category: 'Theory', current_level: 86, target_level: 85, evidence_level: 'ASSESSED' },
    ],
    projects: [
      {
        id: 1,
        name: 'Multi-Modal Agentic Research Engine with XML Citations',
        description: 'Autonomous multi-agent research workflow parsing scientific PDFs with dense embeddings, RRF rank fusion, and grounded citations.',
        technologies: 'Python, DSPy, FAISS, Claude 3.5, FastAPI',
        skills_demonstrated: 'RAG Architecture & Eval, Vector Search (FAISS/Milvus), Python',
        status: 'completed',
        verification_status: 'VERIFIED',
        github_url: 'https://github.com/elena/agentic-research-rag',
        is_featured: 1,
      },
      {
        id: 2,
        name: 'Self-Reflective Coding Assistant with AST Sandboxing',
        description: 'Automated code repair framework using compiler feedback loops, unit-test execution in gVisor containers, and 82% Pass@1.',
        technologies: 'Python, Docker, AST, FastAPI, PyTest',
        skills_demonstrated: 'FastAPI & Async Streaming, Python',
        status: 'completed',
        verification_status: 'VERIFIED',
        github_url: 'https://github.com/elena/ast-coding-agent',
        is_featured: 1,
      },
    ],
    jobs: [
      { id: 1, company: 'OpenAI', role: 'Applied AI Solutions Engineer', location: 'San Francisco, CA', salary: '$225k - $295k', status: 'interview', match_score: 96 },
      { id: 2, company: 'Scale AI', role: 'Staff Generative AI Architect', location: 'New York, NY', salary: '$210k - $275k', status: 'final', match_score: 94 },
      { id: 3, company: 'Perplexity', role: 'Search Systems Engineer', location: 'San Francisco, CA', salary: '$200k - $260k', status: 'applied', match_score: 91 },
    ],
  },
  {
    id: 'marcus_data',
    personaName: 'Marcus Vance',
    badge: '⚡ Lakehouse Systems Lead',
    profile: {
      name: 'Marcus Vance',
      title: 'Data Systems Engineer',
      targetRole: 'data_engineer',
      level: 'Lead Engineer',
      location: 'Austin, TX (Remote)',
      bio: 'Data Systems Engineer designing high-throughput Apache Kafka event streaming, 10TB+ PySpark transformations, and Apache Iceberg lakehouses.',
      isDemo: true,
    },
    skills: [
      { id: 1, name: 'SQL & Query Optimization', category: 'Data Systems', current_level: 98, target_level: 95, evidence_level: 'VERIFIED' },
      { id: 2, name: 'Python', category: 'Programming', current_level: 90, target_level: 90, evidence_level: 'VERIFIED' },
      { id: 3, name: 'Apache Spark & PySpark', category: 'Data Systems', current_level: 92, target_level: 90, evidence_level: 'VERIFIED' },
      { id: 4, name: 'Kafka / Real-Time Streaming', category: 'Systems', current_level: 88, target_level: 85, evidence_level: 'PROJECT' },
      { id: 5, name: 'dbt & Snowflake / BigQuery', category: 'Data Systems', current_level: 86, target_level: 85, evidence_level: 'PROJECT' },
      { id: 6, name: 'Airflow / Prefect Orchestration', category: 'Infrastructure', current_level: 85, target_level: 80, evidence_level: 'ASSESSED' },
    ],
    projects: [
      {
        id: 1,
        name: 'Real-Time Clickstream Ingestion with Kafka & ClickHouse',
        description: 'Sub-second streaming analytics engine handling 120,000 events/sec with Apache Kafka and ClickHouse columnar storage.',
        technologies: 'Kafka, ClickHouse, Python, Docker',
        skills_demonstrated: 'Kafka / Real-Time Streaming, SQL & Query Optimization, Python',
        status: 'completed',
        verification_status: 'VERIFIED',
        github_url: 'https://github.com/marcus/kafka-clickhouse-pipeline',
        is_featured: 1,
      },
      {
        id: 2,
        name: '10TB Batch Transformation Lakehouse with dbt & Iceberg',
        description: 'Multi-terabyte transactional lakehouse on AWS S3 with ACID guarantees, schema evolution, and automated dbt data quality checks.',
        technologies: 'Apache Spark, dbt, Apache Iceberg, AWS S3',
        skills_demonstrated: 'Apache Spark & PySpark, dbt & Snowflake / BigQuery',
        status: 'completed',
        verification_status: 'VERIFIED',
        github_url: 'https://github.com/marcus/iceberg-lakehouse',
        is_featured: 1,
      },
    ],
    jobs: [
      { id: 1, company: 'Databricks', role: 'Senior Lakehouse Solutions Engineer', location: 'Remote', salary: '$190k - $255k', status: 'interview', match_score: 95 },
      { id: 2, company: 'Snowflake', role: 'Distributed Data Systems Engineer', location: 'San Mateo, CA', salary: '$195k - $260k', status: 'oa', match_score: 93 },
      { id: 3, company: 'Stripe', role: 'Data Platform Engineer', location: 'Seattle, WA', salary: '$205k - $270k', status: 'applied', match_score: 90 },
    ],
  },
];

export const BENCHMARK_DEMO_DATA = DEMO_PERSONAS[0];
