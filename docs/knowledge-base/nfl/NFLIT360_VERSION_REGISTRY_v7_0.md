# NFLIT360 VERSION REGISTRY v7.0

## Change Control Record

| Field | Value |
|-------|-------|
| **Change ID** | CHG-2025-PLAYBOOK-REMODEL-001 |
| **Title** | NFLIT360 Playbook Remodel v6.1 → v7.0 |
| **Status** | ✅ APPROVED |
| **Approved By** | Sentrais Architect |
| **Effective Date** | 2025-12-16 |
| **Rollback Version** | 6.1 |

---

## Executive Summary

Complete remodel of all 16 GDA playbooks aligning with source of truth spreadsheet (`Users_Systems_Task_Truth_GDA.xlsx`). Implementation of v7.0 schema with enhanced temporal framework, task-level dependencies, NIN methodology integration, and evidence-based compliance tracking.

### Key Metrics

| Metric | Value |
|--------|-------|
| Playbooks Modified | 16 |
| Total Tasks Migrated | 775 |
| Systems Affected | 9 |
| Schema Version | 6.1 → 7.0 |

---

## Schema Changes v6.1 → v7.0

### 1. Temporal Framework

| Aspect | v6.1 | v7.0 |
|--------|------|------|
| Model | Static M1-M6 milestone windows | 11-tier game-clock-relative SLA |
| Reference | Milestone-based | Kickoff-relative (T-Xh) |
| GD-1 Support | ❌ No | ✅ Yes (Hawk-Eye) |

**v7.0 Timing Tiers:**

| Tier | Name | Time Code | Systems |
|------|------|-----------|---------|
| GD-1 | Day Before | 9 AM Day Before | HAWKEYE |
| T1 | Early Setup | T-7:00 | HAWKEYE |
| T2 | Spectrum Clearance | T-5:00 to T-6:00 | EFC, HAWKEYE |
| T3 | System Setup | T-4:00 | ALL |
| T4 | System Validation | T-3:30 | C2P, SVS |
| T5 | Cross-System Check | T-3:00 | ALL |
| T6 | Final Validation | T-2:00 | ALL |
| T7 | Game Ready | T-1:00 | ALL |
| T8 | Pre-Kickoff | T-0:50 | ALL |
| T9 | Final Check | T-0:15 | ALL |
| T10 | Live Operations | KICKOFF | ALL |
| T11 | Post-Game | EOG+ | ALL |

### 2. Dependencies

| Aspect | v6.1 | v7.0 |
|--------|------|------|
| Granularity | System-level | Task-to-task |
| Format | "C2P requires EFC" | "EFC (2.1-2.5)" |
| Cross-system | Implicit | Explicit chains |

### 3. SLA Tracking

| Aspect | v6.1 | v7.0 |
|--------|------|------|
| Model | Single sla_type (HARD/SOFT) | Green/Yellow/Red thresholds |
| Monitoring | Reactive | Proactive |
| Per-system | ❌ No | ✅ Yes |

### 4. Evidence Capture

| Aspect | v6.1 | v7.0 |
|--------|------|------|
| Field | Generic evidence_hint | Structured evidence_capture object |
| Modes | N/A | PHOTO_REQUIRED, STATUS_POST, CHECKBOX, MEASUREMENT |
| Channels | N/A | CLUB, HAWK_EYE_SUPPORT, EVERGAME |

### 5. NIN Methodology

| Aspect | v6.1 | v7.0 |
|--------|------|------|
| Integration | ❌ Not implemented | ✅ 5-phase assignment |
| Phases | N/A | DISCOVER, DIAGNOSE, DESIGN, DEPLOY, DEBRIEF |
| Visibility | N/A | Hidden from GDA UI, visible to IT Leadership |

---

## Playbook Inventory

### By System

| System | Playbooks | Total Tasks | Hat Color |
|--------|-----------|-------------|-----------|
| IVRS | 4 | 66 | BLUE |
| FTR | 1 | 58 | GRAY |
| IR_TECH | 1 | 34 | GRAY |
| O2O | 1 | 14 | GRAY |
| HAWKEYE | 1 | 150 | VENDOR |
| WIFI | 1 | 31 | GRAY |
| C2P | 2 | 122 | ORANGE |
| SVS | 4 | 274 | PURPLE |
| EFC | 1 | 26 | ORANGE-EFC |
| **TOTAL** | **16** | **775** | |

### Complete Playbook List

| # | Playbook ID | System | Location | Tasks |
|---|-------------|--------|----------|-------|
| 1 | IVRS_HomeBooth_GDA | IVRS | Home Booth | 17 |
| 2 | IVRS_VisitorBooth_GDA | IVRS | Visitor Booth | 17 |
| 3 | IVRS_HomeField_GDA | IVRS | Home Field | 16 |
| 4 | IVRS_VisitorField_GDA | IVRS | Visitor Field | 16 |
| 5 | FTR_Stadium_GDA | FTR | Stadium | 58 |
| 6 | IR_TECH_Booth_GDA | IR_TECH | Booth | 34 |
| 7 | O2O_Field_GDA | O2O | Field | 14 |
| 8 | HAWKEYE_Stadium_GDA | HAWKEYE | Stadium | 150 |
| 9 | WIFI_Stadium_GDA | WIFI | Stadium | 31 |
| 10 | C2P_HomeSideline_GDA | C2P | Home Sideline | 61 |
| 11 | C2P_VisitorSideline_GDA | C2P | Visitor Sideline | 61 |
| 12 | SVS_HomeBooth_GDA | SVS | Home Booth | 69 |
| 13 | SVS_VisitorBooth_GDA | SVS | Visitor Booth | 68 |
| 14 | SVS_HomeSideline_GDA | SVS | Home Sideline | 69 |
| 15 | SVS_VisitorSideline_GDA | SVS | Visitor Sideline | 68 |
| 16 | EFC_Stadium_GDA | EFC | Stadium | 26 |

