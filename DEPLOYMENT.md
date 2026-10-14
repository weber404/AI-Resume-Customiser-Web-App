# Production Deployment Guide: AI Resume Tailor

This guide provides end-to-end instructions for deploying the **AI Resume Tailor** application to production across various hosting architectures.

---

## 1. Architecture & Design Principles

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4. Supports standalone Node.js execution, static export, or Vercel edge runtime.
* **Backend:** FastAPI (Python 3.12+), Pydantic v2, PyMuPDF, python-docx, ReportLab, and Google Gen AI SDK.
* **Privacy Model:** Strictly in-memory and ephemeral. Resume content and job descriptions are never saved to disk, databases, browser storage (`localStorage`), or application logs. Data is transmitted to Google's Gemini API via the official Python SDK exclusively during AI tailoring requests.

---

## 2. Hosting Options Comparison

| Strategy | Recommended Providers | Setup Complexity | Estimated Cost | Operational Maintenance | Best Suited For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PaaS (Decoupled)** *(Recommended)* | **Frontend:** Vercel<br>**Backend:** Render or Railway | **Very Low** | Free to ~$7/mo | Zero (Automated CI/CD, SSL, and process recovery) | Fast production rollout, zero infrastructure overhead |
| **Container Platform** | Google Cloud Run, AWS ECS / App Runner, DigitalOcean App Platform | **Low–Medium** | Pay-per-request (~$5–$15/mo) | Minimal (Managed containers, auto-scaling, zero idle cost on Cloud Run) | Corporate compliance, unified cloud provider environments |
| **Self-Hosted VPS** | Hetzner Cloud, DigitalOcean, Linode + Docker Compose / Caddy | **Medium** | Fixed ~$4–$6/mo | Moderate (OS security updates, manual process monitoring) | Full infrastructure control, predictable fixed budget |

---

## 3. Environment Variables Reference

### Backend Environment Variables (`backend/.env`)

| Variable | Type | Default | Required in Production | Description |
| :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | string | `development` | **Yes** | Set to `production`. |
| `DEBUG` | boolean | `true` | **Yes** | Set to `false`. Disables stack traces and internal diagnostics in API errors. |
| `PORT` | integer | `8000` | Optional | Listening port for Uvicorn/ASGI server. |
| `FRONTEND_ORIGIN` | string | `http://localhost:3000` | **Yes** | Public HTTPS origin of the frontend (e.g. `https://resume-tailor.example.com`). |
| `ALLOWED_ORIGINS` | string | *(same as frontend)* | Optional | Comma-separated list of permitted CORS origins (e.g. staging or preview URLs). |
| `GEMINI_API_KEY` | string | `None` | **Yes** | Google Gemini API key. Stored only on backend; never exposed to client. |
| `GEMINI_MODEL` | string | `gemini-3.8-flash` | Optional | Gemini model name for structured analysis. |
| `GEMINI_TIMEOUT_SECONDS` | float | `120.0` | Optional | Upstream request timeout before returning HTTP 504 `LLM_TIMEOUT`. |
| `MAX_UPLOAD_SIZE_BYTES` | integer | `5242880` (5 MB) | Optional | Hard ceiling on uploaded file size during streaming. |
| `MIN_EXTRACTED_TEXT_CHARS` | integer | `50` | Optional | Text extraction threshold to detect and reject image-only scanned PDFs. |
| `RATE_LIMIT_ENABLED` | boolean | `true` | Optional | Enables in-memory sliding window rate limiting. |
| `RATE_LIMIT_TAILOR_REQUESTS_PER_MINUTE` | integer | `10` | Optional | Maximum tailoring requests per client IP per minute before returning HTTP 429. |

### Frontend Environment Variables (`frontend/.env.local`)

| Variable | Type | Default | Required in Production | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | string | `http://localhost:8000` | **Yes** | Public HTTPS URL of the backend API (e.g. `https://api.resume-tailor.example.com`). Do not include a trailing slash. |

---

## 4. Deployment Strategies

### Strategy A: Vercel (Frontend) + Render (Backend) [Recommended]

#### Step 1: Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Set the following configuration:
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
4. In **Environment Variables**, add:
   - `ENVIRONMENT=production`
   - `DEBUG=false`
   - `GEMINI_API_KEY=your_real_gemini_api_key`
   - `FRONTEND_ORIGIN=https://your-frontend-app.vercel.app`
   - `ALLOWED_ORIGINS=https://your-frontend-app.vercel.app`
   - `RATE_LIMIT_ENABLED=true`
   - `RATE_LIMIT_TAILOR_REQUESTS_PER_MINUTE=10`
