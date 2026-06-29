# NFLIT360 v7.0 Migration Guide

## Change Control Record

| Field | Value |
|-------|-------|
| **Change ID** | CHG-2025-PLAYBOOK-REMODEL-001 |
| **Title** | NFLIT360 Playbook Remodel v6.1 → v7.0 |
| **Status** | APPROVED |
| **Approved By** | Sentrais Architect |
| **Effective Date** | 2025-12-16 |

---

## Overview

This guide covers the migration from NFLIT360 v6.1 to v7.0, including schema changes, deployment procedures, and rollback instructions.

### What's Changing

| Component | v6.1 | v7.0 |
|-----------|------|------|
| Playbooks | 16 files | 16 files (restructured) |
| Total Tasks | ~600 | 775 |
| Temporal Framework | M1-M6 milestones | 11-tier (GD-1, T1-T11) |
| Dependencies | System-level | Task-level |
| SLA Tracking | HARD/SOFT | Green/Yellow/Red |
| Evidence | Generic hints | Structured modes |
| NIN Phases | Not implemented | 5-phase tracking |

---

## Pre-Deployment Checklist

- [ ] Review all v7.0 playbook files
- [ ] Verify source of truth alignment
- [ ] Confirm SLA thresholds with operations
- [ ] Test deployment in staging environment
- [ ] Schedule deployment window
- [ ] Notify stakeholders

---

## Deployment Procedure

### Option A: Automated Deployment

```bash
# 1. Navigate to deployment package
cd nflit360_v7_deployment

# 2. Set repository root (adjust path as needed)
export REPO_ROOT=/path/to/NFLIT360

# 3. Run deployment script
./scripts/deploy_v7.sh

# 4. Commit and push
cd $REPO_ROOT
git add .
git commit -m "Deploy NFLIT360 v7.0 - CHG-2025-PLAYBOOK-REMODEL-001"
git push origin main
```

### Option B: Manual Deployment

```bash
# 1. Backup existing files
mkdir -p backups/v6.1_backup
cp data/playbooks/*v6*.json backups/v6.1_backup/
cp data/orchestration/*v6*.json backups/v6.1_backup/

# 2. Copy v7.0 playbooks
cp nflit360_v7_deployment/playbooks/*.json data/playbooks/

# 3. Copy v7.0 orchestration files
cp nflit360_v7_deployment/orchestration/*.json data/orchestration/

# 4. Commit and push
git add .
git commit -m "Deploy NFLIT360 v7.0 - CHG-2025-PLAYBOOK-REMODEL-001"
git push origin main
```

---

## Post-Deployment Validation

### 1. File Verification

```bash
# Verify playbook count (should be 16)
ls -1 data/playbooks/*v7*.json | wc -l

# Verify orchestration files
ls -la data/orchestration/*v7*.json
```

### 2. Schema Validation

Check that each playbook contains:
- `version: "7.0"`
- `change_control` object
- `temporal_framework_v7` or `internal_sla.tier` fields
- `task_dependencies` array (can be empty)
- `nin_phase` field
- `evidence_capture` object

### 3. Task Count Verification

| System | Expected Tasks |
|--------|----------------|
| IVRS (4 playbooks) | 66 total |
| FTR | 58 |
| IR_TECH | 34 |
| O2O | 14 |
| HAWKEYE | 150 (81 GD-1 + 69 GD) |
| WIFI | 31 |
| C2P (2 playbooks) | 122 total |
| SVS (4 playbooks) | 274 total |
| EFC | 26 |
| **TOTAL** | **775** |

---

## Rollback Procedure

If issues are detected post-deployment:

### Automated Rollback

```bash
# Run rollback script with backup directory
./scripts/rollback_v6.sh backups/v6.1_backup

# Commit and push
git add .
git commit -m "Rollback to v6.1 - issues detected"
git push origin main
```

### Manual Rollback

```bash
# Remove v7.0 files
rm data/playbooks/*v7*.json
rm data/orchestration/*v7*.json

# Restore v6.1 files
cp backups/v6.1_backup/playbooks/* data/playbooks/
cp backups/v6.1_backup/orchestration/* data/orchestration/

# Commit and push
git add .
git commit -m "Rollback to v6.1"
git push origin main
```

---

## Schema Migration Details

### Task Object Changes

**v6.1 Task:**
```json
{
  "task_id": "IVRS_001",
  "description": "Clock in on UKG",
  "sla_type": "HARD",
  "milestone": "M3",
  "evidence_hint": "WhatsApp post"
}
```

**v7.0 Task:**
```json
{
  "task_id": "IVRS_HomeBooth_001",
  "sequence": 1,
  "user_ref_id": "1.1",
  "description": "Clock in on UKG upon arrival...",
  "internal_sla": {
    "target_time": "4 Hours Prior to Kick",
    "tier": "T3",
    "time_code": "T-4:00"
  },
  "task_dependencies": ["EFC (2.1-2.5)"],
  "nin_phase": "DISCOVER",
  "milestone": "M3",
  "evidence_capture": {
    "mode": "STATUS_POST",
    "channel_target": "CLUB",
    "compliance_critical": true
  },
  "sentrais_phase": "EXECUTION"
}
```

### New Fields

| Field | Type | Description |
|-------|------|-------------|
| `sequence` | number | Execution order within playbook |
| `user_ref_id` | string | Original task ID from source spreadsheet |
| `internal_sla.tier` | string | Timing tier (GD-1, T1-T11) |
| `internal_sla.time_code` | string | Human-readable time code |
| `task_dependencies` | array | Task-level dependencies |
| `nin_phase` | string | NIN methodology phase |
| `evidence_capture.mode` | string | PHOTO_REQUIRED, STATUS_POST, CHECKBOX |
| `evidence_capture.channel_target` | string | Target channel for evidence |

---

## Backend API Changes

### New Endpoints Required

```
GET  /api/v7/playbooks/:playbook_id
GET  /api/v7/playbooks/:playbook_id/tasks
GET  /api/v7/systems/:system_id/dependencies
GET  /api/v7/timing/tiers
POST /api/v7/tasks/:task_id/complete
```

### Database Schema Updates

```sql
-- Add timing tier column
ALTER TABLE tasks ADD COLUMN timing_tier VARCHAR(10);

-- Add NIN phase column  
ALTER TABLE tasks ADD COLUMN nin_phase VARCHAR(20);

-- Add evidence mode column
ALTER TABLE tasks ADD COLUMN evidence_mode VARCHAR(20);

-- Create dependencies table
CREATE TABLE task_dependencies (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(100) NOT NULL,
  depends_on VARCHAR(100) NOT NULL,
  dependency_type VARCHAR(20) DEFAULT 'GATES'
);
```

---

## UI/UX Considerations

### GDA Mobile App

- No visible changes to field technicians
- Task list remains the same
- Evidence capture unchanged
- NIN phases hidden from GDA view

### IT Leadership Dashboard

- New timing tier visualization
- Dependency chain view
- NIN phase distribution charts
- Green/Yellow/Red SLA status

---

## Support Contacts

| Role | Contact |
|------|---------|
| Sentrais Architect | [Approval authority] |
| Operations Lead | [Escalation path] |
| Technical Support | [Implementation support] |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-16 | Sentrais | Initial migration guide |

