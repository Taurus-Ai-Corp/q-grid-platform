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

# Re-append repo-local rules AFTER the taxonomy override, which reassigns
# FORBIDDEN wholesale. Anything added before the source block is silently lost.
case "$FORBIDDEN" in
  *"GRID-ERA"*) : ;;
  *) FORBIDDEN="${FORBIDDEN}|${HYPHEN_BRAND}" ;;
esac
# "GRIDERA Asset" — the generator only knows canonical sub-products, and AssetGrid is a
# DEMOTED CONCEPT, so "Asset" will never appear in the generated verb list. Append locally.
case "$FORBIDDEN" in
  *"GRIDERA Asset"*) : ;;
  *) FORBIDDEN="${FORBIDDEN}|(GRIDERA Asset)" ;;
esac

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
        fi
        newln=$((newln+1))
        ;;
      ' '*) newln=$((newln+1)) ;;   # context line advances new-file counter
      # '-' lines: removals, do not advance new-file counter
    esac
  done < <(git diff --cached --unified=0)
fi

# --- Dead-domain guard (added 2026-08-09) -----------------------------------
# grid-era.com was registered 2026-08-08 but has NO A RECORD and serves nothing
# (verified against 8.8.8.8 and 1.1.1.1). eu.grid-era.com does not resolve either.
# Docs may discuss it; shipping app source must never point a CTA/canonical at it.
# Scoped to app source so the taxonomy notes and this comment don't self-trip.
while IFS= read -r hit; do
  [ -z "$hit" ] && continue
  echo "$hit" | grep -q "brand-allow" && continue
  f="${hit%%:*}"; rest="${hit#*:}"; ln="${rest%%:*}"
  report "$f" "$ln" "grid-era.com in app source — domain has no A record"
done < <(grep -rnI --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.vercel \
           --exclude-dir=dist -e 'grid-era\.com' apps/*/src 2>/dev/null)

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "  Brand guard: use pipe form (GRIDERA|Comply), never \"Q-Grid <Verb>\" (any case), space-form \"GRIDERA <Verb>\", or \"GRID-ERA|<Verb>\" (that's the domain spelling)."
  echo "  grid-era.com must not appear in apps/*/src — it has no A record and serves nothing. Use q-grid.net."
  echo "  \"Quantum Grid\"/\"Quantum-Grid-Mesh\"/\"q-grid-platform\" are retired (dir/package is gridera-platform). Domains (q-grid.net — FROZEN, production) are fine."
  echo "  Edge case? add 'brand-allow' on the line, or bypass once with: git commit --no-verify"
  exit 1
fi
exit 0
