# AI Resume Tailor

A full-stack web application designed to tailor resumes for specific job descriptions using LLMs, preserving 100% truthfulness of the candidate's actual experience while identifying missing keywords separately.

---

## 1. Project Structure

```
Resume Customiser Web App/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entrypoint with CORS & error handlers
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── health.py # GET /api/health route
│   │   │       └── resume.py # Ingestion, tailoring, & export routes
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py     # Pydantic Settings & environment config
│   │   │   └── exceptions.py # Structured AppException class
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py     # ErrorResponse, ErrorDetail, HealthResponse
│   │   │   ├── resume.py     # ResumeExtractionResponse, ResumeData contracts
│   │   │   └── tailor.py     # Tailoring request contract
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── parser/       # Upload verification & document text extraction
│   │       ├── llm/          # Google Gemini structured output client
│   │       └── exporter/     # In-memory document generation
│   │           ├── __init__.py
│   │           ├── filename.py     # Safe ASCII filename sanitizer
│   │           ├── pdf_exporter.py # ReportLab ATS-compliant PDF generator
│   │           └── docx_exporter.py# python-docx ATS-compliant DOCX generator
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_config.py         # Configuration & environment unit tests
│   │   ├── test_health.py         # Health endpoint & CORS unit tests
│   │   ├── test_resume_extract.py # File ingestion & extraction unit tests
│   │   ├── test_schemas.py        # Pydantic validation & contract tests
│   │   ├── test_tailor.py         # AI tailoring service & prompt isolation tests
│   │   └── test_export.py         # PDF & DOCX export verification tests
│   ├── .env.example          # Environment variable template
│   ├── .env                  # Local development environment (git-ignored)
│   ├── .gitignore
│   ├── pyproject.toml        # Backend project metadata & test config
│   └── requirements.txt      # Pinned dependency requirements
│
├── frontend/                 # Next.js 16 App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css   # Tailwind CSS styles
│   │   │   ├── layout.tsx    # App root layout & SEO metadata
│   │   │   └── page.tsx      # Main application view with end-to-end tailoring workflow
│   │   ├── components/
│   │   │   ├── HealthCheck.tsx # Live API connectivity status component
│   │   │   └── workflow/       # Tailoring workflow UI components
│   │   │       ├── FileUploadZone.tsx        # Drag-and-drop & native file upload
│   │   │       ├── JobDescriptionInput.tsx   # JD textarea with live counter
│   │   │       ├── TailoredResumeView.tsx    # Full tailored ATS resume presentation
│   │   │       ├── MissingKeywordsPanel.tsx  # Segregated missing keywords with advisory
│   │   │       └── ErrorAlert.tsx            # Contextual error banner with code badge
│   │   ├── lib/
│   │   │   ├── api.ts        # Type-safe API client utility (extract & tailor)
│   │   │   └── validation.ts # Client-side file & input validation rules
│   │   └── types/
│   │       ├── common.ts     # Error and health response TypeScript contracts
│   │       ├── resume.ts     # ResumeExtractionResponse & structured resume contracts
│   │       └── index.ts      # Type exports
│   ├── tests/
│   │   └── workflow.test.ts  # Node test runner suite for validation & flow
│   ├── .env.example          # Frontend environment template
│   ├── .env.local            # Frontend local environment (git-ignored)
│   ├── .gitignore
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tsconfig.json         # Strict TypeScript compiler options & aliases
│   └── eslint.config.mjs     # ESLint configuration
│
├── .gitignore                # Global workspace gitignore
└── README.md                 # Project documentation
```

---

## 2. Prerequisites

* **Operating System:** macOS (Apple Silicon or Intel)
* **Python:** 3.11+ (Python 3.14 verified)
* **Node.js:** v20+ (Node v26 verified)
* **npm:** 10+ (npm 11 verified)

---

## 3. Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Key configuration values:
- `ENVIRONMENT`: Set to `development` or `production`.
- `DEBUG`: Set to `true` for development debugging.
- `PORT`: Default backend port is `8000`.
- `FRONTEND_ORIGIN`: Permitted CORS origin, default `http://localhost:3000`.
- `MAX_UPLOAD_SIZE_BYTES`: Max file upload limit, default `5242880` (5 MB).
- `MIN_EXTRACTED_TEXT_CHARS`: Conservative minimum non-whitespace text threshold for scanned document detection (default `50`).
- `GEMINI_API_KEY`: *(Optional for Phases 1 & 2; required in Phase 3+)* Google Gemini API key.
- `GEMINI_MODEL`: Default LLM model name (e.g. `gemini-3.8-flash`).

### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```
Key configuration values:
- `NEXT_PUBLIC_API_URL`: Backend base URL, default `http://localhost:8000`.

---

## 4. API Endpoints

### 1. Health Checks & Probes
* **General Health:** `GET /api/health`
* **Response (HTTP 200):**
  ```json
  {
    "status": "ok",
    "app_name": "AI Resume Tailor API",
    "environment": "development",
    "version": "0.1.0",
    "gemini_configured": true
  }
  ```
* **Liveness Probe:** `GET /api/health/live` (Returns `{"status": "alive"}`)
* **Readiness Probe:** `GET /api/health/ready` (Returns `{"status": "ready", "environment": "...", "ai_service_configured": true}`)


### 2. Resume File Extraction
* **Endpoint:** `POST /api/resume/extract`
* **Content-Type:** `multipart/form-data`
* **Form Field:** `file` (Binary file: `.pdf` or `.docx`)

#### Success Response Shape (HTTP 200)
```json
{
  "filename": "candidate_resume.pdf",
  "file_type": "pdf",
  "file_size_bytes": 104857,
  "extracted_text": "Jane Doe\nSenior Backend Engineer\n...",
  "character_count": 1850
}
```

### 3. AI Resume Tailoring
* **Endpoint:** `POST /api/resume/tailor`
* **Content-Type:** `application/json`

#### Request Payload
```json
{
  "extracted_text": "Jane Doe\nSenior Backend Engineer at Acme Corp\nPython, Docker, SQL",
  "job_description": "We are seeking a Senior Backend Engineer proficient in Python, FastAPI, and Kubernetes."
}
```

#### Success Response Shape (HTTP 200)
```json
{
  "tailored_resume": {
    "contact": {
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 555-0123",
      "location": "San Francisco, CA",
      "linkedin_url": "https://linkedin.com/in/janedoe",
      "portfolio_url": null,
      "github_url": "https://github.com/janedoe"
    },
    "professional_summary": "Senior Backend Engineer with 7+ years of experience designing high-throughput distributed systems in Python and FastAPI.",
    "skills": [
      {
        "category": "Languages & Frameworks",
        "skills": ["Python", "FastAPI", "SQL"]
      },
      {
        "category": "Cloud & Infrastructure",
        "skills": ["Docker"]
      }
    ],
    "experience": [
      {
        "title": "Senior Backend Engineer",
        "company": "Acme Corp",
        "location": "San Francisco, CA",
        "start_date": "Jan 2021",
        "end_date": "Present",
        "is_current": true,
        "bullet_points": [
          "Engineered distributed REST APIs with FastAPI, reducing P99 latency by 40%."
        ],
        "technologies_used": ["Python", "FastAPI", "Docker"]
      }
    ],
    "projects": [],
    "education": [],
    "certifications": []
  },
  "missing_keywords": [
    {
      "keyword": "Kubernetes",
      "category": "Container Orchestration",
      "context_or_reason": "Required for microservice deployments, but not evidenced in source resume.",
      "suggested_action": "Add to your resume only if you possess verified experience with Kubernetes."
    }
  ],
  "alignment_score": 85,
  "summary_notes": "Realigned professional summary and experience bullet points to emphasize distributed systems and FastAPI."
}
```

### 4. Export ATS PDF Resume
* **Endpoint:** `POST /api/resume/export/pdf`
* **Content-Type:** `application/json`
* **Payload:** `TailoredResumeResponse` (validated schema)
* **Response (HTTP 200):** Binary PDF (`application/pdf`) with `Content-Disposition: attachment; filename="{Candidate_Name}_Tailored_Resume.pdf"`.
* **Features:** Single-column ATS layout, typography built with Helvetica, headings with `keepWithNext=True` preventing orphan headers, in-memory stream without disk persistence.

### 5. Export ATS Word DOCX Resume
* **Endpoint:** `POST /api/resume/export/docx`
* **Content-Type:** `application/json`
* **Payload:** `TailoredResumeResponse` (validated schema)
* **Response (HTTP 200):** Binary OpenXML DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`) with `Content-Disposition: attachment; filename="{Candidate_Name}_Tailored_Resume.docx"`.
* **Features:** Native Word `'List Bullet'` styles, standardized 0.5-inch margins, Arial typography, in-memory stream without disk persistence.

#### Standard Error Response Envelope
On failure, all endpoints return the project's standardized error envelope:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly explanation of the issue.",
    "details": null
  }
}
```

