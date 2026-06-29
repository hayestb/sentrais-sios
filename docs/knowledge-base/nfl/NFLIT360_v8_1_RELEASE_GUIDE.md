# NFLIT360 v8.1 Release Guide

## Release to Existing Repository

Your `nflit360` repository has v7 - this is the v8.1 release with complete EVERGAME integration.

---

## What's New in v8.1 (vs v8.0)

| Addition | Description |
|----------|-------------|
| **EVERGAME Hierarchy** | IT_EVERGAME rolls up to parent EVERGAME |
| **4-Tier Platform** | Certification → Planning → Execution → Dashboard |
| **Seasonal Phases** | Offseason/Preseason/Regular/Post with auto-switching |
| **VRI Scoring** | Venue Readiness Index (0-100) |
| **Per-Game Recert** | T-48h → T-6h recertification cycle |
| **T-50m Gates** | 6 critical gates including Medical Timeout |
| **Evidence Schema** | 7 defined evidence field types |
| **System KPIs** | Per-system thresholds and alerts |
| **After Action Reports** | Game AAR + Seasonal AAR |
| **Data Structures** | Hierarchical roll-up model |

---

## Quick Start

```bash
# 1. Go to your existing repo
cd nflit360

# 2. Create release branch
git checkout -b release/v8.1

# 3. Add specs to docs/specs/
mkdir -p docs/specs
# Copy downloaded v8.1 files here

# 4. Commit and push
git add .
git commit -m "feat: NFLIT360 v8.1 - EVERGAME Integration, Seasonal Phases, Recertification"
git push origin release/v8.1

# 5. Create PR → merge to main → tag release
git tag -a v8.1.0 -m "NFLIT360 v8.1.0 - Complete EVERGAME Architecture"
git push origin v8.1.0
```

---

## Files to Add to `docs/specs/`

| File | Description |
|------|-------------|
| `NFLIT360_Master_Orchestration_v8_1.json` | Complete platform specification |
| `NFLIT360_v8_1_PATCH.json` | Detailed patch documentation |
| `NFLIT360_Version_Registry_v8_1.md` | Version tracking |
| `CHANGELOG.md` | Version history |

---

**Version**: 8.1.0  
**Date**: December 13, 2025  
**Supersedes**: v8.0
