/**
 * @file interviewIntelligenceRegistry.ts
 * @description Centralized, explainable registry and question prioritization engine
 * for Connection C (Job Pipeline → Contextual Interview Intelligence) in Catalyst OS.
 */

export interface CompanyIntelligenceProfile {
  id: string;
  name: string;
  aliases: string[];
  tier: 'Frontier AI Lab' | 'Tier-1 Tech' | 'Enterprise Infrastructure';
  badge: string;
  primaryFocusTopics: string[];
  typicalInterviewStages: string[];
  keyArchitectures: string[];
  whyItMatters: string;
}

export interface ResolvedInterviewContext {
  companyName: string;
  roleTitle?: string;
  stageName?: string;
  profile: CompanyIntelligenceProfile | null;
  focusTopics: string[];
  isMatched: boolean;
  activeApplicationCount?: number;
}

export interface PrioritizedQuestion {
  id: number | string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  user_status?: string;
  user_notes?: string | null;
  priorityScore: number;
  isCompanyPriority: boolean;
  matchReason?: string;
}

export const COMPANY_PROFILES: CompanyIntelligenceProfile[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    aliases: ['anthropic', 'claude', 'anthropic ai'],
    tier: 'Frontier AI Lab',
    badge: '⚡ FRONTIER LAB',
    primaryFocusTopics: [
      'Distributed Systems',
      'PyTorch & CUDA',
      'Online Softmax',
      'FlashAttention',
      'RLHF & Alignment',
      'System Design',
    ],
    typicalInterviewStages: ['Technical Screen', 'Systems Architecture', 'Core PyTorch & CUDA', 'Executive Final'],
    keyArchitectures: ['Constitutional AI', 'Megatron-LM Tensor Parallelism', 'FlashAttention-2', 'DPO'],
    whyItMatters: 'Interviews evaluate low-level GPU memory hierarchy, non-blocking NCCL All-Reduce, and scalable post-training alignment.',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    aliases: ['nvidia', 'nvidia corporation', 'nvda'],
    tier: 'Frontier AI Lab',
    badge: '🟢 GPU SYSTEMS LEAD',
    primaryFocusTopics: [
      'GPU Kernel Optimization',
      'Triton & CUDA',
      'TensorRT-LLM',
      'Inference Latency',
      'SIMD Parallelism',
      'PyTorch & CUDA',
    ],
    typicalInterviewStages: ['CUDA Coding Assessment', 'Kernel Optimization Deep Dive', 'Hardware Architecture', 'Hiring Manager'],
    keyArchitectures: ['Hopper H100 Tensor Cores', 'Triton Online Softmax', 'FP8 Quantization', 'PagedAttention'],
    whyItMatters: 'Interviews rigorously test SRAM bank conflict elimination, warp divergence reduction, and sub-15ms p99 latency guarantees.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    aliases: ['openai', 'chatgpt'],
    tier: 'Frontier AI Lab',
    badge: '🌐 FRONTIER LAB',
    primaryFocusTopics: [
      'Multi-Node Distributed Training',
      'GQA & KV-Cache',
      'Post-Training RL',
      'Transformer Architectures',
      'Distributed Systems',
    ],
    typicalInterviewStages: ['Live Systems Coding', 'Distributed Training Design', 'ML Research Architecture', 'Partner Round'],
    keyArchitectures: ['Megatron-LM', 'Direct Preference Optimization', 'Triton GPU Kernels', 'Mixture of Experts (MoE)'],
    whyItMatters: 'Evaluates ability to scale 100B+ parameter models across 10,000+ GPU clusters with high Model FLOPs Utilization (MFU).',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    aliases: ['cohere', 'cohere ai'],
    tier: 'Tier-1 Tech',
    badge: '🔮 ENTERPRISE RAG',
    primaryFocusTopics: [
      'RAG Architectures',
      'Dense Vector Search',
      'BM25 Fusion',
      'Distributed PyTorch',
      'Vector Search (FAISS)',
    ],
    typicalInterviewStages: ['Information Retrieval Screen', 'Embedding Architecture Design', 'Live Systems Coding'],
    keyArchitectures: ['Hybrid BM25 + Qdrant', 'RRF Rank Fusion', 'Multi-Modal Embeddings', 'Ray Clusters'],
    whyItMatters: 'Tests sub-150ms semantic search latency, reciprocal rank fusion, and grounded citation evaluation.',
  },
  {
    id: 'databricks',
    name: 'Databricks',
    aliases: ['databricks', 'spark'],
    tier: 'Enterprise Infrastructure',
    badge: '🧱 LAKEHOUSE PLATFORM',
    primaryFocusTopics: [
      'Apache Spark & PySpark',
      'Lakehouse Architectures',
      'Distributed Storage',
      'ClickHouse / Iceberg',
      'SQL & Query Optimization',
    ],
    typicalInterviewStages: ['Distributed Systems Coding', 'Lakehouse System Design', 'SQL & Query Optimization', 'Architect Final'],
    keyArchitectures: ['Apache Iceberg', 'Delta Lake', 'Photon Engine', 'Kafka Real-Time Streaming'],
    whyItMatters: 'Focuses on distributed partition pruning, columnar indexing, and petabyte-scale streaming data pipelines.',
  },
  {
    id: 'meta',
    name: 'Meta',
    aliases: ['meta', 'facebook', 'instagram', 'fair'],
    tier: 'Tier-1 Tech',
    badge: '♾️ OPEN FOUNDATIONS',
    primaryFocusTopics: [
      'PyTorch Core',
      'FSDP & DDP',
      'Recommendation Systems',
      'Large-Scale Distributed Systems',
      'ML System Design',
    ],
    typicalInterviewStages: ['Coding Assessment', 'ML System Design', 'Distributed Infrastructure', 'Behavioral Leadership'],
    keyArchitectures: ['Llama-3', 'FSDP-2', 'DLRM Recommendation Engine', 'Triton Server'],
    whyItMatters: 'Evaluates production PyTorch distributed primitives, multi-tenant recommendation serving, and open-source infrastructure scaling.',
  },
];

