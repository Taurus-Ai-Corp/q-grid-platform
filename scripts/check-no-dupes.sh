#!/usr/bin/env bash
#
# Fails if macOS/iCloud conflict duplicates ("file 2.ext") are present.
#
# This repo lives under ~/Documents, which macOS syncs to iCloud Drive by default.
# iCloud resolves sync conflicts by writing a second copy next to the original with a
# " 2" suffix. That is not cosmetic:
#
#   - `.next/types/routes.d 2.ts` duplicates LayoutProps and breaks `tsc` with TS2300
#   - `.next/types/cache-life.d 2.ts` collides on ~9 identifiers with TS6200
#   - `apps/landing/next.config 2.ts` is a stale copy of the real Next config
#
# 135 of them had accumulated by 2026-08-10, and they had already broken type-check
# twice. Worse, turbo replays a cached PASS afterwards, so the failure disappears on
# the next run and looks transient.
#
# The durable fix is environmental — exclude this directory from iCloud sync. This
# guard exists so the symptom is named loudly instead of surfacing as a baffling
# duplicate-identifier error.
#
# Usage: pnpm lint:dupes           # report and fail
#        pnpm lint:dupes --fix     # delete them, then report

set -uo pipefail

# Anchor to the REPO ROOT — not the root's parent. An earlier version appended "/.."
# to `git rev-parse --show-toplevel`, so it scanned (and with --fix, deleted in) the
# directory ABOVE the repo. That swept 435 files out of a sibling project's .venv.
# Nothing outside this repository is ever in scope.
if _root=$(git rev-parse --show-toplevel 2>/dev/null); then
  cd "$_root" || exit 2
else
  cd "$(dirname "$0")/.." || exit 2
fi

# Deliberately NOT `mapfile` — that is a bash 4+ builtin and macOS ships bash 3.2, where
# it fails with "command not found" and then trips `set -u`, producing an exit 1 that
# looks exactly like a real detection. A guard that false-positives is worse than none.
LIST=$(mktemp) || exit 2
trap 'rm -f "$LIST"' EXIT
# Two name shapes, because iCloud duplicates directories too:
#   "routes.d 2.ts"        file with an extension
#   "pilot-0 2", "sample 2"  directory or extensionless file
# The original pattern required a dot, so it silently missed the directory form —
# including a duplicated TEST FIXTURE dir (tools/gridera-verify/fixtures/sample 2)
# and a duplicated evidence bundle (docs/evidence/pilot-0 2), which are exactly the
# kind of thing someone later mistakes for a real artifact.
#
# Vendored/managed trees are out of scope: not ours to delete. Regenerable build
# CACHES are excluded from failing too — a duplicate in .next/cache or .turbo/cache
# is harmless and clears on the next build, and failing on it trains people to
# disable the guard. .next/types is NOT a cache and stays in scope: that is the one
# that breaks tsc with TS2300/TS6200.
find . \( -name "* [0-9].*" -o -name "* [0-9]" \) \
  -not -path "*/node_modules/*" \
  -not -path "./.git/*" \
  -not -path "*/.venv/*" \
  -not -path "*/venv/*" \
  -not -path "*/site-packages/*" \
  -not -path "*/cache/*" \
  -not -path "*/cache [0-9]/*" \
  2>/dev/null | sed 's|^\./||' | sort > "$LIST"
COUNT=$(wc -l < "$LIST" | tr -d ' ')

if [ "$COUNT" -eq 0 ]; then
  echo "✓ no macOS/iCloud duplicate files"
  exit 0
fi

echo "✗ $COUNT macOS/iCloud duplicate file(s) present:"
head -20 "$LIST" | sed 's/^/    /'
[ "$COUNT" -gt 20 ] && echo "    … and $((COUNT - 20)) more"

if [ "${1:-}" = "--fix" ]; then
  # Safe by construction: these sit beside the real file and none are tracked. Refuse
  # anything git tracks anyway, so a legitimately-named file is never removed.
  removed=0
  manual=0
  while IFS= read -r rel; do
    [ -z "$rel" ] && continue
    if git ls-files --error-unmatch "$rel" >/dev/null 2>&1; then
      echo "  ! refusing to delete git-tracked file: $rel"
      continue
    fi
    if [ -d "$rel" ]; then
      # Empty duplicate directory: safe to remove. NON-empty: left alone on purpose.
      # Recursive auto-delete is exactly the reflex that deleted 435 files from a
      # sibling project on 2026-08-10; a directory with contents gets named, not
      # removed, so a human decides.
      if rmdir "$rel" 2>/dev/null; then
        removed=$((removed + 1))
      else
        echo "  ~ non-empty duplicate directory, NOT auto-removed: $rel"
        manual=$((manual + 1))
      fi
    else
      rm -f "$rel" && removed=$((removed + 1))
    fi
  done < "$LIST"
  echo "✓ removed $removed duplicate(s)"
  if [ "$manual" -gt 0 ]; then
    echo "  $manual non-empty duplicate directory/ies need a human decision (listed above)."
    exit 1
  fi
  exit 0
fi

echo ""
echo "  Fix now:      pnpm lint:dupes --fix"
echo "  Fix forever:  System Settings > Apple Account > iCloud > Drive >"
echo "                turn off 'Desktop & Documents Folders', or move this repo"
echo "                outside ~/Documents."
exit 1
