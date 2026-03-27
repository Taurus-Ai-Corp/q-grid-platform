# Q-Grid Platform

Turborepo + pnpm mono-repo. Multi-geographic PQC compliance platform.

## Quick Start

```bash
pnpm install && pnpm build    # Build all (8 tasks, 37 tests)
pnpm --filter landing dev     # Landing at :3000 (dark mode)
pnpm --filter comply dev      # Comply at :3000 (light mode, needs Clerk keys)
pnpm test                     # Run all tests
```

## Architecture

- **2 apps**: `apps/landing` (q-grid.net, dark), `apps/comply` (comply.q-grid.{eu|net|in|ae}, light)
- **7 packages**: pqc-crypto, pqc-engine, jurisdiction, db, hedera, ui, tsconfig
- Same comply codebase deployed 4x with different `JURISDICTION` env var
- Spec: `docs/superpowers/specs/2026-03-25-q-grid-platform-design.md`
- EU Comply spec: `docs/superpowers/specs/2026-03-26-comply-eu-design.md`

## Key Decisions

- Next.js 16 with `proxy.ts` (not middleware.ts — Next.js 16 renamed it)
- Clerk v7 for auth (proxy.ts + clerkMiddleware)
- Light mode for comply (#F8F9FA bg, 8px radius), dark mode for landing (#0B0E14, 0px radius)
- Logo: Concept B Grid Mesh (3x3 nodes + diagonal lattice + Q tail)
- Sovereign AI: report generation supports cloud (AI Gateway) + self-hosted (Ollama/vLLM)
- PQC-everywhere: every artifact ML-DSA-65 signed + Hedera HCS anchored
- Fonts: DM Sans (body) + Jura (heading) + IBM Plex Mono (code) via CSS @import

## Comply App Routes (Phase 3 — in progress)

Public: `/` (EU landing), `/pricing` (EUR), `/sign-in`, `/sign-up`
Dashboard: `/dashboard` (live stats), `/dashboard/systems` (list), `/dashboard/systems/new` (register)
API: `GET|POST /api/systems`, `GET|DELETE /api/systems/[id]`
Auth: Clerk via proxy.ts, all /dashboard/* routes protected
Data: In-memory store for MVP — swap to Neon DB when provisioned
Risk classifier: `src/lib/risk-classifier.ts` (EU AI Act Annex III rule-based)

## Gotchas

- `proxy.ts` not `middleware.ts` — Next.js 16 deprecated middleware.ts
- Google Fonts via CSS `@import` in globals.css — `next/font/google` rate-limited in parallel turbo builds
- `@types/node` must be explicit devDep in each package — pnpm strict isolation breaks Vercel builds without it
- Vercel: set `rootDirectory=apps/landing` via API, auto-detect framework, Node 20.x
- Clerk keys in `apps/comply/.env.local` (gitignored, backed up in Recovery SSH)
- Platform signing keys in root `.env.local` (gitignored, backed up in Recovery SSH)
- Git co-author: ALWAYS `admin@taurusai.io`, NEVER local hostname
- `@noble/post-quantum` API: `ml_dsa65.keygen(seed)` needs explicit 32-byte seed, `ml_kem768.encapsulate()` returns `cipherText` (capital T)

## Cherry-Pick Sources (old repos, reference only)

- Assessment wizard: `Comply.Q-Grid.EU/client/src/pages/AssessmentWizard.tsx`
- EU sections: `Comply.Q-Grid.in/client/src/lib/jurisdictions/eu-assessment-sections.ts`
- Scoring engine: `TAURUS_AI_SAAS/products/gridera/web/src/lib/assessment-scoring.ts` (456 lines)
- Key rotation UI: `TAURUS_AI_SAAS/products/gridera/web/src/components/security/rotate-key-dialog.tsx`
- Dashboard layout: `Comply.Q-Grid.EU/client/src/layouts/DashboardLayout.tsx`
- Clerk config: `Comply.Q-Grid.EU/client/src/lib/clerk.ts`

## Testing

```bash
pnpm test                              # All tests (37 passing)
pnpm --filter @taurus/pqc-crypto test  # PQC crypto (13 tests)
pnpm --filter @taurus/jurisdiction test # Jurisdiction (13 tests)
pnpm --filter @taurus/pqc-engine test  # Scanner + QRS (11 tests)
```
