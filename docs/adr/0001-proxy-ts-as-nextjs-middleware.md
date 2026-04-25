# ADR-0001: `apps/comply/src/proxy.ts` as Next.js middleware

- Status: Accepted
- Date: 2026-04-21
- Deciders: Taurus, Claude Code
- Context repo: Quantum-Grid-Mesh

## Context

The Clerk-enforced route protection for `apps/comply` lives in
`apps/comply/src/proxy.ts`, not `apps/comply/src/middleware.ts`.
During the 2026-04-17 P0 UX/QA investigation we initially assumed
this file name meant the middleware was **dead code** — Next.js
conventionally recognises middleware only at `src/middleware.ts`
(or a sibling `middleware.ts` at the app root). We were about to
rename the file to fix what looked like a broken protection layer.

The rename was aborted because ground-truth HTTP probes to
production revealed Clerk middleware is, in fact, firing:

```
$ curl -sI https://eu.q-grid.net/privacy
HTTP/2 404
x-clerk-auth-reason: protect-rewrite, dev-browser-missing
x-clerk-auth-status: signed-out
x-matched-path: /404
```

The `x-clerk-auth-reason: protect-rewrite` header is emitted only
when `auth.protect()` runs. It does run. The file works.

Subsequent `pnpm build --filter=comply` output confirmed the file
is registered:

```
comply:build: ƒ Proxy (Middleware)
```

Next.js 16's build pipeline recognises `proxy.ts` (alongside
`middleware.ts`) and labels it `Proxy (Middleware)` in the route
manifest. We have not located the upstream documentation for this
alias. An `rg` across `node_modules/next/dist` for `"proxy"` did
not produce a conclusive result within the P0 window.

## Decision

**Keep `apps/comply/src/proxy.ts`. Do not rename.**

Reasons:

1. It is executing correctly in production.
2. `compliance-matrix.ts:307` and `soc2-mapper.ts:65` reference
   it by name as part of SOC 2 control evidence. Renaming
   silently invalidates those attestation strings.
3. A rename would be a "safe refactor for convention" of a file
   whose convention-compliance is evidenced by Next.js itself.
   That is the textbook profile of a change that breaks on Friday.

## What we verified

- [x] Clerk middleware fires on prod routes matched by the
      `config.matcher` in `proxy.ts` (evidence: `x-clerk-auth-reason`
      header).
- [x] Next.js 16 build output labels the file `Proxy (Middleware)`
      (evidence: `pnpm build --filter=comply` route manifest).
- [x] No other file in `apps/comply` imports or re-exports
      `proxy.ts` (evidence: `rg "from.*proxy|require.*proxy"` in
      `apps/comply/src` returned only doc-string references).
- [x] No build script, `turbo.json` task, or `next.config.ts` hook
      renames, symlinks, or aliases the file (evidence: direct file
      read of all three).

## What we did NOT verify

- [ ] The upstream Next.js documentation or changelog entry that
      adds `proxy.ts` as a recognised middleware file name. A
      source-code spelunking pass in `node_modules/next/dist/build`
      is deferred to a follow-up.
- [ ] Whether this behaviour is stable across Next.js 16 minor
      versions or a side-effect of the current `next@^16.2.1`
      resolution.
- [ ] Behaviour on `next dev --turbopack` (the `dev` script uses
      Turbopack; the Vercel `build` uses Webpack. Turbopack may or
      may not recognise `proxy.ts`).

## Rollback plan

If a future Next.js upgrade drops `proxy.ts` recognition (signal:
CI build succeeds but `x-clerk-auth-reason` header disappears in
production):

1. `cp apps/comply/src/proxy.ts apps/comply/src/middleware.ts`
2. Update `apps/comply/src/lib/soc2-mapper.ts:65` and
   `apps/comply/src/lib/compliance-matrix.ts:307` to reference
   `middleware.ts` instead of `proxy.ts`.
3. Delete `apps/comply/src/proxy.ts`.
4. Redeploy and re-run the ground-truth probe:
   ```
   curl -sI https://eu.q-grid.net/dashboard | grep x-clerk-auth-reason
   ```
   Must include `protect-rewrite`.

## Watchdog

Any future edit that renames or deletes `apps/comply/src/proxy.ts`
MUST be accompanied by the rollback procedure above AND a
production probe confirming middleware still fires. Add this ADR
to `.codeowners` or a PR template to keep the knowledge surfaced.

## References

- Original investigation transcript: internal, 2026-04-17.
- Next.js documentation (middleware file conventions):
  https://nextjs.org/docs/app/building-your-application/routing/middleware
  (does not currently list `proxy.ts`; check after Next.js
  updates).
- Clerk v7 middleware behaviour:
  https://clerk.com/docs/references/nextjs/clerk-middleware