5. Deploy and copy your backend URL (e.g. `https://resume-tailor-api.onrender.com`).
6. Set the Health Check path to `/api/health/live`.

#### Step 2: Deploy Frontend to Vercel
1. Create a new project on [Vercel](https://vercel.com) and import the repository.
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL=https://resume-tailor-api.onrender.com`
4. Deploy. Vercel automatically builds and deploys the Next.js App Router application.

---

### Strategy B: Docker & Docker Compose (Container Platform or Single Host)

The repository provides multi-stage, unprivileged, non-root Dockerfiles for both services.

#### 1. Build & Run with Docker Compose
```bash
# Set your Gemini API key in the shell
export GEMINI_API_KEY="your_real_gemini_api_key"

# Build and start both containers in production mode
docker compose up -d --build
```

#### 2. Health Check Validation
```bash
# Verify backend container health
curl -f http://localhost:8000/api/health/ready

# Verify frontend container response
curl -I http://localhost:3000/
```

---

### Strategy C: Standalone Linux Server (Ubuntu 22.04/24.04 with systemd & Caddy)

#### 1. Backend Service (`/etc/systemd/system/resume-tailor-backend.service`)
```ini
[Unit]
Description=AI Resume Tailor Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/resume-tailor/backend
EnvironmentFile=/var/www/resume-tailor/backend/.env
ExecStart=/var/www/resume-tailor/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 2. Frontend Service (`/etc/systemd/system/resume-tailor-frontend.service`)
```ini
[Unit]
Description=AI Resume Tailor Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/resume-tailor/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node /var/www/resume-tailor/frontend/.next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 3. Caddy Reverse Proxy (`/etc/caddy/Caddyfile`)
```caddy
# Automatically obtains and renews Let's Encrypt SSL certificates
resume-tailor.example.com {
    reverse_proxy 127.0.0.1:3000
}

api.resume-tailor.example.com {
    # Forward to FastAPI backend
    reverse_proxy 127.0.0.1:8000

    # Limit maximum request body size to 10 MB
    request_body {
        max_size 10MB
    }
}
```

---

## 5. Security & Reliability Highlights

1. **Defense-in-Depth Security Headers:** Every backend response automatically includes:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (in production)
2. **Abuse & Cost Throttling:** `POST /api/resume/tailor` is protected by an in-memory sliding window rate limiter (default: 10 requests per minute per IP), preventing automated script abuse from draining Gemini API credits.
3. **MIME & Size Enforcement:** Uploads stream in 64 KB chunks up to 5 MB, validating magic bytes (`%PDF` and `PK\x03\x04`) to prevent file extension spoofing.
4. **Sanitized Error Envelopes:** Standardized error models hide internal server traces and secrets while returning helpful, actionable messages to the user.
5. **Zero Disk Storage:** Resumes, job descriptions, extracted text, and generated exports are handled strictly in volatile RAM.

---

## 6. Post-Deployment Verification & Smoke Testing Checklist

Run these commands against your newly deployed production backend:

```bash
API_URL="https://api.resume-tailor.example.com"

# 1. Verify general health and version
curl -i -s "$API_URL/api/health"

# Expected: HTTP 200 with {"status":"ok","app_name":"AI Resume Tailor API","environment":"production",...}

# 2. Verify readiness probe
curl -i -s "$API_URL/api/health/ready"

# Expected: HTTP 200 with {"status":"ready","ai_service_configured":true}

# 3. Verify security headers
curl -I -s "$API_URL/api/health" | grep -iE "(x-frame-options|x-content-type-options|strict-transport-security)"

# 4. Verify CORS rejection for disallowed origin
curl -I -s -H "Origin: https://malicious-site.com" "$API_URL/api/health" | grep -i "access-control-allow-origin"
# Expected: Header should NOT match https://malicious-site.com

# 5. Verify rate limiter response
for i in {1..12}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$API_URL/api/resume/tailor" \
    -H "Content-Type: application/json" \
    -d '{"extracted_text":"test","job_description":"test"}'
done
# Expected: Returns 429 once the per-minute limit is exceeded
```