/**
 * Normalizes strings for resilient token matching.
 */
function normalize(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves company context safely from URL parameters or job records.
 */
export function resolveCompanyContext(
  companyQuery: string,
  roleQuery?: string,
  stageQuery?: string
): ResolvedInterviewContext {
  if (!companyQuery) {
    return {
      companyName: '',
      roleTitle: roleQuery || '',
      stageName: stageQuery || '',
      profile: null,
      focusTopics: [],
      isMatched: false,
    };
  }

  const cleanQuery = normalize(companyQuery);

  const matchedProfile =
    COMPANY_PROFILES.find(
      (p) =>
        normalize(p.id) === cleanQuery ||
        normalize(p.name) === cleanQuery ||
        p.aliases.some((a) => normalize(a) === cleanQuery) ||
        cleanQuery.includes(normalize(p.id)) ||
        normalize(p.id).includes(cleanQuery)
    ) || null;

  const resolvedName = matchedProfile ? matchedProfile.name : companyQuery;
  const focusTopics = matchedProfile ? matchedProfile.primaryFocusTopics : [];

  return {
    companyName: resolvedName,
    roleTitle: roleQuery || 'Machine Learning Engineer',
    stageName: stageQuery || 'Technical Interview',
    profile: matchedProfile,
    focusTopics,
    isMatched: !!matchedProfile,
  };
}

/**
 * Prioritizes technical interview questions based on Company Profile, Active Role, and Candidate Skill Gaps.
 */
export function prioritizeQuestions(
  questions: any[],
  context: ResolvedInterviewContext,
  candidateGaps: Array<{ name: string; delta: number }> = []
): PrioritizedQuestion[] {
  if (!questions || questions.length === 0) return [];

  const focusTokens = context.focusTopics.map((t) => normalize(t));
  const gapTokens = candidateGaps.map((g) => normalize(g.name));
  const companyClean = normalize(context.companyName);

  return questions
    .map((q) => {
      let score = 0;
      const reasons: string[] = [];

      const qCategory = normalize(q.category || '');
      const qText = normalize((q.question || '') + ' ' + (q.answer || '') + ' ' + (q.user_notes || ''));

      // 1. Company Focus Matching (+30 pts)
      if (context.isMatched && focusTokens.length > 0) {
        for (const ft of focusTokens) {
          if (qCategory.includes(ft) || qText.includes(ft) || ft.includes(qCategory)) {
            score += 30;
            reasons.push(`Targeted for ${context.companyName}'s core focus on ${ft}`);
            break;
          }
        }
      } else if (companyClean && qText.includes(companyClean)) {
        score += 25;
        reasons.push(`Direct mention in ${context.companyName} interview archives`);
      }

      // 2. Candidate Skill Gap Alignment (+20 pts)
      for (const gt of gapTokens) {
        if (qCategory.includes(gt) || qText.includes(gt) || gt.includes(qCategory)) {
          score += 20;
          reasons.push(`Addresses your current competency gap in ${gt}`);
          break;
        }
      }

      // 3. Difficulty Bar (+10 pts for hard questions in technical stages)
      if (q.difficulty === 'hard') {
        score += 10;
      }

      const isCompanyPriority = score >= 30;

      return {
        ...q,
        priorityScore: score,
        isCompanyPriority,
        matchReason: reasons.length > 0 ? reasons[0] : undefined,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Retrieves all registered company intelligence profiles.
 */
export function getAllCompanyProfiles(): CompanyIntelligenceProfile[] {
  return COMPANY_PROFILES;
}
