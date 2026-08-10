#!/usr/bin/env bash
#
# GRIDERA brand guard — blocks commits that introduce deprecated/space-form brand names.
#
# Enforces the mandatory brand rule:
#   - Product names MUST use pipe form: GRIDERA|Comply, GRIDERA|Scan, GRIDERA|Migrate, etc.
#   - FORBIDDEN: "Q-Grid Comply" / "Q-Grid Platform" / "Q-Grid Scanner"
#   - FORBIDDEN: space-form "GRIDERA Comply" (no pipe) for any product verb
#
# Scans ONLY staged additions (won't fail on pre-existing legacy elsewhere).
# Does NOT touch: q-grid.net domains, the q-grid-platform dir/package, the repo name,
# or "GRIDERA platform" (lowercase p — not a product name).
#
# Bypass for a legitimate edge case: add "brand-allow" on the same line, or commit
# with `git commit --no-verify`.
#
# Usage: scripts/check-brand.sh            # checks staged changes (pre-commit)
#        scripts/check-brand.sh --all      # checks the whole tracked tree (CI/manual)

set -u

# Every path this script handles — git ls-files output, git diff --cached paths,
# EXCLUDE_RE, APP_SRC_RE — is repo-root-relative. Run from a subdirectory and those
# paths resolve against the wrong base, so greps silently match nothing and the guard
# passes vacuously. Anchor to the repo root once, here, rather than per-call.
if _root=$(git rev-parse --show-toplevel 2>/dev/null); then
  cd "$_root" || exit 2
fi

# Deprecated "Q-Grid X" forms (incl. Platform — the platform is GRIDERA, never "Q-Grid Platform").
QGRID_VERBS='Comply|Scan|Scanner|Migrate|Certify|Lend|Pay|Arq|Shield|Guard|Observe|Platform'
# Space-form product names that MUST use the pipe (GRIDERA|Comply). NOTE: "Platform" is NOT
# here on purpose — "GRIDERA Platform" / "the GRIDERA platform" is legitimate prose.
# "Asset" added 2026-08-09: apps/landing/src/app/asset/ shipped "GRIDERA Asset" in space
# form and the old verb list could not see it. AssetGrid is a DEMOTED CONCEPT, not a product.
GRIDERA_VERBS='Comply|Scan|Migrate|Certify|Lend|Pay|Arq|Shield|Guard|Observe|Asset'
# All case variants of the deprecated prefix ("Q-GRID Comply" was invisible to the old
# case-sensitive regex). Hyphenated identifiers (Q-GRID-QaaS-Platform,
# Quantum-Grid.Network) never match — the space is required.
QGRID_PREFIX='(Q-GRID|Q-Grid|q-grid|QGRID)'
# "Quantum Grid" / "Quantum Grid Mesh" are retired display brands; the GitHub repo is GRIDERA.
# q-grid-platform: dir/package renamed gridera-platform (Wave D) — old token must not resurface.
RETIRED_BRANDS='(Quantum Grid)|(Quantum-Grid-Mesh)|(quantum-grid-mesh)|(q-grid-platform)'
# "GRID-ERA|Verb" — that hyphenation is the DOMAIN spelling (grid-era.com), never the brand.
# The brand is GRIDERA|Verb. Added 2026-08-09 when the split introduced the form.
HYPHEN_BRAND="GRID-ERA\\|(${GRIDERA_VERBS})"
# The pipe form "GRIDERA|Comply" never matches (regex requires a literal space).
FORBIDDEN="(${QGRID_PREFIX} (${QGRID_VERBS}))|(GRIDERA (${GRIDERA_VERBS}))|${RETIRED_BRANDS}|${HYPHEN_BRAND}"

# --- Org-wide taxonomy override (added 2026-07-27) --------------------------
# The values above are GRIDERA-only and were duplicated by hand in five other
# workspaces, which is how the naming drifted. They are now generated from the
# single source of truth at ~/.ai-context/taxonomy/TAXONOMY.toml, which also
# knows that other platforms use DIFFERENT naming forms ("Nexus Social" is
# correct space form; "GRIDERA Comply" is not). Sourcing it here keeps this
# repo and the rest of the fleet on one rule set.
#
# Fallback is deliberate: if the taxonomy repo is absent (fresh clone, CI
# without a home dir), the hardcoded values above still apply, so this guard
# never silently degrades to "no checking".
_TAXONOMY_RULES="${TAXONOMY_RULES:-$HOME/.ai-context/taxonomy/generated/brand-rules.sh}"
if [ -f "$_TAXONOMY_RULES" ]; then
  # shellcheck source=/dev/null
  . "$_TAXONOMY_RULES"
fi

# Re-append repo-local rules AFTER the taxonomy override, which reassigns FORBIDDEN
# wholesale — anything set before that source block is silently discarded.
#
# Applied as ONE unit rather than per-rule `case` patches. Patching individually meant
# only the rules someone remembered to mirror survived; adding a rule above the source
# block and forgetting to mirror it made it vanish with no error. New repo-local rules
# go in REPO_LOCAL_EXTRA and are covered automatically.
#
# "GRIDERA Asset" is here because the generator only knows canonical sub-products and
# AssetGrid is a DEMOTED CONCEPT, so it will never appear in the generated verb list.
REPO_LOCAL_EXTRA="${HYPHEN_BRAND}|(GRIDERA Asset)"
case "$FORBIDDEN" in
  *"GRID-ERA"*) : ;;
  *) FORBIDDEN="${FORBIDDEN}|${REPO_LOCAL_EXTRA}" ;;
