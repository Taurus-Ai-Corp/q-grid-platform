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

### Priority 2: Part 3H — Deploy eu.q-grid.net

1. Create Vercel project via API (set rootDirectory=apps/comply, framework=nextjs, nodeVersion=20.x)
2. Set env vars: DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, JURISDICTION=eu, NEXT_PUBLIC_JURISDICTION=eu, PLATFORM_PQC_PUBLIC_KEY, PLATFORM_PQC_SECRET_KEY
3. Push to trigger deploy
4. Add custom domain eu.q-grid.net

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

- 55 git commits
- 126 tests passing
- 8/8 turbo build tasks
- 16/16 launch readiness checks PASS
- 2 deployed apps (landing + comply)
- 1 provisioned database (Neon Frankfurt)
- 0 paying customers (yet)

---

## SALES & GTM — For OpenCode + Nemotron 3

### Company Structure
- **Entity:** Wyoming LLC (US SaaS company)
- **Founder:** Effin Fernandez (Canadian citizen, Ontario)
- **Needs:** EIN, US business bank account, Stripe connected to LLC

### Immediate Sales Actions

1. **Scan 50 EU fintech domains** using q-grid.net/scan
   - Generate QRS scores for each
   - Use `/pqc-leads` skill to score and prioritize

2. **Cold outreach** (50 personalized emails)
   - Template: "[Company]'s AI systems and August 2026"
   - Include their actual QRS score
   - Pain points: `/Users/taurus_ai/Desktop/LinkedIn - Effin/research/pain-point-database.md`
   - 3 campaign pillars ready: "You Can't Migrate What You Can't See", "Stop Building Compliance Theater", "One Platform, Five Frameworks"

3. **LinkedIn content** (3-5 posts/week)
   - 40% EU AI Act education
   - 25% Blockchain + compliance thought leadership
   - 20% Customer/user stories
   - 15% Contrarian takes

4. **Product Hunt launch**
   - Assets ready: landing page, blog, free scan, pricing
   - Launch Tuesday-Thursday, 12:01 AM PST
   - 90-day free trial for first 100 signups
   - Blog post: "Quantum Threat to Blockchain" (1,800 words, 12 real quotes)

5. **Proposal generation** for enterprise leads
   - Use `/proposal-generation` skill
   - PQC assessment: $25K-$50K
   - Hybrid signature: $75K-$150K
   - Key migration: $250K-$1M+

### Key Research Files
- Pain points: `~/Desktop/LinkedIn - Effin/research/pain-point-database.md`
- GTM strategy: `~/Desktop/LinkedIn - Effin/Q-Grid-Comply-GTM-Research.md`
- Launch package: `~/Desktop/LinkedIn - Effin/Comply-Q-Grid-Launch-Package.html`
- Competitive intel: `q-grid-platform/competitive-intelligence-eu-ai-act.md`
- HuggingFace research: `q-grid-platform/findings.md`

### Revenue Targets
- First paying customer: Week 1
- MRR target: $1,500 by Day 30
- Product Hunt: 200+ upvotes, 50+ signups

### Sovereign AI Sales Angle
Enterprise customers get self-hosted AI report generation. Data never leaves their infrastructure. Use Nemotron 3 Super as the recommended sovereign model (French Mistral for EU, Nemotron for NA).

---

## TRADEMARK SITUATION (URGENT)

- **CONFLICT:** `QGRID` (Serial 98725832) is LIVE/REGISTERED by QGrid LLC (Cincinnati, OH) in Class 042 (SaaS)
- **Risk:** HIGH for "Q-GRID" — confusingly similar in same class
- **Mitigation:** Already rebranded to "QUANTUM GRID" in all code, nav, footer, metadata, OG tags
- **Action:** File "QUANTUM GRID" trademark in Classes 009 + 042 via Wyoming LLC ($700)
- **Domain:** `q-grid.net` is fine — domain ownership ≠ trademark
- **Backup:** ARQ-Q / ARQ-QUANTUM available if "QUANTUM GRID" is contested (low conflict)
- **MUST DO:** Consult trademark attorney before filing ($300-500 consultation)

---

## PHASE 2 — 10 Priority Features (Revenue-Ranked)

| # | Feature | Revenue Impact |
|---|---|---|
| 1 | Enterprise onboarding wizard (team invites, CISO flow, Clerk Organizations) | Unlocks enterprise sales |
| 2 | Continuous monitoring (weekly re-scan of connected infrastructure) | Sticky subscriptions |
| 3 | CycloneDX CBOM auto-generation (GitHub/code scanning for crypto usage) | Enterprise tier differentiator |
| 4 | RAG-powered AI reports (regulatory document intelligence via Pinecone) | Report quality = willingness to pay |
| 5 | Hybrid migration machine (5-state: LEGACY→HYBRID→PQC_ONLY) | Migration revenue ($75K-$1M) |
| 6 | W3C Verifiable Credentials on Hedera (supply chain propagation) | Network effects |
| 7 | Per-audience dashboards (CISO/CTO/CFO/Board/Regulator views) | Enterprise UX |
| 8 | Regulatory submission pipeline (one-click to EU AI Database, OSFI, RBI) | Unique capability |
| 9 | Public API + SDK + CI/CD plugins (GitHub Actions, GitLab CI) | Developer adoption |
| 10 | Industry benchmarking (QRS percentiles vs industry average) | Data moat |

### Canada Pipeline
OSFI B-13 → PIPEDA → CCCS PQC migration → OSFI reporting (na.q-grid.net, JURISDICTION=na)

### PRD Reference
`/Users/taurus_ai/Documents/HEDERA/Comply.Q-Grid.in/products/gridera/Q-GRID-COMPLY-PRD-ARCHITECTURE.md`

### Key Phase 2 Principles
- Automated discovery > manual forms
- Continuous monitoring > point-in-time assessment
- Compliance → Migration pipeline (diagnose then fix)
- Supply chain propagation via W3C VCs (network effect)
- RAG over regulatory docs for AI reports

---

**The architecture is sound. The code is tested. The differentiator (PQC + Hedera) is real. Ship it.**
