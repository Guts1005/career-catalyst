# 05. Supabase Integration & Database Verification

## 1. Overview & Connection Architecture

Catalyst OS utilizes Supabase (PostgreSQL Cloud) as its persistent database layer. In **Public Demonstration Mode**, the application operates with public anonymous read permissions and in-memory sample fallbacks.

* **Supabase Project Ref**: `uedfokzpsgajinewqyam`
* **Region**: `us-east-1` (AWS)
* **Client Library**: `@supabase/supabase-js` v2.48.1

---

## 2. Table Inventory & Execution Status

| Table Name | Purpose | Production Query Tested | Local Fallback Verified | Verification Classification |
| :--- | :--- | :--- | :--- | :--- |
| `skills` | Competency inventory & evidence tiers | `GET /api/skills` | Returns 7 default core systems skills | **TESTED AND VERIFIED (PASS)** |
| `projects` | Portfolio projects & tech stacks | `GET /api/projects` | Returns 3 Hopper/Triton projects | **TESTED AND VERIFIED (PASS)** |
| `project_milestones` | Granular sub-tasks per project | `GET /api/projects` (JOIN) | Mapped cleanly into parent `milestones` | **TESTED AND VERIFIED (PASS)** |
| `job_applications` | Pipeline Kanban tracking | `GET /api/jobs` | Returns Anthropic, NVIDIA, Cohere roles | **TESTED AND VERIFIED (PASS)** |
| `certifications` | Credential roadmap | `GET /api/certifications` | Returns NVIDIA DLI, AWS MLS-C01 | **TESTED AND VERIFIED (PASS)** |
| `resources` | Deep learning arXiv papers | `GET /api/resources` | Returns FlashAttention-2, DeepSeek-V3 | **TESTED AND VERIFIED (PASS)** |
| `salary_benchmarks` | Role compensation medians | `GET /api/salary-insights` | Returns Staff ML, Senior ML benchmarks | **TESTED AND VERIFIED (PASS)** |
| `coding_problems` | LeetCode/NeetCode problems | `GET /api/coding-tracker` | Returns CUDA GEMM, PagedAttention sims | **TESTED AND VERIFIED (PASS)** |
| `interview_questions` | Question bank & flashcards | `GET /api/interview-prep` | Returns Triton Online Softmax questions | **TESTED AND VERIFIED (PASS)** |
| `resumes` | JSON resume data | `GET /api/resume` | Returns Sharvin Neve benchmark resume | **TESTED AND VERIFIED (PASS)** |
| `user_question_progress` | Flashcard status tracking | `POST /api/interview-prep` | Sanitized & validated before write | **TESTED AND VERIFIED (PASS)** |
| `coding_profiles` | External profile stats | `GET /api/coding-tracker` | Default profile statistics | **TESTED AND VERIFIED (PASS)** |

---

## 3. Resilience & Failure Mode Probing

1. **Remote Cloud Network Probing**:
   - On the live deployment (`https://ccsharvin.vercel.app`), Supabase responds with HTTP 200 across all initialized tables (`skills`, `jobs`, `certifications`, `resources`, `ats-checker`).
2. **Local Offline / Paused DB Probing**:
   - When executed in isolated environments where DNS or remote Supabase connections are blocked, all read endpoints fail fast (<2.5s) via `timeoutFetch` and serve rich fallback data with HTTP 200 without throwing unhandled exceptions.
3. **Database Write Mutations (POST/PUT/DELETE)**:
   - Input sanitization, field whitelisting, enum validation, and payload length guards were tested and verified against mock and live routes.
   - *Note on Real Data Deletions*: Direct destructive mutations (`DELETE /api/projects/[id]`) on production database tables were omitted to avoid data loss on demo assets (**NOT VERIFIED — requires manual isolated environment testing**).
