# HEDERA Archival Log

**Date:** 2026-04-07
**Reason:** Consolidate 39 dirs → ~15. Gen 3 (q-grid-platform) is canonical.

## Pre-Archival Safety Check (2026-04-07)

### Remote Verification — ALL OK
| Directory | GitHub Remote | Status |
|-----------|-------------|--------|
| Comply.Q-Grid.EU | https://github.com/Taurus-Ai-Corp/Comply.Q-Grid | OK |
| Comply.Q-Grid.in | git@github.com:Taurus-Ai-Corp/Comply.Q-Grid.git | OK |
| Q-Grid.IN | https://github.com/Taurus-Ai-Corp/Q-GRID.IN | OK |
| Rupee_Grid_pay_Q-Grid.in | https://github.com/Taurus-Ai-Corp/Q-GRID.IN.git | OK |
| Q-Grid.CA | https://github.com/Taurus-Ai-Corp/Q-GRID.git | OK |
| OpsFlow.Taurusai.io | https://github.com/Taurus-Ai-Corp/opsflow-taurusai.git | OK |
| fraud-detection-demo | https://github.com/Taurus-Ai-Corp/fraud-detection-demo-private.git | OK |
| multi-ai-devops | https://github.com/Taurus-Ai-Corp/multi-ai-devops.git | OK |
| INNOVATIVE_IDEAS_DOCS | https://github.com/Taurus-Ai-Corp/innovative-ideas-docs.git | OK |
| taurus-cli | https://github.com/Taurus-Ai-Corp/taurus-cli.git | OK |
| huggingface-spaces | https://github.com/Taurus-Ai-Corp/huggingface-spaces.git | OK |
| ml-pipeline | https://github.com/Taurus-Ai-Corp/ml-pipeline.git | OK |

### Unpushed Work — 2 BLOCKERS
| Directory | Branch | Unpushed | Dirty | Notes |
|-----------|--------|----------|-------|-------|
| Comply.Q-Grid.EU | main | 0 | 24 | Untracked files only (build artifacts, docs) |
| Comply.Q-Grid.in | main | 0 | 3 | Untracked: .sisyphus/, .vercel/, publications/ |
| Q-Grid.IN | main | 0 | 4 | 2 modified + 2 untracked |
| **Rupee_Grid_pay_Q-Grid.in** | copilot/fix-hardcoded-secrets | **2** | **20** | **BLOCKER: 2 unpushed commits + 20 dirty files (screenshots, demos)** |
| Q-Grid.CA | main | 0 | 2 | 1 modified + 1 untracked |
| OpsFlow.Taurusai.io | main | 0 | 0 | CLEAN |
| **fraud-detection-demo** | main | **1** | **0** | **BLOCKER: 1 unpushed commit (initial private commit)** |
| multi-ai-devops | main | 0 | 0 | CLEAN |
| INNOVATIVE_IDEAS_DOCS | main | 0 | 2 | Renamed .txt → .md |
| taurus-cli | main | 0 | 12 | Duplicate files with "2" suffix |
| huggingface-spaces | main | 0 | 0 | CLEAN |
| ml-pipeline | main | 0 | 6 | .DS_Store files + INTEGRATION_GUIDE.md |

### Blocker Details
1. **Rupee_Grid_pay_Q-Grid.in** — Branch `copilot/fix-hardcoded-secrets` has 2 unpushed commits:
   - `fce35fb` Fix hardcoded secrets: remove default password, tighten CI scan patterns, add .env.example
   - `35b8ae9` Initial plan
   - ACTION NEEDED: Push branch or cherry-pick before archival

2. **fraud-detection-demo** — Main branch has 1 unpushed commit:
   - `69e10fd` chore: initial private commit for fraud-detection-demo
   - ACTION NEEDED: Push to origin/main before archival

## Archived Repos (moved to _archive/)
| Directory | GitHub Remote | Reason |
|-----------|-------------|--------|

## Deleted (duplicates/empties)
| Directory | Reason |
|-----------|--------|

## Parked (future projects — will resume)
| Directory | Reason | Resume When |
|-----------|--------|-------------|

## Consolidated
| From | To | Reason |
|------|-----|--------|
