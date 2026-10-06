# Phase 0 — Tech Stack Specification

> **Reference**: DECISIONS.md D-001 through D-019 | This document specifies exact versions and packages.
> **Updated for v1.1:** Added Framer Motion (D-018), NASA API key, new service dependencies.

---

## Frontend (`apps/web/`)

| Category | Package | Version | Why |
|:---|:---|:---|:---|
| Framework | `react` | ^19.0.0 | Latest stable, concurrent features |
| Build | `vite` | ^6.0.0 | Fast HMR, ESM-native |
| Language | `typescript` | ^5.7.0 | Type safety |
| Routing | `react-router` | ^7.0.0 | Client-side SPA routing |
| CSS | `tailwindcss` | ^4.0.0 | Utility-first styling |
| Tailwind Vite Plugin | `@tailwindcss/vite` | ^4.0.0 | v4 Vite integration |
| Animation | `framer-motion` | ^11.0.0 | Evidence-guided visualization, page transitions, story animations (NEW D-018) |
| Charts | `recharts` | ^2.15.0 | React-native charting |
| HTTP Client | `ky` or native `fetch` | latest | Lightweight API calls |
| Icons | `lucide-react` | latest | Clean icon set |
| State | React Context + `useReducer` | built-in | No external state library for v1 |
| Graph (P2) | `@xyflow/react` | ^12.0.0 | React Flow for knowledge graph |

### Init Command
```bash
cd apps/web
npx -y create-vite@latest ./ --template react-ts
npm install react-router tailwindcss @tailwindcss/vite recharts lucide-react framer-motion
npm install -D @types/react @types/react-dom
```

---

## Backend (`services/api/`)

| Category | Package | Version | Why |
|:---|:---|:---|:---|
| Framework | `fastapi` | ^0.115.0 | Async, typed, auto-docs |
| Server | `uvicorn` | ^0.34.0 | ASGI server |
| Validation | `pydantic` | ^2.10.0 | v2 models, Settings |
| Database | `supabase` | ^2.12.0 | Supabase Python client |
| Async DB (optional) | `asyncpg` | ^0.30.0 | Direct async Postgres if needed |
| LLM | `google-genai` | latest | Gemini 2.5 Flash + embeddings |
| Logging | `structlog` | ^24.0.0 | Structured JSON logging |
| Env | `pydantic-settings` | ^2.7.0 | .env validation at boot |
| CORS | `fastapi.middleware.cors` | built-in | Cross-origin for Vite dev |
| Testing | `pytest` + `pytest-asyncio` | latest | Async test support |
| HTTP testing | `httpx` | latest | AsyncClient for FastAPI tests |

### Init Command
```bash
cd services/api
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install fastapi uvicorn pydantic pydantic-settings supabase google-genai structlog asyncpg
pip install -D pytest pytest-asyncio httpx
pip freeze > requirements.txt
```

---

## Pipelines (`pipelines/`)

| Category | Package | Version | Why |
|:---|:---|:---|:---|
| CV | `opencv-python-headless` | ^4.10.0 | No GUI needed for headless processing |
| Numerics | `numpy` | ^2.2.0 | Array operations |
| Data | `pandas` | ^2.2.0 | Data ingestion and normalization |
| Embeddings | `google-genai` | (shared with API) | text-embedding-004 |

### Init Command
```bash
cd pipelines
python -m venv .venv
pip install opencv-python-headless numpy pandas google-genai
pip freeze > requirements.txt
```

---

## Database (Supabase)

| Component | Spec |
|:---|:---|
| Engine | PostgreSQL 15 (Supabase managed) |
| Extension | pgvector (enable via Supabase dashboard → Extensions) |
| Embedding dim | 768 (text-embedding-004 output) |
| Tables | **10 tables** (v1.1 — was 6 in v1.0) |
| Connection | Via `supabase-py` client or `asyncpg` for direct SQL |
| Auth | Disabled for v1 (D-012) |

---

## Deployment

| Target | Platform | Config |
|:---|:---|:---|
| Frontend | Vercel | `apps/web/vercel.json` — build: `npm run build`, output: `dist/` |
| Backend | Railway | `services/api/Procfile` — `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Database | Supabase | Hosted, no deployment needed |

---

## Environment Variables

### `apps/web/.env.example`
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### `services/api/.env.example`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
NASA_API_KEY=your-nasa-api-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
LOG_LEVEL=INFO
```