#### Main Error Cases & HTTP Status Codes
| HTTP Status | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| **400 Bad Request** | `EMPTY_FILE` | Uploaded file is empty (0 bytes) or filename is missing |
| **400 Bad Request** | `FILE_TYPE_MISMATCH` | Magic bytes do not match extension (e.g. plain text renamed to `.pdf`) |
| **400 Bad Request** | `CORRUPT_DOCUMENT` | Malformed PDF or damaged ZIP/DOCX package |
| **400 Bad Request** | `NO_EXTRACTABLE_TEXT` | Blank PDF or DOCX without selectable text |
| **400 Bad Request** | `SCANNED_PDF_DETECTED` | Image-only/scanned PDF without selectable text (OCR not supported) |
| **400 Bad Request** | `VALIDATION_ERROR` | Empty/whitespace-only input or payload exceeds character limits |
| **413 Payload Too Large** | `FILE_TOO_LARGE` | File exceeds configured limit (5 MB) during streaming |
| **415 Unsupported Media Type** | `UNSUPPORTED_FILE_TYPE` | Extension is not `.pdf` or `.docx` (e.g. `.txt`, `.pages`) |
| **500 Internal Server Error** | `EXPORT_FAILED` | Internal exception rendering PDF or DOCX binary stream |
| **503 Service Unavailable** | `CONFIGURATION_ERROR` | Server lacks `GEMINI_API_KEY` when tailoring is requested |
| **502 Bad Gateway** | `LLM_PROVIDER_ERROR` | Provider API error or communication failure |
| **502 Bad Gateway** | `LLM_MALFORMED_OUTPUT` | Provider returned invalid or non-JSON output |
| **502 Bad Gateway** | `LLM_SCHEMA_VALIDATION_ERROR`| Output failed strict Pydantic resume schema validation |
| **504 Gateway Timeout** | `LLM_TIMEOUT` | Provider generation timed out (configured via `GEMINI_TIMEOUT_SECONDS`) |

---

## 5. External AI Processing & Data Privacy Note