---

## SLA Thresholds by System

| System | Total Tasks | Green ≥ | Yellow ≥ | Green % | Yellow % |
|--------|-------------|---------|----------|---------|----------|
| IVRS | 29 | 24 | 22 | 82.8% | 75.9% |
| FTR | 58 | 54 | 52 | 93.1% | 89.7% |
| IR_TECH | 33 | 24 | 20 | 72.7% | 60.6% |
| O2O | 13 | 8 | 7 | 61.5% | 53.8% |
| HAWKEYE | 68 | 31 | 31 | 45.6% | 45.6% |
| WIFI | 31 | 18 | 18 | 58.1% | 58.1% |
| C2P | 60 | 45 | 45 | 75.0% | 75.0% |
| SVS | 66 | 42 | 42 | 63.6% | 63.6% |
| EFC | 24 | 20 | 19 | 83.3% | 79.2% |

**Status Logic:**
- 🟢 GREEN: completed ≥ green_target
- 🟡 YELLOW: completed ≥ yellow_warning AND < green_target  
- 🔴 RED: completed < yellow_warning

---

## Critical Dependency Chains

### EFC Gating (Master Chain)

EFC tasks 2.1-2.5 (CBRS Spectrum Clearance) gate ALL wireless systems at T-4h:

```
EFC (2.1-2.5) CBRS Clearance
    ├─► IVRS (all positions)
    ├─► IR_TECH
    ├─► O2O
    ├─► WIFI
    ├─► C2P (Home + Visitor)
    └─► SVS (all positions)
```

### Hawk-Eye Two-Day Operation

```
GD-1 (Day Before)
├── 1.0 Arrival → 2.0 Rack Room → 3.0 Patching
│                                   ├── 4.0 IR Setup → 5.0 IVR Setup → 6.0 Testing → 7.0 Layouts
│                                   └── 8.0 Flyaway [A-Game]
│
└── GATES ──────────────────────────────────────────────────────────────────────►

Game Day
├── 1.0 Arrival (T-7h) → 2.0 Sync Test (T-6h)
│                            └── 3.0 IR Verify → 4.0 IVR Verify → 5.0 Wearables
│                                                                      └── 6.0 Field Checks (T-4h to T-50m)
│                                                                              └── 7.0 End of Game
```

---

## Special Implementation Notes

### Hawk-Eye (Two-Day Operation)
- Only system with GD-1 tier
- 81 GD-1 tasks + 69 Game Day tasks = 150 total
- GD-1 completion GATES Game Day start
- 8 photo checkpoints across both days

### IVRS (Combined Sheet → 4 Playbooks)
- Source: Single "IVRS" sheet with section headers
- Split: Booth, Home Field, Visitor Field
- Common tasks (4.0+) replicated to all positions

### SVS (Combined Sheets → 4 Playbooks)
- Source: "SVS Home" and "SVS Visitor" sheets
- Each contains Booth + Sideline sections
- Split into 4 position-based playbooks

### EFC (Critical Path)
- CBRS clearance tasks gate all wireless
- Must complete before T-4h SLA window
- Single point of failure for wireless systems

---

## Rollback Procedure

If rollback required:

1. Stop NFLIT360 services
2. Restore v6.1 playbook files from `/mnt/project/`
3. Update Master Orchestration reference to v6.1
4. Clear v7.0 cached data
5. Restart services
6. Validate system operation
7. Notify stakeholders

**v6.1 Files Location:** `/mnt/project/*_v6_1.json`

---

## Validation Checklist

| Item | Status | Notes |
|------|--------|-------|
| Source of Truth Alignment | ✅ | All tasks from Users_Systems_Task_Truth_GDA.xlsx |
| Task-Level Dependencies | ✅ | Parsed from "Depends On" column |
| 11-Tier Temporal Framework | ✅ | GD-1 + T1-T11 implemented |
| Evidence Requirements | ✅ | Photo/Status/Checkbox modes assigned |
| SLA Thresholds | ✅ | Green/Yellow per system imported |
| NIN Phase Assignment | ✅ | All tasks categorized |
| Change Control Documentation | ✅ | This document |

---

## Files Generated

```
nflit360_v7/
├── playbooks/
│   ├── C2P_HomeSideline_GDA_v7_0.json
│   ├── C2P_VisitorSideline_GDA_v7_0.json
│   ├── EFC_Stadium_GDA_v7_0.json
│   ├── FTR_Stadium_GDA_v7_0.json
│   ├── HAWKEYE_Stadium_GDA_v7_0.json
│   ├── IR_TECH_Booth_GDA_v7_0.json
│   ├── IVRS_HomeBooth_GDA_v7_0.json
│   ├── IVRS_HomeField_GDA_v7_0.json
│   ├── IVRS_VisitorBooth_GDA_v7_0.json
│   ├── IVRS_VisitorField_GDA_v7_0.json
│   ├── O2O_Field_GDA_v7_0.json
│   ├── SVS_HomeBooth_GDA_v7_0.json
│   ├── SVS_HomeSideline_GDA_v7_0.json
│   ├── SVS_VisitorBooth_GDA_v7_0.json
│   ├── SVS_VisitorSideline_GDA_v7_0.json
│   └── WIFI_Stadium_GDA_v7_0.json
├── CHANGE_CONTROL_v7_0.json
└── NFLIT360_VERSION_REGISTRY_v7_0.md
```

---

**Document Version:** 7.0  
**Generated:** 2025-12-16  
**Authority:** Sentrais Architect
