# NFL GDA Source of Truth Analysis Report
## EVERGAME System Integration Validation

**Analysis Date:** December 20, 2025  
**Source Documents:** Users_Systems_Task_Truth_GDA_Model.xlsx, Simplified_GDA_Systems.xlsx  
**Reference:** EVERGAME_Core_Operations.json, EVERGAME_360_GDA_Orchestration_Playbook_2025_v2.md

---

## Executive Summary

This analysis validates the NFL's Source of Truth capture sheet against the EVERGAME GDA system requirements. The analysis identified **14 discrepancies** requiring validation and provides the comprehensive mapping matrix for system displays based on mapped tasks, dependencies, HAT correlations, evidence capture, and tech equity requirements.

### Key Findings

| Category | Finding | Impact |
|----------|---------|--------|
| **Total Task Count** | Dashboard shows 509, actual sheets contain ~660+ | Temporal sections counted differently |
| **Hawk-Eye Temporal** | Day-prior (GD-1) tasks not reflected in GDAS | **Critical** - 81 tasks missing from temporal frame |
| **WiFi Tracking** | Structured dBm + channel deviation tracking needed | Evidence capture enhancement required |
| **Location Splits** | Multiple systems need position-based task filtering | IVRS (4), SVS (4), C2P (2) positions |

---

## 1. Task Count Discrepancy Analysis

### Dashboard vs. Actual Sheet Counts

| System | Dashboard Count | Actual Count | Delta | Root Cause |
|--------|-----------------|--------------|-------|------------|
| IVRS | 29 | 35 (62 in Simplified) | +33 | 4-location split: Booth/Field × Home/Visitor |
| FTR | 58 | 63 | +5 | Home + Visitor sideline task separation |
| IR Tech | 33 | 39 | +6 | Booth operations counted separately |
| O2O | 13 | 18 | +5 | Field positioning tasks |
| **Hawk-Eye** | **68** | **150 (81 GD-1 + 69 GD)** | **+82** | **GD-1 day-prior tasks not in dashboard** |
| WiFi | 31 | 38 | +7 | WiFi Results data rows counted |
| C2P Home | 60 | 66 | +6 | Additional setup/teardown |
| C2P Visitor | 60 | 66 | +6 | Additional setup/teardown |
| SVS Home | 67 | 77 (112 in Simplified) | +45 | Booth vs Sideline separation |
| SVS Visitor | 66 | 76 (112 in Simplified) | +46 | Booth vs Sideline separation |
| EFC | 24 | 32 | +8 | CBRS scan by location |

### Resolution Required

1. **Hawk-Eye GD-1 Integration**: The 81 day-prior tasks must be integrated into the EVERGAME temporal framework starting at T-1 Day
2. **Location-Based Task Filtering**: GDAS must filter tasks by location (e.g., "Home Booth" vs "Visitor Sideline")
3. **Dashboard Recalculation**: Update dashboard formula to count all executable tasks

---

## 2. HAT Color → System Mapping

| HAT Color | System(s) | Positions | Locations |
|-----------|-----------|-----------|-----------|
| **Blue** | IVRS | 4 | Home Booth, Visitor Booth, Home Field, Visitor Field |
| **Gray** | FTR, IR Tech, WiFi | 3 (FTR=1, IR Tech=1, WiFi shared) | Sidelines, Booth, Stadium-Wide |
| **Orange - NFL Shield** | C2P | 2 | Home Sideline, Visitor Sideline |
| **Orange - EFC** | EFC | 1 | Stadium-Wide |
| **Purple** | SVS | 4 | Home Sideline, Visitor Sideline, Home Booth, Visitor Booth |
| **VENDOR** | Hawk-Eye | 1 | Truck, FTC Rack, IR Booth, IVRS Booth |

### Out of Scope Systems (Not in Current GDAS)
- Teal: Instant Replay Field Communicator
- Maroon: Instant Replay Field Operators
- Red: Certified Athletic Trainer Spotter
- Green: Sideline Television Coordinator
- Yellow: C2C (Club)

---

## 3. Hawk-Eye Day-Prior (GD-1) Task Structure

**Critical Finding:** Hawk-Eye tasks start the day prior to game day. This must drive the temporal orchestration.

### GD-1 Task Sequence

