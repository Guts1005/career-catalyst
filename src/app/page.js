'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { showToast } from '@/components/Toast';

export default function HomePage() {
  const [activeRagTab, setActiveRagTab] = useState('sparse_dense');
  const [ragQuery, setRagQuery] = useState('How does FlashAttention-2 tile GPU shared memory to minimize HBM IO?');
  const [ragResult, setRagResult] = useState({
    denseCosine: '0.942',
    sparseScore: '0.887',
    latencyMs: '38ms',
    passage: 'FlashAttention-2 partitions the Q, K, V attention matrices into SRAM cache blocks, computing softmax scaling online without materializing the N x N attention matrix in high-bandwidth memory (HBM), yielding a 2.5x kernel speedup.',
  });

  const handleSimulateRag = () => {
    showToast('Cross-encoder re-ranking evaluated in 38ms', 'success');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('sharvinneve67@gmail.com');
    showToast('Email copied: sharvinneve67@gmail.com', 'success');
  };

  return (
    <div className={styles.landingRoot}>
      {/* ─── Hero Section (Off-White Canvas) ────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroMetaTop}>
          <span>CAREER INTELLIGENCE PLATFORM</span>
          <span>MACHINE LEARNING & SYSTEMS</span>
          <span>EST. 2026</span>
        </div>

        <div className={styles.heroMain}>
          <div>
            <h1 className={styles.heroDisplayTitle}>
              BUILD<br />
              YOUR<br />
              FUTURE.
            </h1>
          </div>

          <div className={styles.heroSubtitleBlock}>
            <p className={styles.heroDescription}>
              A rigorous career operating system for Machine Learning Engineers and Data Systems Architects. Plan competencies, benchmark compensation, and build verifiable portfolio proof.
            </p>

            <div className={styles.heroCtaGroup}>
              <Link href="/analytics" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '13.5px' }}>
                ENTER PLATFORM →
              </Link>
              <Link href="/resume-builder" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                VIEW ATS RESUME
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.heroMetaBottom}>
          <span>SHARVIN NEVE</span>
          <span>CHAPTER 01 / 06</span>
          <span>SCROLL FOR NARRATIVE ↓</span>
        </div>
      </section>

      {/* ─── Chapter 01: KNOW (Readiness & Profile) ─────────────────── */}
      <section className={styles.narrativeSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumber}>01 — KNOW</div>
            <h2 className={styles.chapterHeading}>
              KNOW<br />
              WHERE<br />
              YOU STAND.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescription}>
              Career advancement begins with unvarnished telemetry. Evaluate your technical readiness against actual hiring rubrics from frontier AI labs.
            </p>
          </div>
        </div>

        <div className={styles.knowGrid}>
          <div className={styles.bigStatBlock}>
            <div className={styles.statHugeNumber}>84%</div>
            <div className={styles.statHugeLabel}>Senior ML Engineer Profile Readiness</div>
          </div>

          <div className={styles.strengthList}>
            <div className={styles.strengthRow}>
              <span style={{ fontWeight: 600 }}>Transformer Architectures</span>
              <span className="tabular-num" style={{ color: 'var(--gray-500)' }}>94% Mastery</span>
            </div>
            <div className={styles.strengthRow}>
              <span style={{ fontWeight: 600 }}>Distributed Training (NCCL / Ray)</span>
              <span className="tabular-num" style={{ color: 'var(--gray-500)' }}>88% Mastery</span>
            </div>
            <div className={styles.strengthRow}>
              <span style={{ fontWeight: 600 }}>Vector Search & Indexing (Qdrant)</span>
              <span className="tabular-num" style={{ color: 'var(--gray-500)' }}>92% Mastery</span>
            </div>
            <div className={styles.strengthRow}>
              <span style={{ fontWeight: 600 }}>GPU Kernel Optimization (Triton)</span>
              <span className="tabular-num" style={{ color: 'var(--gray-500)' }}>76% Mastery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Chapter 02: IDENTIFY (Skill Gaps on Strict Black) ──────── */}
      <section className={styles.narrativeSectionDark}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumberDark}>02 — IDENTIFY</div>
            <h2 className={styles.chapterHeading} style={{ color: 'var(--white)' }}>
              FIND<br />
              WHAT’S<br />
              MISSING.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescriptionDark}>
              Identify the exact delta between your current capabilities and the requirements of Staff & Principal roles. Prioritize high-leverage competencies.
            </p>
          </div>
        </div>

        <div className={styles.gapListDark}>
          <div className={styles.gapRowDark}>
            <div>
              <div className={styles.gapNameDark}>Triton GPU Programming</div>
              <div style={{ fontSize: '11px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>● HIGH PRIORITY DELTA</div>
            </div>
            <div className={styles.gapTrackDark}>
              <div className={styles.gapFillDark} style={{ width: '42%' }} />
            </div>
            <div className={styles.gapPercentDark}>42% / 100%</div>
          </div>

          <div className={styles.gapRowDark}>
            <div>
              <div className={styles.gapNameDark}>vLLM Continuous Batching</div>
              <div style={{ fontSize: '11px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>● HIGH PRIORITY DELTA</div>
            </div>
            <div className={styles.gapTrackDark}>
              <div className={styles.gapFillDark} style={{ width: '58%' }} />
            </div>
            <div className={styles.gapPercentDark}>58% / 100%</div>
          </div>

          <div className={styles.gapRowDark}>
            <div>
              <div className={styles.gapNameDark}>Direct Preference Optimization (DPO)</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>● MEDIUM PRIORITY</div>
            </div>
            <div className={styles.gapTrackDark}>
              <div className={styles.gapFillDark} style={{ width: '70%' }} />
            </div>
            <div className={styles.gapPercentDark}>70% / 100%</div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <Link href="/skills" className="btn btn-dark" style={{ fontSize: '12.5px' }}>
            OPEN COMPETENCY MAP →
          </Link>
        </div>
      </section>

      {/* ─── Chapter 03: BUILD (Portfolio & Live Sandbox) ───────────── */}
      <section className={styles.narrativeSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumber}>03 — BUILD</div>
            <h2 className={styles.chapterHeading}>
              BUILD<br />
              PROOF.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescription}>
              Production systems are the only undeniable credential. Explore featured machine learning architectures with verified GitHub repositories.
            </p>
          </div>
        </div>

        <div className={styles.projectLedger}>
          <div className={styles.projectLedgerItem}>
            <span className={styles.projectIndex}>01</span>
            <div>
              <div className={styles.projectTitleText}>Enterprise Multi-Modal RAG Engine</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginTop: '2px' }}>
                PyTorch • Qdrant • BM25 • Cross-Encoders
              </div>
            </div>
            <div className={styles.projectSummaryText}>
              Sub-120ms retrieval over 1M+ technical documents with hybrid vector re-ranking.
            </div>
            <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              SOURCE ↗
            </a>
          </div>

          <div className={styles.projectLedgerItem}>
            <span className={styles.projectIndex}>02</span>
            <div>
              <div className={styles.projectTitleText}>Distributed GPU Inference Cluster</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginTop: '2px' }}>
                vLLM • FlashAttention-2 • CUDA • Docker
              </div>
            </div>
            <div className={styles.projectSummaryText}>
              High-throughput LLM serving handling 500k+ daily inference requests.
            </div>
            <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              SOURCE ↗
            </a>
          </div>

          <div className={styles.projectLedgerItem}>
            <span className={styles.projectIndex}>03</span>
            <div>
              <div className={styles.projectTitleText}>Real-Time Two-Tower Recommender</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--gray-500)', marginTop: '2px' }}>
                FAISS • Kafka • Scikit-learn • Python
              </div>
            </div>
            <div className={styles.projectSummaryText}>
              Sub-25ms candidate vector retrieval with automated online A/B scoring.
            </div>
            <a href="https://github.com/Guts1005" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              SOURCE ↗
            </a>
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <Link href="/projects" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
            VIEW ALL PORTFOLIO SYSTEMS →
          </Link>
        </div>
      </section>

      {/* ─── Chapter 04: DISCOVER (Job Matches on Black) ────────────── */}
      <section className={styles.narrativeSectionDark}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumberDark}>04 — DISCOVER</div>
            <h2 className={styles.chapterHeading} style={{ color: 'var(--white)' }}>
              FIND<br />
              THE RIGHT<br />
              OPPORTUNITY.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescriptionDark}>
              Track high-signal AI engineering roles across top frontier labs and benchmark total compensation percentiles.
            </p>
          </div>
        </div>

        <div className={styles.jobLedgerDark}>
          <div className={styles.jobLedgerRowDark}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Anthropic</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Staff AI Engineer • San Francisco</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gray-300)' }}>
              $240k - $320k Base + Equity
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--green)' }}>
              94% MATCH
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--purple)' }}>
              ● INTERVIEW ROUND
            </div>
          </div>

          <div className={styles.jobLedgerRowDark}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>OpenAI</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>ML Infrastructure Engineer • San Francisco</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gray-300)' }}>
              $220k - $290k Base + Equity
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--green)' }}>
              91% MATCH
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>
              ● APPLIED
            </div>
          </div>

          <div className={styles.jobLedgerRowDark}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Databricks</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Senior Systems Engineer • Mountain View</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--gray-300)' }}>
              $195k - $260k Base + Equity
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--green)' }}>
              88% MATCH
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--orange)' }}>
              ● FINAL ROUND
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
          <Link href="/job-tracker" className="btn btn-dark" style={{ fontSize: '12.5px' }}>
            OPEN PIPELINE KANBAN →
          </Link>
          <Link href="/salary-insights" className="btn btn-ghost" style={{ fontSize: '12.5px', color: 'var(--white)' }}>
            SALARY INTELLIGENCE →
          </Link>
        </div>
      </section>

      {/* ─── Chapter 05: PREPARE (Interview Diagnostic) ─────────────── */}
      <section className={styles.narrativeSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.chapterNumber}>05 — PREPARE</div>
            <h2 className={styles.chapterHeading}>
              BE<br />
              READY.
            </h2>
          </div>
          <div>
            <p className={styles.chapterDescription}>
              Simulate rigorous ML system design rounds, transformer math derivations, and architecture trade-offs.
            </p>
          </div>
        </div>

        <div className={styles.prepGrid}>
          <div className={styles.prepCard}>
            <div className={styles.prepCardCategory}>SYSTEM DESIGN</div>
            <div className={styles.prepCardQuestion}>Design a Real-Time Recommendation Engine with Two-Tower Embeddings</div>
            <div className={styles.prepCardAnswer}>
              Deconstruct user/item dual encoders, offline FAISS approximate nearest neighbor index building, and sub-10ms online re-ranking with cross-encoders.
            </div>
          </div>

          <div className={styles.prepCard}>
            <div className={styles.prepCardCategory}>DEEP LEARNING MATH</div>
            <div className={styles.prepCardQuestion}>Explain FlashAttention-2 Tiling & SRAM Memory Traffic</div>
            <div className={styles.prepCardAnswer}>
              Derive online softmax renormalization and demonstrate how fusing kernel computation reduces GPU High Bandwidth Memory read/write bottlenecks.
            </div>
          </div>

          <div className={styles.prepCard}>
            <div className={styles.prepCardCategory}>DISTRIBUTED SYSTEMS</div>
            <div className={styles.prepCardQuestion}>Compare Megatron Tensor Parallelism vs ZeRO-3 Sharding</div>
            <div className={styles.prepCardAnswer}>
              Evaluate intra-node matrix column/row splitting versus inter-node parameter, gradient, and optimizer state partitioning.
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <Link href="/interview-prep" className="btn btn-primary" style={{ fontSize: '12.5px' }}>
            OPEN QUESTION BANK (50+ QUESTIONS) →
          </Link>
        </div>
      </section>

      {/* ─── Chapter 06: ACT (Your Next Move on Black) ──────────────── */}
      <section className={styles.actSection}>
        <div className={styles.chapterNumberDark}>06 — ACT</div>
        <h2 className={styles.actDisplayTitle}>
          YOUR<br />
          NEXT<br />
          MOVE.
        </h2>

        <p style={{ fontSize: '16px', color: 'var(--gray-300)', maxWidth: '520px', lineHeight: 1.6, marginBottom: '24px' }}>
          Whether you are exploring the engineering workstation or reviewing Sharvin’s verified machine learning credentials, the platform is live and ready.
        </p>

        <div className={styles.actButtonGroup}>
          <Link href="/analytics" className="btn btn-dark" style={{ padding: '12px 26px', fontSize: '13.5px' }}>
            ENTER CATALYST OS →
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyEmail}
            style={{ padding: '12px 22px', fontSize: '13.5px' }}
          >
            COPY CONTACT EMAIL
          </button>
          <Link href="/resume-builder" className="btn btn-ghost" style={{ color: 'var(--white)', fontSize: '13.5px' }}>
            ATS RESUME →
          </Link>
        </div>
      </section>
    </div>
  );
}