> [!IMPORTANT]
> **Data Handling & Third-Party Processing:**
> - Resume text and job descriptions are processed transiently in server memory and are **never saved to disk, cached in a database, or written to server logs**.
> - When tailoring is invoked (`POST /api/resume/tailor`), the extracted resume text and job description are transmitted securely via the official Google Gen AI Python SDK to **Google's Gemini API** for LLM analysis.
> - Processing by Gemini is subject to [Google's API Terms of Service](https://ai.google.dev/terms) and applicable privacy commitments.

---

## 6. Backend Setup & Startup (macOS)

### 1. Initialize Virtual Environment & Install Dependencies
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Start Backend Development Server
```bash
# Inside backend/ with venv activated:
uvicorn app.main:app --reload --port 8000
```
Or run directly using the venv python binary:
```bash
./.venv/bin/uvicorn app.main:app --reload --port 8000
```

* **Health Endpoint:** `http://localhost:8000/api/health`
* **Extraction Endpoint:** `http://localhost:8000/api/resume/extract`
* **Tailoring Endpoint:** `http://localhost:8000/api/resume/tailor`
* **Interactive API Documentation:** `http://localhost:8000/docs`

---

## 7. Frontend Setup & Startup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application with real-time backend connectivity checks.

### 3. End-to-End User Workflow
1. **Resume Ingestion:** Drag and drop or browse to select a `.pdf` or `.docx` resume file (up to 5 MB). View filename and formatted size, with one-click remove and replace actions.
2. **Job Description Input:** Paste the target job description into the auto-counting textarea (supports up to 25,000 characters).
3. **Validation & Pre-flight Checks:** Client-side checks ensure non-empty inputs and valid file parameters, while treating backend verification as authoritative.
4. **Sequential Processing:** Clicking **"Tailor My Resume"** triggers:
   - *Step 1/2:* `POST /api/resume/extract` sends the multipart upload to extract text.
   - *Step 2/2:* `POST /api/resume/tailor` feeds the extracted text and target job description to Gemini for ATS optimization.
5. **Results Presentation:**
   - **ATS Resume View:** Contact info, tailored professional summary, categorized skills, work experience with highlighted impact bullets, projects, education, and certifications.
   - **Transparent Alignment Score:** Displayed as an approximate content match indicator (not a hiring probability), handling missing/null scores gracefully.
   - **Missing Keywords Panel:** Visually segregated suggestions with an explicit candidate advisory stating keywords should only be added if the user possesses verifiable experience.
6. **Iteration & Privacy:** Reset or re-edit job descriptions and resumes seamlessly. No resume or job data is persisted in browser storage (`localStorage`, `sessionStorage`, or cookies).

---

## 8. Testing & Quality Verification Commands

### Run Backend Tests (pytest)
```bash
cd backend
./.venv/bin/pytest -v
```
The test suite covers:
1. Valid text-based PDF extraction
2. Valid DOCX with paragraphs extraction
3. DOCX containing tables extraction (preserves row/cell structure)
4. Empty upload (0 bytes)
5. Unsupported file extensions
6. File type / content mismatch (magic byte validation)
7. Upload exceeding configured size limit during streaming
8. Corrupt PDF documents
9. Corrupt DOCX documents
10. Empty DOCX documents without usable text
11. Blank PDF and scanned/image-only PDFs
12. Character count accuracy and response schema validation
13. Standard error envelope structure across all error paths
14. Health check and CORS functionality
15. Start-up and config loading without a Gemini API key
16. Valid resume tailoring request returning structured response
17. Missing or blank extracted text validation
18. Missing or blank job description validation
19. Payload length limit validation
20. Missing Gemini API key returning clear HTTP 503 `CONFIGURATION_ERROR`
21. Parsing and Pydantic validation of provider output
22. Malformed JSON handling from provider
23. Schema-invalid output handling from provider
24. Provider timeout handling
25. Provider API failure handling
26. Strict segregation of missing keywords from established resume skills
27. Entity preservation (employers, titles, dates)
28. Prompt-injection defense and untrusted content isolation
29. PDF export format, headers, and text verification via PyMuPDF
30. DOCX export format, headers, and text verification via python-docx
31. Safe filename sanitization with extension enforcement
32. Empty and optional sections handling in exports
33. Strict request validation preventing invalid export payloads
34. Multi-page document generation without content clipping
35. Zero persistent disk output verification (strictly in-memory buffers)
36. Defense-in-depth HTTP security headers (nosniff, DENY, strict-origin, permissions-policy)
37. Liveness (`/api/health/live`) and readiness (`/api/health/ready`) probe functionality
38. In-memory sliding window rate limiter logic and threshold blocking
39. HTTP 429 `RATE_LIMIT_EXCEEDED` and `Retry-After` header enforcement
40. Sanitized unhandled server exception logging without secret leakage

### Run Frontend Tests, Linting & Production Build
```bash
cd frontend

# Run frontend unit tests (Node native test runner with type stripping - 14 passing tests)
npm test

# Run ESLint check (0 errors, 0 warnings)
npm run lint

# Build production bundle with Next.js Turbopack
npm run build
```
The frontend test suite covers:
1. File validation for `.pdf` and `.docx` extensions and sizes
2. Job description input content validation and empty state enforcement
3. Formatted human-readable file size calculations
4. `ApiError` structure, status code mapping, and response envelopes
5. Workflow request sequencing between extraction and tailoring
6. Contract integrity and strict isolation of missing keywords
7. Graceful degradation when optional sections are omitted or null
8. Content-Disposition filename parsing across standard, quoted, and UTF-8 RFC 5987 formats
9. PDF and DOCX export API request generation and blob handling
10. Export error recovery and retry flow
11. Job description exact boundary validation (25,000 characters maximum)
12. Privacy and security check verifying zero persistent browser storage (`localStorage` / `sessionStorage`)
13. Rate limit error handling verifying HTTP 429 and `retry_after_seconds` capture
14. Production health check model with `gemini_configured` readiness flag

---

## 9. Production Deployment & Orchestration

For comprehensive deployment instructions, hosting trade-offs, and cloud provider walkthroughs, refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md).

### Quick Production Launch with Docker Compose
```bash
# Export your Gemini API key
export GEMINI_API_KEY="your_api_key_here"

# Build and start containerized frontend & backend
docker compose up -d --build
```

---

## 10. Project Roadmap & Status

- [x] **Phase 1:** Project Setup, Architecture & Shared Contracts
- [x] **Phase 2:** Resume Ingestion, Validation & Text Extraction (PyMuPDF & python-docx)
- [x] **Phase 3:** AI-Powered Resume Tailoring Backend (Google Gemini Gen AI SDK)
- [x] **Phase 4:** Frontend Resume Tailoring Interactive Workflow (Next.js 16 App Router)
- [x] **Phase 5:** PDF & DOCX Document Generation & Export Services (ReportLab & python-docx)
- [x] **Phase 6:** UI Polish, Accessibility, and End-to-End Verification
- [x] **Phase 7:** Production Readiness and Deployment