| Section | Tasks | Dependencies | Purpose |
|---------|-------|--------------|---------|
| 1.0-1.5 | Arrival & Contact | None | TV Truck coordination |
| 2.0-2.8 | FTC Rack Room | Section 1 | Equipment power validation |
| 3.0-3.4 | Patching | Section 2 + Section 8 | Video feed routing |
| 4.0-4.7 | IR Setup | Section 3 | Instant Replay operational |
| 5.0-5.16 | IVR Booth Setup | Section 4 | IVRS operational |
| 6.0-6.18 | Testing & Confirmation | Section 5 | System validation |
| 7.0-7.6 | IVRS Layouts | Section 6 | Layout configuration |
| 8.0-8.7 | Flyaway Rack | Section 3 | A-Games only |

### Equity-Critical GD-1 Tasks
- **Hawk-Eye 4.5**: Touchscreen calibration (all 3 monitors)
- **Hawk-Eye 5.4**: Confirm Spotter receiving input
- **Hawk-Eye 5.9**: Confirm stream decks programmed
- **Hawk-Eye 7.6**: Layouts complete and verified

---

## 4. WiFi Task Logic & Tracking Requirements

### WiFi Channel Monitoring Workflow

```
T-4h: Tech arrives → Measure SOP default channels
    ├── If CLEAR → Set to default, monitor
    └── If NOT CLEAR → Find clear channel → Document deviation → Communicate to WhatsApp

T-3h, T-1.5h, T-30m: Repeat channel checks
    ├── If performance drop → May adjust channels
    └── Document any channel jumps

T0 (Kickoff): Best possible channels locked
```

### Evidence Capture Requirements

| Task | Evidence Type | Tracking Need |
|------|---------------|---------------|
| WiFi_1.4/1.10 | Test result (NO screenshot) | Default vs deviation |
| WiFi_1.5-1.6/1.11-1.12 | X marks on WiFi Results sheet | Roaming handoff yardline |
| WiFi_1.7-1.8/1.13-1.14 | dBm values in structured format | Signal quality thresholds |
| WiFi_4.3, 5.2 | WhatsApp post | Status + any deviations |

### What We Need to Know and Track

| Requirement | Data Point | Purpose |
|-------------|------------|---------|
| Tech completed checks | Task completion timestamps | Task KPI |
| Default config deviations | Channel change log with timestamp | Service analysis |
| Channel jump frequency | Count of jumps per game/stadium | Trending data |
| dBm values by location | Structured readings at yardlines | Quality baseline |
| Antenna angles | Yardline target recorded | Setup consistency |

### KPI Metrics for WiFi Service Analysis

1. **Channel Deviation Rate**: % of games where default config was changed
2. **Jump Frequency**: Average channel changes per game
3. **Signal Quality**: % of dBm readings above -80 threshold
4. **Roaming Consistency**: Variance in handoff yardlines
5. **Stadium Comparison**: Trending across all 32 venues

---

## 5. Critical Milestone → Task Dependency Chain

### M1 (Day Prior) - Hawk-Eye Only
- IR Setup → IVRS Layouts → Day-prior confirmation

### M2 (T-7h to T-5h)
- Feed Confirmation (Hawk-Eye 1.1)
- IR Booth Ops Check (Hawk-Eye 3.1)
- IRV Booth Ops Check (Hawk-Eye 3.2-3.4)

### M3 (T-5h to T-3h)
- IR Ops Check (IR Tech 1.3, 1.8)
- RF(I) Requests (EFC 2.3, C2P 2.2)
- C2C Ops Check (C2P 2.21)
- IR Booth & Official Review (IR Tech 2.3, 2.4)
- SVS Booth Ops Check (SVS 3.2, 3.3, 4.1)

### M4 (T-3h to T-1h)
- SVS Booth Ops Check (SVS 6.1)
- IR Booth Ops Check (IR Tech 4.2, 4.3)
- IVRS Ops Check (IR Tech 4.4, IVRS 5.3)
- RFI Check (EFC 7.1)
- SVS Booth Ops Check (SVS 8.1)

### M5 (Game Live)
- SVS Monitoring (SVS 9.1, 9.2, 9.3)
- RFI Check (C2P 5.1)
- RFI Monitoring (EFC 8.1)

### M6 (End of Game)
- Secure C2C/C2P (C2P 6.1, 6.2, 6.3)
- Secure IVR Equipment (WiFi 7.2, 7.3)
- Review SVS Logs (SVS 10.2)
- Secure SVS Tablets (SVS 10.3)
- Inventory & Secure Batteries (FTR 5.1, 5.2)
- Resolve Comm Issues (FTR 5.3)

---

## 6. System Dependency Governance (EVERGAME)

### Upstream Dependencies

