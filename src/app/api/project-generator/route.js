import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const PROJECT_BLUEPRINTS = {
  llm_rag: [
    {
      name: 'Autonomous Multi-Agent RAG with Self-Correction & Graph Search',
      category: 'Generative AI & LLMs',
      difficulty: 'Advanced',
      summary: 'Production-ready RAG system utilizing LangGraph, Neo4j knowledge graphs, and hybrid BM25+dense vector search with adaptive query rewriting and hallucination self-grading.',
      dataset: 'ArXiv AI papers dataset / Custom financial earnings call transcripts',
      tech_stack: 'Python, LangChain, LangGraph, Neo4j, Qdrant, LLaMA 3, FastAPI, Docker',
      milestones: [
        'Ingest, chunk, and index documents into dual Vector + Graph DB',
        'Implement LangGraph state machine with self-correcting retrieval loop',
        'Add RAGAS evaluation framework and deploy FastAPI backend with Docker'
      ],
      impact: 'Reduced retrieval hallucinations by 42% and achieved a 96.4% factual accuracy score on benchmark evaluation.',
      star_bullets: [
        'Architected an autonomous multi-agent RAG pipeline using LangGraph and Neo4j, implementing dynamic graph-traversal and semantic re-ranking for complex technical documents.',
        'Engineered an automated self-correcting evaluation loop using RAGAS, reducing model hallucinations by 42% and increasing benchmark retrieval precision to 96.4%.',
        'Containerized and deployed the microservices architecture using Docker and FastAPI on AWS EC2 with sub-150ms P95 latency.'
      ]
    },
    {
      name: 'Fine-Tuned Small Language Model (SLM) for Clinical Entity Extraction',
      category: 'Generative AI & LLMs',
      difficulty: 'Intermediate',
      summary: 'Parameter-efficient fine-tuning (QLoRA) of Mistral-7B / Phi-3 on clinical medical transcripts to extract ICD-10 medical billing entities.',
      dataset: 'MIMIC-III / NCBI Disease HuggingFace Dataset',
      tech_stack: 'Python, PyTorch, HuggingFace Transformers, PEFT, QLoRA, vLLM, Streamlit',
      milestones: [
        'Preprocess and tokenize specialized medical corpus with custom entity masks',
        'Fine-tune 4-bit quantized Mistral-7B model using HuggingFace SFTTrainer and QLoRA',
        'Serve high-throughput inference using vLLM engine and build interactive web UI'
      ],
      impact: 'Surpassed GPT-3.5 baseline F1-score by 14% on domain-specific medical entity recognition while running on a single consumer GPU.',
      star_bullets: [
        'Fine-tuned a 4-bit quantized Mistral-7B model using QLoRA and HuggingFace PEFT on 100k+ clinical notes, outperforming GPT-3.5 zero-shot baseline by 14% in F1-score.',
        'Optimized production inference throughput by 3.8x utilizing vLLM engine with PagedAttention on a single NVIDIA RTX 4090 GPU.',
        'Built an end-to-end interactive diagnostic review dashboard using Streamlit and FastAPI for medical entity visualization.'
      ]
    }
  ],
  computer_vision: [
    {
      name: 'Real-Time Edge Defect Detection with YOLOv10 & TensorRT',
      category: 'Computer Vision',
      difficulty: 'Advanced',
      summary: 'Industrial surface anomaly detection pipeline processing 60+ FPS high-resolution camera feeds with TensorRT quantization and automated defect logging.',
      dataset: 'MVTec AD Industrial Anomaly Dataset (Kaggle)',
      tech_stack: 'Python, PyTorch, YOLOv10, OpenCV, TensorRT, ONNX Runtime, CUDA, Docker',
      milestones: [
        'Curate, augment, and annotate industrial surface defect dataset in COCO format',
        'Train custom YOLOv10 detector and convert weights to TensorRT INT8 precision',
        'Build real-time multi-threaded video inference pipeline with automated alert webhook'
      ],
      impact: 'Achieved 97.8% mAP@50 at 65 FPS real-time throughput on edge NVIDIA Jetson hardware.',
      star_bullets: [
        'Developed an end-to-end computer vision anomaly detection system using custom YOLOv10 and PyTorch, achieving 97.8% mAP@50 on industrial inspection datasets.',
        'Quantized deep neural networks to TensorRT INT8 precision, reducing model footprint by 65% and boosting inference speeds to 65 FPS on edge devices.',
        'Engineered multi-threaded video ingestion pipeline with OpenCV and CUDA acceleration, automating real-time defect alerts via Slack webhooks.'
      ]
    }
  ],
  mlops_engineering: [
    {
      name: 'Full-Lifecycle MLOps Platform with Feast Feature Store & Airflow',
      category: 'MLOps & Production',
      difficulty: 'Advanced',
      summary: 'End-to-end automated machine learning platform with feature storage, CI/CD retraining triggers, drift monitoring with Evidently AI, and Kubernetes deployment.',
      dataset: 'Credit Card Fraud Detection Dataset (Kaggle)',
      tech_stack: 'Python, Scikit-learn, XGBoost, Feast, Apache Airflow, MLflow, Evidently AI, Docker, Kubernetes',
      milestones: [
        'Set up Feast Feature Store for low-latency point-in-time correct online feature retrieval',
        'Implement automated training DAG in Apache Airflow with MLflow model registry versioning',
        'Deploy real-time prediction service with Evidently AI data drift and PSI monitoring alerts'
      ],
      impact: 'Automated 100% of the model retraining pipeline, reducing model deployment cycle from 2 weeks to 15 minutes.',
      star_bullets: [
        'Built a complete enterprise MLOps architecture using Feast Feature Store, MLflow, and Apache Airflow, standardizing feature sharing across training and inference.',
        'Automated CI/CD continuous retraining workflows and canary deployments on Kubernetes, cutting model release cycle times by 90%.',
        'Integrated real-time Population Stability Index (PSI) drift monitoring with Evidently AI, automatically triggering retraining upon detecting data distribution shifts.'
      ]
    }
  ],
  recsys_analytics: [
    {
      name: 'Two-Tower Deep Neural Recommendation System with Negative Sampling',
      category: 'Recommendation Systems',
      difficulty: 'Intermediate',
      summary: 'Scalable collaborative filtering and content-based recommendation engine for e-commerce with dual user/item candidate generation and ranking models.',
      dataset: 'Amazon Product Review & Clickstream Dataset',
      tech_stack: 'Python, PyTorch, TensorFlow Recommenders, Scikit-learn, Redis, FastAPI',
      milestones: [
        'Build sparse & dense feature embedding pipelines for user behavior and product metadata',
        'Train Two-Tower retrieval model with in-batch negative sampling and cross-network ranking',
        'Cache candidate vectors in Redis vector database for sub-10ms recommendation retrieval'
      ],
      impact: 'Improved recommendation Click-Through Rate (CTR) by 28% and NDCG@10 by 0.18 over traditional matrix factorization baselines.',
      star_bullets: [
        'Designed and trained a Two-Tower deep recommendation model in PyTorch, leveraging learned entity embeddings and in-batch negative sampling for candidate retrieval.',
        'Implemented a low-latency Redis vector store retrieval layer, delivering personalized top-20 recommendations in under 12ms under simulated load.',
        'Demonstrated a 28% increase in predicted Click-Through Rate (CTR) and superior NDCG@10 compared to standard Collaborative Filtering benchmarks.'
      ]
    }
  ]
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'all';

    let results = [];
    if (domain === 'all') {
      Object.values(PROJECT_BLUEPRINTS).forEach(list => {
        results = results.concat(list);
      });
    } else if (PROJECT_BLUEPRINTS[domain]) {
      results = PROJECT_BLUEPRINTS[domain];
    } else {
      Object.values(PROJECT_BLUEPRINTS).forEach(list => {
        results = results.concat(list);
      });
    }

    return NextResponse.json({ projects: results });
  } catch (error) {
    console.error('Failed to get project blueprints:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { name, category, summary, tech_stack, impact, milestones } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const { data: result, error: insertError } = await supabase.from('projects').insert([{
      name,
      description: summary || '',
      status: 'in_progress',
      tech_stack: tech_stack || '',
      category: category || 'Data Science',
      impact: impact || ''
    }]).select().single();
    
    if (insertError) throw insertError;

    const projectId = result.id;

    if (Array.isArray(milestones) && milestones.length > 0) {
      const milestoneInserts = milestones.map(m => ({
        project_id: projectId,
        name: m,
        completed: 0
      }));
      await supabase.from('project_milestones').insert(milestoneInserts);
    }

    await supabase.from('activity_log').insert([{
      action: 'created',
      entity_type: 'project',
      entity_id: projectId,
      entity_name: name
    }]);

    return NextResponse.json({ success: true, projectId, message: 'Project added to your portfolio!' });
  } catch (error) {
    console.error('Failed to import project blueprint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
