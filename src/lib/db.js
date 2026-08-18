import Database from 'better-sqlite3';
import path from 'path';

let db = null;

export function getDb() {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'career-catalyst.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initializeDatabase(db);
  return db;
}

function initializeDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      url TEXT,
      status TEXT DEFAULT 'planned' CHECK(status IN ('planned','in_progress','completed')),
      progress INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
      deadline TEXT,
      notes TEXT,
      category TEXT,
      estimated_hours INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'planned' CHECK(status IN ('planned','in_progress','completed','paused')),
      github_url TEXT,
      live_url TEXT,
      tech_stack TEXT,
      category TEXT,
      impact TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      due_date TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      current_level INTEGER DEFAULT 0 CHECK(current_level >= 0 AND current_level <= 100),
      target_level INTEGER DEFAULT 100 CHECK(target_level >= 0 AND target_level <= 100),
      importance TEXT DEFAULT 'medium' CHECK(importance IN ('low','medium','high','critical')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT,
      type TEXT DEFAULT 'course' CHECK(type IN ('course','tutorial','book','article','video','documentation','project')),
      topic TEXT,
      completed INTEGER DEFAULT 0,
      rating INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resume_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      score INTEGER,
      feedback TEXT,
      keyword_matches TEXT,
      missing_keywords TEXT,
      format_issues TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS github_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      profile_data TEXT,
      repo_data TEXT,
      language_stats TEXT,
      contribution_stats TEXT,
      recommendations TEXT,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS career_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','archived')),
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      entity_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- NEW: Job Application Tracker Kanban
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT,
      work_model TEXT DEFAULT 'remote' CHECK(work_model IN ('remote','hybrid','onsite')),
      salary TEXT,
      status TEXT DEFAULT 'wishlist' CHECK(status IN ('wishlist','applied','oa','interview','final','offer','rejected')),
      applied_date TEXT,
      job_url TEXT,
      recruiter_contact TEXT,
      required_skills TEXT,
      match_score INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- NEW: DS/ML Interview Question Bank
    CREATE TABLE IF NOT EXISTS interview_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      key_takeaways TEXT,
      code_snippet TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_question_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      status TEXT DEFAULT 'unprepared' CHECK(status IN ('unprepared','reviewing','mastered')),
      notes TEXT,
      last_reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
    );

    -- NEW: Resume Builder Store
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'Data Science Resume',
      full_name TEXT DEFAULT 'Sharvin Neve',
      email TEXT DEFAULT 'sharvinneve67@gmail.com',
      phone TEXT DEFAULT '+1 (555) 342-8901',
      location TEXT DEFAULT 'San Francisco, CA (Open to Remote)',
      linkedin_url TEXT DEFAULT 'linkedin.com/in/sharvin-neve',
      github_url TEXT DEFAULT 'github.com/Guts1005',
      portfolio_url TEXT DEFAULT 'https://career-catalyst.dev',
      summary TEXT,
      template_name TEXT DEFAULT 'modern-ats',
      education_json TEXT,
      experience_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- NEW: Coding & Kaggle Tracker
    CREATE TABLE IF NOT EXISTS coding_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL UNIQUE,
      handle TEXT NOT NULL,
      tier TEXT DEFAULT 'Competitor',
      rank_info TEXT,
      solved_count INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coding_problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      platform TEXT NOT NULL CHECK(platform IN ('LeetCode','Kaggle','HackerRank','StrataScratch','Codeforces')),
      category TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
      status TEXT DEFAULT 'solved' CHECK(status IN ('todo','in_progress','solved')),
      url TEXT,
      solution_notes TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- NEW: Mock Interview Sessions
    CREATE TABLE IF NOT EXISTS mock_interview_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 15,
      score INTEGER DEFAULT 0,
      feedback_json TEXT,
      questions_answered INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- NEW: Cover Letters & Recruiter Pitches
    CREATE TABLE IF NOT EXISTS cover_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      cover_letter_text TEXT NOT NULL,
      recruiter_pitch_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE SET NULL
    );

    -- NEW: Salary Benchmarks & Market Intelligence
    CREATE TABLE IF NOT EXISTS salary_benchmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      level TEXT NOT NULL,
      location TEXT NOT NULL,
      base_median INTEGER NOT NULL,
      equity_median INTEGER NOT NULL,
      bonus_median INTEGER NOT NULL,
      total_comp_median INTEGER NOT NULL
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_cert_status ON certifications(status);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_project_milestones_pid ON project_milestones(project_id);
    CREATE INDEX IF NOT EXISTS idx_skills_cat ON skills(category);
    CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_applications(status);
    CREATE INDEX IF NOT EXISTS idx_iq_cat ON interview_questions(category);
    CREATE INDEX IF NOT EXISTS idx_cp_platform ON coding_problems(platform);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
  `);

  // Seed data if tables are empty
  const certCount = db.prepare('SELECT COUNT(*) as count FROM certifications').get();
  if (certCount.count === 0) {
    seedData(db);
  }

  // Seed interview questions if empty
  const questionCount = db.prepare('SELECT COUNT(*) as count FROM interview_questions').get();
  if (questionCount.count === 0) {
    seedInterviewQuestions(db);
  }

  // Seed job applications if empty
  const jobCount = db.prepare('SELECT COUNT(*) as count FROM job_applications').get();
  if (jobCount.count === 0) {
    seedJobApplications(db);
  }

  // Seed default resume if empty
  const resumeCount = db.prepare('SELECT COUNT(*) as count FROM resumes').get();
  if (resumeCount.count === 0) {
    seedDefaultResume(db);
  }

  // Seed coding tracker if empty
  const codingCount = db.prepare('SELECT COUNT(*) as count FROM coding_profiles').get();
  if (codingCount.count === 0) {
    seedCodingTracker(db);
  }

  // Seed salary benchmarks if empty
  const salaryCount = db.prepare('SELECT COUNT(*) as count FROM salary_benchmarks').get();
  if (salaryCount.count === 0) {
    seedSalaryBenchmarks(db);
  }
}

function seedData(db) {
  const insertCert = db.prepare(`
    INSERT INTO certifications (name, provider, url, status, progress, priority, category, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const certs = [
    ['TensorFlow Developer Certificate', 'Google', 'https://www.tensorflow.org/certificate', 'planned', 0, 'high', 'Deep Learning', 60],
    ['AWS Certified Machine Learning – Specialty', 'Amazon', 'https://aws.amazon.com/certification/certified-machine-learning-specialty/', 'planned', 0, 'high', 'Cloud ML', 80],
    ['Google Professional Machine Learning Engineer', 'Google Cloud', 'https://cloud.google.com/learn/certification/machine-learning-engineer', 'planned', 0, 'high', 'Cloud ML', 100],
    ['Microsoft Azure AI Engineer Associate', 'Microsoft', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/', 'planned', 0, 'medium', 'Cloud ML', 70],
    ['IBM Data Science Professional Certificate', 'IBM / Coursera', 'https://www.coursera.org/professional-certificates/ibm-data-science', 'planned', 0, 'medium', 'Data Science', 50],
    ['Deep Learning Specialization', 'DeepLearning.AI / Coursera', 'https://www.coursera.org/specializations/deep-learning', 'planned', 0, 'high', 'Deep Learning', 80],
    ['Stanford Machine Learning (CS229)', 'Stanford / Coursera', 'https://www.coursera.org/specializations/machine-learning-introduction', 'planned', 0, 'high', 'ML Foundations', 60],
    ['Databricks Certified Data Engineer Associate', 'Databricks', 'https://www.databricks.com/learn/certification', 'planned', 0, 'medium', 'Data Engineering', 50],
  ];

  const insertMany = db.transaction(() => {
    for (const c of certs) {
      insertCert.run(...c);
    }
  });
  insertMany();

  // Seed skills
  const insertSkill = db.prepare(`
    INSERT INTO skills (name, category, current_level, target_level, importance)
    VALUES (?, ?, ?, ?, ?)
  `);

  const skills = [
    ['Python', 'Programming', 60, 90, 'critical'],
    ['SQL', 'Programming', 40, 80, 'critical'],
    ['R', 'Programming', 10, 50, 'low'],
    ['Pandas', 'Data Manipulation', 50, 90, 'critical'],
    ['NumPy', 'Data Manipulation', 50, 85, 'high'],
    ['Scikit-learn', 'Machine Learning', 30, 85, 'critical'],
    ['TensorFlow', 'Deep Learning', 15, 80, 'high'],
    ['PyTorch', 'Deep Learning', 10, 80, 'high'],
    ['Keras', 'Deep Learning', 20, 75, 'medium'],
    ['NLP (spaCy/NLTK)', 'Specialization', 10, 70, 'medium'],
    ['Computer Vision (OpenCV)', 'Specialization', 5, 60, 'medium'],
    ['MLOps', 'Production ML', 5, 70, 'high'],
    ['Docker', 'DevOps', 10, 60, 'medium'],
    ['Git & GitHub', 'Version Control', 40, 80, 'high'],
    ['Data Visualization (Matplotlib/Seaborn)', 'Visualization', 35, 80, 'high'],
    ['Tableau / Power BI', 'Visualization', 10, 60, 'medium'],
    ['Statistics & Probability', 'Mathematics', 40, 85, 'critical'],
    ['Linear Algebra', 'Mathematics', 30, 75, 'high'],
    ['Feature Engineering', 'Machine Learning', 20, 80, 'high'],
    ['Model Deployment (Flask/FastAPI)', 'Production ML', 10, 70, 'high'],
  ];

  const insertSkills = db.transaction(() => {
    for (const s of skills) {
      insertSkill.run(...s);
    }
  });
  insertSkills();

  // Seed resources
  const insertResource = db.prepare(`
    INSERT INTO resources (title, url, type, topic, completed, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const resources = [
    ['fast.ai Practical Deep Learning for Coders', 'https://course.fast.ai/', 'course', 'Deep Learning', 0, 'Free, practical-first approach to deep learning'],
    ['Kaggle Learn', 'https://www.kaggle.com/learn', 'tutorial', 'Data Science', 0, 'Bite-sized micro-courses on key DS topics'],
    ['Hands-On Machine Learning (Aurélien Géron)', 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/', 'book', 'Machine Learning', 0, 'The go-to ML textbook with practical examples'],
    ['3Blue1Brown Neural Networks', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', 'video', 'Deep Learning', 0, 'Incredible visual intuition for neural networks'],
    ['MLOps Zoomcamp', 'https://github.com/DataTalksClub/mlops-zoomcamp', 'course', 'MLOps', 0, 'Free MLOps course by DataTalks.Club'],
  ];

  const insertResources = db.transaction(() => {
    for (const r of resources) {
      insertResource.run(...r);
    }
  });
  insertResources();

  // Log initial activity
  db.prepare(`INSERT INTO activity_log (action, entity_type, entity_name) VALUES (?, ?, ?)`).run('initialized', 'system', 'Career Catalyst Dashboard');
}

function seedInterviewQuestions(db) {
  const insertQ = db.prepare(`
    INSERT INTO interview_questions (category, difficulty, question, answer, key_takeaways, code_snippet, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const questions = [
    [
      'Machine Learning',
      'easy',
      'What is the Bias-Variance Tradeoff in Supervised Learning?',
      'Bias refers to errors from overly simplistic assumptions in the learning algorithm (leads to underfitting). Variance refers to error from extreme sensitivity to small fluctuations in the training set (leads to overfitting). The total expected error is the sum of Bias² + Variance + Irreducible Error. The goal of ML modeling is finding the optimal sweet spot that minimizes total error.',
      'High Bias = Underfitting (High train & test error). High Variance = Overfitting (Low train error, high test error). Regularization increases bias to reduce variance.',
      '# Regularization controls variance:\nfrom sklearn.linear_model import Ridge\nmodel = Ridge(alpha=1.0) # Higher alpha increases bias, lowers variance',
      'Algorithms, Theory, Evaluation'
    ],
    [
      'Machine Learning',
      'medium',
      'Explain the difference between Bagging (Random Forests) and Boosting (XGBoost, LightGBM).',
      'Bagging (Bootstrap Aggregating) trains multiple base learners independently in parallel on bootstrap samples and averages predictions to reduce variance. Boosting trains base learners sequentially in series where each subsequent model focuses on correcting the errors/residuals of prior models, reducing bias and variance.',
      'Random Forests use parallel bagging with random feature subsets. Boosting (XGBoost/LightGBM) builds sequential decision trees on loss gradients. Boosting typically achieves higher accuracy but is more prone to overfitting if not regularized.',
      '# XGBoost residual boosting objective:\nimport xgboost as xgb\nclf = xgb.XGBClassifier(n_estimators=100, learning_rate=0.05, max_depth=4)',
      'Ensemble, Trees, XGBoost'
    ],
    [
      'Deep Learning',
      'hard',
      'How does the Scaled Dot-Product Self-Attention mechanism work in Transformers?',
      'Given input embeddings projected into Query (Q), Key (K), and Value (V) matrices of dimension d_k: Attention(Q,K,V) = softmax((Q * K^T) / sqrt(d_k)) * V. The dot product between Q and K calculates the similarity/compatibility scores between every token pair. Dividing by sqrt(d_k) stabilizes gradients by preventing large values that push softmax into regions with vanishing gradients. Softmax yields attention distribution weights, which compute a weighted sum of V vectors.',
      'Q: What I am looking for. K: What I offer/represent. V: What information I carry. Division by sqrt(d_k) prevents extreme softmax saturation.',
      'import torch, torch.nn.functional as F\ndef self_attention(Q, K, V):\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)\n    attn_weights = F.softmax(scores, dim=-1)\n    return torch.matmul(attn_weights, V)',
      'Transformers, LLMs, NLP, Attention'
    ],
    [
      'Deep Learning',
      'medium',
      'What causes the Vanishing / Exploding Gradient problem in Deep Networks, and how is it mitigated?',
      'During backpropagation, gradients are multiplied successively backwards through layers via the chain rule. If derivative terms are < 1 (common with Sigmoid or Tanh activations) or weight matrices have spectral norm < 1, gradients shrink exponentially toward 0 in early layers, halting learning. If derivatives/weights are > 1, gradients grow exponentially, causing numerical instability.',
      'Solutions: ReLU/GELU activations, Batch Normalization / Layer Normalization, Residual Skip Connections (ResNets), He/Xavier weight initialization, and gradient clipping.',
      '# Gradient clipping in PyTorch:\ntorch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)',
      'Optimization, Backprop, PyTorch'
    ],
    [
      'Statistics & Math',
      'medium',
      'What is the difference between Precision, Recall, and ROC-AUC? When would you optimize Recall over Precision?',
      'Precision = TP / (TP + FP) measures what proportion of positive identifications was actually correct. Recall = TP / (TP + FN) measures what proportion of actual positives was identified. ROC-AUC measures overall discriminative capability across all classification thresholds. You prioritize Recall over Precision in high-stakes false-negative scenarios like medical cancer screening or fraud detection where missing a true positive is catastrophic.',
      'High Precision = Few False Alarms (spam filter). High Recall = Catch Everything (cancer detection). F1-Score is the harmonic mean balancing both.',
      'from sklearn.metrics import precision_score, recall_score, roc_auc_score\nprec = precision_score(y_true, y_pred)\nrec = recall_score(y_true, y_pred)\nauc = roc_auc_score(y_true, y_prob)',
      'Metrics, Evaluation, Statistics'
    ],
    [
      'Statistics & Math',
      'easy',
      'Explain the Central Limit Theorem (CLT) and its practical relevance to Data Science.',
      'The Central Limit Theorem states that as sample size n increases (typically n >= 30), the sampling distribution of the sample mean approaches a normal distribution, regardless of the underlying population distribution, provided samples are independent and identically distributed (i.i.d.) with finite variance. In DS, CLT underpins parametric hypothesis testing, A/B test confidence intervals, and standard error estimation.',
      'Sample means are normally distributed even if individual raw data points are skewed or bimodal. Enables Z-tests and T-tests on large datasets.',
      '# Standard Error of the Mean = std / sqrt(n)\nsem = np.std(sample, ddof=1) / np.sqrt(len(sample))',
      'Probability, A/B Testing, Inference'
    ],
    [
      'Python & SQL',
      'medium',
      'Write and explain a SQL query using Window Functions to find the Top 2 highest-scoring models per category.',
      'Window functions like DENSE_RANK() or ROW_NUMBER() perform calculations across a set of table rows that are related to the current row without collapsing the rows into a single grouping.',
      'PARTITION BY groups the window, ORDER BY ranks within the window. Filter rank <= 2 in an outer CTE query.',
      'WITH RankedModels AS (\n  SELECT model_name, category, accuracy_score,\n         DENSE_RANK() OVER (PARTITION BY category ORDER BY accuracy_score DESC) as rk\n  FROM ml_experiments\n)\nSELECT model_name, category, accuracy_score\nFROM RankedModels\nWHERE rk <= 2;',
      'SQL, Analytics, Window Functions'
    ],
    [
      'ML System Design',
      'hard',
      'Design an End-to-End Retrieval-Augmented Generation (RAG) System for Enterprise Technical Documentation.',
      'Architecture: 1) Ingestion Pipeline: Parse docs, split into semantic chunks (300-500 tokens with 10% overlap), extract metadata, compute dense vector embeddings (e.g. text-embedding-3 or BGE-m3), and index into vector database (FAISS/Milvus/Qdrant) alongside hybrid BM25 full-text index. 2) Retrieval Pipeline: Query rewriting + Hybrid search (Vector + BM25) with Reciprocal Rank Fusion (RRF) and Cross-Encoder Re-ranking. 3) Generation: Construct system prompt with retrieved context, enforce citation grounding, and stream via LLM with output guardrails and hallucination checks.',
      'Key components: Semantic Chunking → Hybrid Sparse+Dense Retrieval → Cross-Encoder Re-Ranking → Grounded Prompting → Evaluation with RAGAS (Faithfulness, Answer Relevance).',
      '# Hybrid RAG retrieval pipeline:\n# 1. Dense embedding retrieval\n# 2. BM25 keyword matching\n# 3. Reciprocal Rank Fusion (RRF) re-scoring\n# 4. Cross-encoder re-ranking top 5 docs',
      'LLM, RAG, Architecture, System Design'
    ],
    [
      'ML System Design',
      'medium',
      'How do you detect and handle Data Drift and Concept Drift in production ML pipelines?',
      'Data Drift (Covariate Shift) occurs when input feature distribution P(X) changes while P(Y|X) remains constant. Concept Drift occurs when the statistical relationship between input and output P(Y|X) changes over time. Detection: Statistical tests (Kolmogorov-Smirnov for continuous, Chi-Square for categorical, Population Stability Index PSI > 0.25). Mitigation: Automated shadow model pipelines, dynamic retraining triggers, sliding-window training sets, and fallback rule engines.',
      'Data Drift: Inputs shift (e.g., user demographics change). Concept Drift: Ground truth rules change (e.g., consumer behavior shifts during economic changes). Use PSI and KS tests.',
      '# Population Stability Index (PSI):\n# PSI < 0.1: No change; 0.1 <= PSI <= 0.25: Moderate change; PSI > 0.25: Significant drift',
      'MLOps, Monitoring, Production'
    ],
    [
      'Python & SQL',
      'easy',
      'Why is Vectorization in NumPy/Pandas faster than pure Python for-loops?',
      'NumPy arrays are stored in contiguous memory blocks with a fixed homogeneous C data type. Vectorized operations execute compiled C code under the hood, leveraging CPU SIMD (Single Instruction, Multiple Data) instructions and memory caching, completely bypassing Python runtime type checking, reference counting, and interpreter overhead.',
      'Pure Python loops require object type checking & boxing on every iteration. NumPy executes optimized SIMD instructions in C.',
      '# 100x faster than for-loop:\nimport numpy as np\nresult = arr1 * arr2 + 10.0',
      'Python, NumPy, Performance'
    ]
  ];

  const insertAllQ = db.transaction(() => {
    for (const q of questions) {
      const info = insertQ.run(...q);
      // Initialize progress
      db.prepare('INSERT INTO user_question_progress (question_id, status) VALUES (?, ?)').run(info.lastInsertRowid, 'unprepared');
    }
  });
  insertAllQ();
}

function seedJobApplications(db) {
  const insertJob = db.prepare(`
    INSERT INTO job_applications (company, role, location, work_model, salary, status, applied_date, job_url, recruiter_contact, required_skills, match_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const jobs = [
    ['OpenAI Ecosystem Partner', 'AI / ML Engineer', 'San Francisco, CA', 'hybrid', '$140,000 - $175,000', 'interview', '2026-08-10', 'https://openai.com/careers', 'Sarah Jenkins (LinkedIn)', 'Python, PyTorch, LangChain, FAISS, Docker, FastAPI', 92, 'Technical screening passed. Preparing for live coding session on RAG architecture.'],
    ['Databricks', 'Associate Solutions Architect - ML', 'Remote', 'remote', '$130,000 - $160,000', 'oa', '2026-08-14', 'https://databricks.com/careers', 'Dave Miller', 'Python, SQL, Apache Spark, Databricks, Machine Learning', 85, 'Online assessment completed. Scored 100% on SQL section.'],
    ['Tesla', 'Machine Learning Vision Intern', 'Palo Alto, CA', 'onsite', '$55/hr', 'applied', '2026-08-16', 'https://tesla.com/careers', 'University Recruiting', 'Python, PyTorch, Computer Vision, OpenCV, C++', 78, 'Applied via university portal with custom resume highlighting CV projects.'],
    ['Spotify', 'Machine Learning Engineer - Personalization', 'New York, NY', 'hybrid', '$150,000 - $185,000', 'wishlist', null, 'https://spotify.com/careers', 'Recruiter InMail', 'Python, Scikit-learn, RecSys, MLOps, GCP, Docker', 88, 'Great match with recommendation systems and PyTorch experience. Need to review Graph Neural Networks.']
  ];

  const insertAllJobs = db.transaction(() => {
    for (const j of jobs) {
      insertJob.run(...j);
    }
  });
  insertAllJobs();
}

function seedDefaultResume(db) {
  const insertResume = db.prepare(`
    INSERT INTO resumes (title, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, template_name, education_json, experience_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const education = JSON.stringify([
    {
      degree: 'B.S. in Computer Science & Data Science',
      institution: 'University of Technology',
      graduation_year: 'Expected May 2026',
      gpa: '3.85 / 4.00',
      coursework: 'Machine Learning, Deep Learning, Distributed Systems, Data Structures, Linear Algebra, Probability & Statistics'
    }
  ]);

  const experience = JSON.stringify([
    {
      role: 'Machine Learning Research Assistant',
      company: 'AI & Vision Lab',
      location: 'Campus',
      dates: 'Jan 2025 – Present',
      bullets: [
        'Implemented transformer-based self-attention models in PyTorch for multi-modal medical image synthesis, achieving a 94.2% retrieval accuracy.',
        'Engineered scalable data processing pipeline in Python and Pandas handling 500k+ records with 45% reduction in preprocessing latency.',
        'Containerized deep learning deployment stack using Docker and FastAPI on AWS EC2, maintaining sub-120ms response time under peak load.'
      ]
    }
  ]);

  const summary = 'Results-driven Machine Learning & Data Science specialist with solid foundations in PyTorch, Python, and scalable Cloud ML deployments. Proven expertise in building end-to-end Retrieval-Augmented Generation (RAG) pipelines, deep learning architectures, and production MLOps workflows.';

  insertResume.run(
    'Primary DS/ML Resume',
    'Sharvin Neve',
    'sharvinneve67@gmail.com',
    '+1 (555) 342-8901',
    'San Francisco, CA (Open to Remote)',
    'linkedin.com/in/sharvin-neve',
    'github.com/Guts1005',
    'https://career-catalyst.dev',
    summary,
    'modern-ats',
    education,
    experience
  );
}

function seedCodingTracker(db) {
  const insertProfile = db.prepare(`
    INSERT INTO coding_profiles (platform, handle, tier, rank_info, solved_count, streak_days)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertProfile.run('Kaggle', 'sharvin_ds', 'Expert (Competitions & Notebooks)', 'Top 8% globally', 14, 18);
  insertProfile.run('LeetCode', 'Guts1005', 'Knight (Rating 1840)', 'Top 6.5%', 186, 24);
  insertProfile.run('StrataScratch', 'sharvin_ml', 'Advanced SQL & Python', 'Level 4 Mastery', 45, 9);

  const insertProblem = db.prepare(`
    INSERT INTO coding_problems (title, platform, category, difficulty, status, url, solution_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const problems = [
    ['LRU Cache Implementation', 'LeetCode', 'System Design / Data Structures', 'medium', 'solved', 'https://leetcode.com/problems/lru-cache/', 'Used doubly-linked list with hash map for O(1) get and put operations.'],
    ['Implement TF-IDF Vectorizer from Scratch', 'Kaggle', 'NLP / Algorithms', 'medium', 'solved', 'https://kaggle.com', 'Constructed sparse dictionary vocabulary matrix with smoothed log inverse document frequency.'],
    ['Department Top 3 Salaries (Window Function)', 'LeetCode', 'SQL & Databases', 'hard', 'solved', 'https://leetcode.com/problems/department-top-three-salaries/', 'Used DENSE_RANK() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC) in subquery.'],
    ['Backpropagation from Scratch in NumPy', 'Kaggle', 'Deep Learning Math', 'hard', 'solved', 'https://kaggle.com', 'Implemented 2-layer MLP forward pass, cross-entropy loss derivative, and chain rule weight updates.'],
    ['Find Median from Data Stream', 'LeetCode', 'Heap / Statistics', 'hard', 'in_progress', 'https://leetcode.com/problems/find-median-from-data-stream/', 'Maintained max-heap for lower half and min-heap for upper half.'],
    ['K-Means Clustering with Convergence Check', 'StrataScratch', 'Machine Learning Math', 'medium', 'solved', 'https://stratascratch.com', 'Vectorized Euclidean distance calculation and centroid reassignment loop until inertia < 1e-4.'],
    ['Continuous Subarray Sum', 'LeetCode', 'Arrays / Math', 'medium', 'solved', 'https://leetcode.com/problems/continuous-subarray-sum/', 'Utilized running prefix sum modulo k with hash map storing first seen index.'],
    ['User Session Activity Duration', 'StrataScratch', 'SQL & Databases', 'medium', 'solved', 'https://stratascratch.com', 'Calculated session start and end times using LAG() and SUM() window functions.']
  ];

  const insertAllProblems = db.transaction(() => {
    for (const p of problems) {
      insertProblem.run(...p);
    }
  });
  insertAllProblems();
}

function seedSalaryBenchmarks(db) {
  const insertBenchmark = db.prepare(`
    INSERT INTO salary_benchmarks (role, level, location, base_median, equity_median, bonus_median, total_comp_median)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const benchmarks = [
    ['Machine Learning Engineer', 'L3 / Junior', 'SF Bay Area / Silicon Valley', 145000, 45000, 15000, 205000],
    ['Machine Learning Engineer', 'L4 / Mid-Level', 'SF Bay Area / Silicon Valley', 185000, 95000, 25000, 305000],
    ['Machine Learning Engineer', 'L5 / Senior', 'SF Bay Area / Silicon Valley', 225000, 165000, 40000, 430000],
    ['Machine Learning Engineer', 'L3 / Junior', 'New York City, NY', 140000, 35000, 15000, 190000],
    ['Machine Learning Engineer', 'L4 / Mid-Level', 'New York City, NY', 175000, 80000, 25000, 280000],
    ['Machine Learning Engineer', 'L3 / Junior', 'US Remote / Hybrid', 130000, 30000, 12000, 172000],
    ['Generative AI / LLM Engineer', 'L4 / Mid-Level', 'SF Bay Area / Silicon Valley', 200000, 120000, 30000, 350000],
    ['Generative AI / LLM Engineer', 'L5 / Senior', 'SF Bay Area / Silicon Valley', 245000, 210000, 45000, 500000],
    ['Data Scientist', 'L3 / Junior', 'SF Bay Area / Silicon Valley', 135000, 35000, 12000, 182000],
    ['Data Scientist', 'L4 / Mid-Level', 'SF Bay Area / Silicon Valley', 168000, 75000, 20000, 263000],
    ['MLOps Engineer', 'L4 / Mid-Level', 'SF Bay Area / Silicon Valley', 178000, 85000, 22000, 285000],
    ['Quantitative AI Researcher', 'L4 / Mid-Level', 'New York City / Hedge Funds', 250000, 150000, 150000, 550000]
  ];

  const insertAll = db.transaction(() => {
    for (const b of benchmarks) {
      insertBenchmark.run(...b);
    }
  });
  insertAll();
}


