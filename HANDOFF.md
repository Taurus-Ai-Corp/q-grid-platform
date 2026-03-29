# Q-Grid Platform — Agent Handoff Document

**From:** Claude Opus 4.6 (1M context)
**To:** OpenCode / Nemotron 3 Super
**Date:** 2026-03-29
**Session:** 2026-03-25 to 2026-03-29 (multi-day)

---

## Quick Start

```bash
cd /Users/taurus_ai/Documents/HEDERA/q-grid-platform
pnpm install && pnpm build    # 8 tasks, should all pass
pnpm test                     # 124 tests, should all pass
pnpm --filter landing dev     # Landing at :3000 (dark mode)
pnpm --filter comply dev      # Comply at :3000 (light mode, needs .env.local)
```

## What Exists

### Repository
- **GitHub:** `github.com/Taurus-Ai-Corp/q-grid-platform` (PUBLIC, 48 commits on main)
- **Mono-repo:** Turborepo + pnpm, 2 apps + 7 packages
- **Framework:** Next.js 16 with `proxy.ts` (NOT middleware.ts)

### Apps
1. **apps/landing** — Marketing site at `landing-phi-ashen.vercel.app` (DEPLOYED)
   - Pages: `/`, `/scan`, `/scan/results`, `/pricing`, `/blog`, `/blog/quantum-threat-blockchain`
   - Dark mode, 0px radius, DM Sans/Jura/IBM Plex Mono fonts