| System | Depends On | Gate Logic |
|--------|------------|------------|
| IVRS | EFC (2.1-2.5) | RF coordination complete |
| FTR | WiFi Results, C2P (1.1-1.17) | Network and radio ready |
| SVS | EFC (2.1-2.5), FTR (3.1) | RF clear, network up |
| WiFi | EFC (2.1-2.5) sequential | RF coordination window |
| Hawk-Eye GD | Hawk-Eye GD-1 (ALL) | Day-prior setup complete |

### Blocking Relationships

| System | Blocks | Reason |
|--------|--------|--------|
| EFC | All RF systems | CBRS scan must complete first |
| FTR | SVS, IVRS | Network switches must be operational |
| Hawk-Eye GD-1 | Hawk-Eye GD | Day-prior setup is prerequisite |

---

## 7. Evidence Capture by System

### Photo Evidence Required

| System | Task | Photo Subject |
|--------|------|---------------|
| FTR | 1.6 | Tech cart with 4 antennas visible |
| Hawk-Eye | 4.70, 5.16 | IR Booth setup, IVR Booth setup |
| Hawk-Eye | 6.10 | World Feed A/B on test monitor |
| EFC | 1.3-1.9 | CBRS scans (4 field locations + perimeter) |
| SVS | 3.3 | 1x8 monitors showing 6 feeds |

### Structured Data Evidence

| System | Task | Data Structure |
|--------|------|----------------|
| WiFi | 1.7-1.14 | dBm values by yardline (Left 25 to Right 25) |
| WiFi | 1.5-1.6, 1.11-1.12 | Roaming handoff yardline |
| WiFi | 1.15 | Antenna angle yardlines |
| SVS | 3.3 | Device count = 20 |

### WhatsApp Confirmation Evidence

| System | Tasks Requiring WhatsApp Post |
|--------|------------------------------|
| Hawk-Eye | 1.2, 4.6, 5.15, 6.10, 6.16, 6.17, 7.6, 7.19 |
| WiFi | 1.1, 4.3, 5.2 |
| FTR | 1.1, 1.6 |
| IVRS | 1.1 |
| EFC | 1.1, all CBRS scans |
| SVS | 3.1, 3.2 |

---

## 8. Discrepancy Resolution Matrix

| ID | Discrepancy | Current State | Required State | Priority |
|----|-------------|---------------|----------------|----------|
| D1 | Hawk-Eye GD-1 not in temporal frame | GD-1 tasks excluded | Integrate 81 tasks at T-1 Day | **CRITICAL** |
| D2 | Dashboard task counts | 509 shown | ~660+ actual | HIGH |
| D3 | IVRS location split | Single sheet | 4 positions (Booth/Field × Home/Visitor) | HIGH |
| D4 | SVS location split | 2 sheets | 4 positions (Booth/Sideline × Home/Visitor) | HIGH |
| D5 | WiFi evidence structure | Manual notes | Structured dBm + channel deviation log | HIGH |
| D6 | Task section rows | Counted as tasks | Exclude header/section rows | MEDIUM |
| D7 | WiFi Results sheet | Separate tracking | Integrate into task evidence | MEDIUM |

---

## 9. GDAS Display Requirements by Role

### GDA View (Task Execution)

| Display Element | Source |
|-----------------|--------|
| System-specific tasks | Filter by assigned system |
| Location-specific tasks | Filter by assigned position |
| Temporal window | T-6h to T+6h (except Hawk-Eye starts T-1 Day) |
| Dependencies | Show blocked status if upstream incomplete |
| Evidence capture | Show required evidence type for each task |

### Supervisor View (Monitoring)

| Display Element | Source |
|-----------------|--------|
| All system completion % | Aggregate task completion by system |
| Milestone progress | Tasks complete per M1-M6 |
| Dependency chain status | Blocking relationships highlighted |
| Issue tracking | Tasks in Fail/Blocked status |

### WiFi Service Analysis View

| Display Element | Source |
|-----------------|--------|
| Channel deviation log | WiFi task notes field |
| dBm trending | WiFi Results structured data |
| Stadium comparison | Cross-game aggregation |
| Jump frequency | Count of channel changes per game |

---

## 10. Recommended Actions

1. **Immediate**: Integrate Hawk-Eye GD-1 tasks into EVERGAME temporal framework
2. **Short-term**: Implement location-based task filtering for IVRS, SVS, C2P
3. **Short-term**: Add WiFi structured evidence capture (dBm values, channel deviation log)
4. **Medium-term**: Update dashboard formulas to reflect actual task counts
5. **Medium-term**: Build WiFi service analysis dashboard with trending capabilities
6. **Long-term**: Implement cross-stadium WiFi performance comparison

---

*This analysis is based on the NFL Source of Truth documents provided and cross-referenced with the EVERGAME system architecture documentation in the project knowledge base.*