esac

# Make local-vs-CI divergence visible instead of silent: the sourced file is untracked
# machine-local state, so the same commit can pass on one machine and fail on another.
if [ -n "${BRAND_GUARD_VERBOSE:-}" ]; then
  if [ -f "$_TAXONOMY_RULES" ]; then
    echo "  brand guard: taxonomy rules sourced from $_TAXONOMY_RULES"
  else
    echo "  brand guard: taxonomy rules ABSENT — repo-local fallback only"
  fi
fi

# --- Unprovisioned-host rule (added 2026-08-09, inverted 2026-08-10) --------
# The rule used to forbid grid-era.com outright, because the domain resolved to
# nothing. That is no longer true: on 2026-08-10 the apex and the EU cell were
# provisioned and both serve HTTP 200.
#
#   grid-era.com      A     76.76.21.21           -> vercel "landing"  LIVE
#   eu.grid-era.com   CNAME cname.vercel-dns.com  -> vercel "comply"   LIVE
#
# What is still dead is every OTHER regional cell on the new domain. Pointing a CTA
# at one of those sends users to a host that does not exist, so they stay forbidden
# until each is actually provisioned — delete a prefix here as it goes live, and
# verify with `dig +short <host>` before you do.
#
# Path-scoped and evaluated inside BOTH scan loops below, so it honours the
# staged-only contract in the header.
DEAD_DOMAIN='(na|in|ae|ca)\.grid-era\.com'
APP_SRC_RE='^apps/[^/]+/src/'

# Paths that legitimately contain the forbidden strings as negative examples,
# plus historical plans/specs (docs/superpowers/) that record the old names.
EXCLUDE_RE='(^|/)(scripts/check-brand\.sh|\.githooks/|docs/superpowers/)|BRAND|brand-rule'

fail=0
report() { # file, line, text
  printf '  \033[31m✗\033[0m %s:%s  %s\n' "$1" "$2" "$3"
  fail=1
}

if [ "${1:-}" = "--all" ]; then
  # Whole-tree scan (CI / manual audit)
  while IFS= read -r f; do
    case "$f" in
      *.lock|*.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico|*.woff*|*.ttf) continue ;;
    esac
    echo "$f" | grep -qE "$EXCLUDE_RE" && continue
    while IFS=: read -r ln text; do
      [ -z "$ln" ] && continue
      echo "$text" | grep -q "brand-allow" && continue
      report "$f" "$ln" "$(echo "$text" | sed 's/^[[:space:]]*//' | cut -c1-80)"
    done < <(grep -nEI "$FORBIDDEN" "$f" 2>/dev/null)

    # Dead-domain rule, restricted to app source. Paths come from git ls-files, so
    # they are repo-root-relative and this works from any working directory.
    if echo "$f" | grep -qE "$APP_SRC_RE"; then
      while IFS=: read -r ln text; do
        [ -z "$ln" ] && continue
        echo "$text" | grep -q "brand-allow" && continue
        report "$f" "$ln" "regional grid-era.com cell is not provisioned — no DNS"
      done < <(grep -nEI "$DEAD_DOMAIN" "$f" 2>/dev/null)
    fi
  done < <(git ls-files)
else
  # Staged-additions scan (pre-commit). Parse unified diff, track file + new-line numbers.
  current_file=""
  newln=0
  while IFS= read -r line; do
    case "$line" in
      '+++ b/'*) current_file="${line#+++ b/}" ;;
      '@@ '*)
        # @@ -a,b +c,d @@  -> start of new-file hunk = c
        hunk="${line#@@ -*+}"; hunk="${hunk%% @@*}"; newln="${hunk%%,*}"
        ;;
      '+'*)
        # an added line (not the +++ header)
        text="${line#+}"
        if echo "$current_file" | grep -qE "$EXCLUDE_RE"; then :;
        elif echo "$text" | grep -q "brand-allow"; then :;
        elif echo "$text" | grep -qE "$FORBIDDEN"; then
          report "$current_file" "$newln" "$(echo "$text" | sed 's/^[[:space:]]*//' | cut -c1-80)"
        elif echo "$current_file" | grep -qE "$APP_SRC_RE" && echo "$text" | grep -qE "$DEAD_DOMAIN"; then
          report "$current_file" "$newln" "regional grid-era.com cell is not provisioned — no DNS"
        fi
        newln=$((newln+1))
        ;;
      ' '*) newln=$((newln+1)) ;;   # context line advances new-file counter
      # '-' lines: removals, do not advance new-file counter
    esac
  done < <(git diff --cached --unified=0)
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "  Brand guard: use pipe form (GRIDERA|Comply), never \"Q-Grid <Verb>\" (any case), space-form \"GRIDERA <Verb>\", or \"GRID-ERA|<Verb>\" (that's the domain spelling)."
  echo "  grid-era.com and eu.grid-era.com are LIVE. na/in/ae/ca.grid-era.com are NOT provisioned — use the q-grid.net cell until they are."
  echo "  \"Quantum Grid\"/\"Quantum-Grid-Mesh\"/\"q-grid-platform\" are retired (dir/package is gridera-platform). Domains (q-grid.net — FROZEN, production) are fine."
  echo "  Edge case? add 'brand-allow' on the line, or bypass once with: git commit --no-verify"
  exit 1
fi
exit 0