2. **apps/comply** — EU compliance app (BUILT, NOT YET DEPLOYED)
   - Auth: Clerk v7 (keys in `apps/comply/.env.local`)
   - Theme: Light mode (#F8F9FA), 8px radius, teal accent
   - 16 pages, 8 API routes
   - Database: Neon PostgreSQL in Frankfurt (eu-central-1)
   - Full assessment flow: register system → 6-section wizard → scoring → AI report → audit trail

### Packages
| Package | What | Tests |
|---|---|---|
| @taurus/pqc-crypto | ML-DSA-65 signing, ML-KEM-768, AES-256-GCM | 13 |
| @taurus/pqc-engine | SSL scanner, QRS scoring algorithm | 11 |
| @taurus/jurisdiction | Geo-detection (NA/EU/IN/AE), regulatory configs | 13 |
| @taurus/db | Drizzle schema, 11 tables, Neon connection | 0 |
| @taurus/hedera | HCS audit trails, HTS credentials | 0 |
| @taurus/ui | Brand components, Grid Mesh logo, tokens | 0 |
| @taurus/tsconfig | Shared TypeScript configs | 0 |

### Database
- **Provider:** Neon PostgreSQL v17
- **Project:** `q-grid-comply-eu` in `aws-eu-central-1` (Frankfurt)
- **Connection:** In `apps/comply/.env.local` and `Recovery SSH` backup folder
- **Schema:** 11 tables, all with PQC columns (pqc_hash, pqc_signature, hedera_tx_id, jurisdiction)
- **ORM:** Drizzle (queries in API routes with in-memory fallback when DATABASE_URL unset)

### Security
- Zod validation on all 6 mutation API routes
- CSP + X-Frame-Options + 4 more security headers in next.config.ts
- OWASP-enhanced XSS escaping
- Try/catch error handling on all 8 routes
- Platform ML-DSA-65 signing key generated (in .env.local, backed up)

### Tests
- 124 total (13 pqc-crypto + 13 jurisdiction + 11 pqc-engine + 87 comply app)
- Comply tests cover: risk classifier (18), scoring engine (17), Zod validation (31), report generator (21)

---

## What Needs to Be Done Next

### Priority 1: Part 3G — Stripe Billing (EUR)

Install `stripe` package. Create:
- `src/app/api/billing/checkout/route.ts` — Create Stripe checkout session
- `src/app/api/billing/portal/route.ts` — Create Stripe customer portal
- `src/app/api/webhooks/stripe/route.ts` — Handle payment events
- `src/app/(dashboard)/dashboard/settings/page.tsx` — Billing/plan management

Tiers: Starter €399/mo, Growth €899/mo, Enterprise custom.
Stripe webhook should log to audit trail.

### Priority 2: Part 3H — Deploy comply.q-grid.eu

1. Create Vercel project via API (set rootDirectory=apps/comply, framework=nextjs, nodeVersion=20.x)
2. Set env vars: DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, JURISDICTION=eu, NEXT_PUBLIC_JURISDICTION=eu, PLATFORM_PQC_PUBLIC_KEY, PLATFORM_PQC_SECRET_KEY
3. Push to trigger deploy
4. Add custom domain comply.q-grid.eu

### Priority 3: Schema Migrations

```sql
-- Add missing columns
ALTER TABLE assessments ADD COLUMN current_section integer DEFAULT 0;
ALTER TABLE assessments ADD COLUMN risk_level text;
ALTER TABLE assessments ADD COLUMN recommendations jsonb;
ALTER TABLE assessments ADD COLUMN key_findings jsonb;
ALTER TABLE assessments ADD COLUMN category_scores jsonb;
ALTER TABLE reports ADD COLUMN mode text DEFAULT 'template';
ALTER TABLE audit_trail ADD COLUMN user_id text;
```

### Priority 4: Nemotron 3 Super Integration

The sovereign AI architecture is already built. To add Nemotron:

1. Install Nemotron in Ollama: `ollama pull nemotron:super`
2. In org settings, set:
   - `aiProvider: 'sovereign'`
   - `sovereignEndpoint: 'http://localhost:11434/v1'`
   - `sovereignModel: 'nemotron:super'`
3. The `SovereignReportGenerator` in `src/lib/report-generator.ts` will use it automatically
4. No code changes needed — the OpenAI-compatible API format works with Ollama/vLLM/TensorRT-LLM

### Priority 5: Rate Limiting

- Provision Upstash Redis
- Install `@upstash/ratelimit @upstash/redis`
- Add rate limiting to proxy.ts or individual routes

---

## Key Gotchas

1. **proxy.ts not middleware.ts** — Next.js 16 renamed it. Clerk v7 works with proxy.ts.
2. **Google Fonts via CSS @import** — `next/font/google` rate-limited in parallel turbo builds
3. **@types/node must be explicit** — pnpm strict isolation breaks Vercel builds without it
4. **Vercel rootDirectory via API** — CLI can't set it, must use `PATCH /v9/projects/{id}`
5. **Git co-author: ALWAYS admin@taurusai.io** — NEVER local hostname
6. **Show all visual changes to user before committing** — mandatory approval gate
7. **Sovereign AI is mandatory** — compliance products must offer self-hosted AI option

---

## File Locations

| What | Path |
|---|---|
| Platform spec | `docs/superpowers/specs/2026-03-25-q-grid-platform-design.md` |
| EU comply spec | `docs/superpowers/specs/2026-03-26-comply-eu-design.md` |
| Phase 2 ecosystem plan | `docs/superpowers/specs/PHASE-2-ECOSYSTEM.md` |
| Competitive intelligence | `competitive-intelligence-eu-ai-act.md` |
| HuggingFace research | `findings.md` |
| Landing page reference | `/Users/taurus_ai/Documents/HEDERA/apps/taurusai-io/playground-q-grid-landing.html` |
| Pain point research | `/Users/taurus_ai/Desktop/LinkedIn - Effin/research/` |
| Clerk keys | `apps/comply/.env.local` + `Recovery SSH` backup |
| Platform PQC keys | `.env.local` + `Recovery SSH` backup |
| Neon DB credentials | `apps/comply/.env.local` + `Recovery SSH` backup |
| Global unblock skill | `~/.claude/skills/unblock-research.md` |
| Token efficiency hook | `~/.claude/hooks/token-efficiency.md` |

---

## Metrics

- 48 git commits
- 124 tests passing
- 8/8 turbo build tasks
- 41 source files in comply app
- 8 API routes
- 11 database tables
- 6 EU AI Act assessment sections (18 questions)
- 3 report generation modes (template/cloud/sovereign)
- 1 deployed app (landing)
- 1 provisioned database (Neon Frankfurt)
- 0 paying customers (yet)

---

**The architecture is sound. The code is tested. The differentiator (PQC + Hedera) is real. Ship it.**
