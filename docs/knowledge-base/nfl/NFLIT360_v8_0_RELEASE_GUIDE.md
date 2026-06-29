# NFLIT360 v8.0 Release Guide

## Release to Existing Repository

Your `nflit360` repository already has v7 - this is the v8.0 release workflow.

---

## Quick Start

```bash
# 1. Navigate to your existing repo
cd nflit360

# 2. Pull latest and create release branch
git checkout main
git pull origin main
git checkout -b release/v8.0

# 3. Add v8.0 specs to docs/specs/
mkdir -p docs/specs

# 4. Copy downloaded files to docs/specs/
# (See file list below)

# 5. Commit and push
git add .
git commit -m "feat: NFLIT360 v8.0 - System Groups, Week Navigation, Notifications"
git push origin release/v8.0

# 6. Create PR, merge to main, then tag
git checkout main
git pull origin main
git tag -a v8.0.0 -m "NFLIT360 v8.0.0"
git push origin v8.0.0
```

---

## Files to Add to `docs/specs/`

| File | Description |
|------|-------------|
| `NFLIT360_Master_Orchestration_v8_0.json` | Complete platform specification |
| `NFLIT360_Version_Registry_v8_0.md` | Version tracking document |
| `NFLIT360_Executive_Brief_v8_0.docx` | Executive summary |
| `NFLIT360_KPI_Dashboard_Spec_v8_0.json` | Dashboard & navigation specs |
| `NFLIT360_Dependency_Graph_v8_0.json` | System dependencies |
| `CHANGELOG.md` | Version history |

---

## Directory Structure

```
nflit360/
├── docs/
│   └── specs/
│       ├── NFLIT360_Master_Orchestration_v8_0.json    ← NEW
│       ├── NFLIT360_Version_Registry_v8_0.md          ← NEW
│       ├── NFLIT360_Executive_Brief_v8_0.docx         ← NEW
│       ├── NFLIT360_KPI_Dashboard_Spec_v8_0.json      ← NEW
│       ├── NFLIT360_Dependency_Graph_v8_0.json        ← NEW
│       ├── CHANGELOG.md                               ← UPDATE
│       └── (v7 files remain for history)
├── src/
└── ...
```

---

## Vercel Deployment

Your existing Vercel projects will auto-deploy:

| Project | URL |
|---------|-----|
| `nflit-360` | nflit-360.vercel.app |
| `nflit360-web` | nflit360-web.vercel.app |

Preview URL for release branch:
```
https://nflit-360-git-release-v80-novatel-abs.vercel.app
```

---

## Claude Code Usage

Once specs are added, use Claude Code to implement:

```bash
cd nflit360
claude

# Example prompts:
# "Read docs/specs/NFLIT360_KPI_Dashboard_Spec_v8_0.json and implement WeekSelector"
# "Create the notification banner component from the v8 dashboard spec"
# "Add the system group grid based on the master orchestration spec"
```

---

## Git Commands Reference

```bash
# View tags
git tag -l

# Compare v7 to v8
git diff v7.0.0..v8.0.0

# Create GitHub release
# Go to: github.com/YOUR_ORG/nflit360/releases/new
# Tag: v8.0.0
# Title: NFLIT360 v8.0.0 - System Groups & Week Navigation
```

---

**Version**: 8.0.0  
**Date**: December 12, 2025  
**Supersedes**: v7.x
