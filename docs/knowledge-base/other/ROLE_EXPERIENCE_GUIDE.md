# NFLIT360 Build 8.3.1 - Role Experience Guide
## Complete Orchestration Journeys for Every Stakeholder

**Version:** 8.3.1
**Date:** December 19, 2025
**Framework:** Sentrais Temporal Engine + NIN Intelligence

---

## Executive Summary

This guide documents the complete user experience for every role in the NFLIT360 ecosystem across the game day lifecycle. Each role has a distinct journey through the temporal framework (T-6h to T+6h), with specific touchpoints, dashboards, actions, and expectations.

---

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        IT EXECUTIVE (CTO)                        │
│                    Strategic Oversight Layer                     │
│         Dashboard: IT Executive Dashboard | Mobile: Yes          │
├─────────────────────────────────────────────────────────────────┤
│                          NFL IT LEAD                             │
│                    Operational Command Layer                     │
│          Dashboard: NFL Lead Dashboard | Mobile: Yes             │
├─────────────────────────────────────────────────────────────────┤
│                        GDA SUPERVISOR                            │
│                    Field Coordination Layer                      │
│           Dashboard: Supervisor Console | Mobile: Yes            │
├─────────────────────────────────────────────────────────────────┤
│                      GDA FIELD OPERATORS                         │
│                    Task Execution Layer                          │
│                App: GDA Digital Readiness App                    │
│                                                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│  │ EFC │ │IVRS │ │ C2P │ │ SVS │ │ FTR │ │IR_T │ │ O2O │ │WiFi ││
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘│
│                         ┌─────────┐                              │
│                         │Hawk_Eye │                              │
│                         └─────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics by Role

| Role | Primary View | Key Actions | Critical Moments | Success Metric |
|------|--------------|-------------|------------------|----------------|
| **IT Executive** | League-wide dashboard | Monitor, escalate, approve overrides | T-4h (visibility), T-2h (issues), T-1h (gate) | All games 100% at kickoff |
| **NFL Lead** | Single game dashboard | Manage GDAs, resolve issues, edit playbooks | All milestones, issue resolution | Game 100% at kickoff, report submitted |
| **GDA Supervisor** | Team status mobile | Coordinate field, assist GDAs | Dependency unblocks, issue triage | Team tasks complete on time |
| **EFC Coordinator** | Task list (gatekeeper) | Spectrum scan, clearance certification | T-5h scan, unblock C2P/WiFi | Clear spectrum, unblock downstream |
| **IVRS Tech** | Task list | Booth setup, tablet deployment | Equipment check, IVRS validation | All booths operational |
| **C2P Tech** | Task list (dependent) | Radio setup, frequency programming | Post-EFC unblock, coach distribution | Radios distributed, tested |
| **SVS Tech** | Task list (dependent) | Tablet deployment, network test | Post-FTR unblock, sideline ready | Tablets online, synced |
| **FTR Tech** | Task list (gatekeeper) | Network validation | Endpoint validation, unblock SVS/Hawk | Network certified |
| **Hawk-Eye Tech** | Task list (vendor) | Camera setup, broadcast integration | Post-FTR/IR unblock | Video feeds operational |

---

## Temporal Milestones

| Milestone | Time | Phase | Threshold | Description |
|-----------|------|-------|-----------|-------------|
| M1 | T-5h | DISCOVER | 0% | Game Open |
| M2 | T-4h | DIAGNOSE | 70% | Systems Arrival - Exec visibility starts |
| M3 | T-3h | DEPLOY | 90% | Validation Start |
| M4 | T-1h | VALIDATE | 100% | Final Readiness Gate |
| M5 | T0-T+3h | OPERATE | 100% | Game Active |
| M6 | T+2h-T+4h | DEBRIEF | N/A | Post-Game Reporting |

---

## GDA Systems Reference

| System ID | Name | Tier | Hat Color | Positions | Gates | Blocked By |
|-----------|------|------|-----------|-----------|-------|------------|
| EFC | Equity & Frequency Coordination | Gatekeeper | Orange | 1 | C2P, WiFi | - |
| IVRS | Instant Video Replay System | Critical | Blue | 4 | C2P | - |
| C2P | Coach-to-Player Communication | Critical | Orange | 2 | - | EFC, IVRS |
| SVS | Sideline Video System | Critical | Purple | 4 | - | FTR |
| FTR | Field Technology Resources | Critical | Gray | 2 | SVS, Hawk_Eye | - |
| IR_Tech | Instant Replay Technology | Critical | Gray | 1 | Hawk_Eye | - |
| O2O | Official-to-Official Communication | High | Gray | 1 | - | - |
| WiFi | Stadium WiFi Infrastructure | High | N/A | 1 | - | EFC |
| Hawk_Eye | Hawk-Eye Video Review System | High | Vendor | 1 | - | FTR, IR_Tech |

---

## Notification Matrix

| Event | IT Exec | NFL Lead | Supervisor | GDA |
|-------|---------|----------|------------|-----|
| Game window opens (T-6h) | - | Push | Push | Push |
| Milestone threshold breach | Push | Push | Push | - |
| Task assigned | - | - | - | Push |
| Task blocked | - | Feed | Push | Push |
| Task unblocked | - | Feed | Push | Push |
| Task completed | - | Feed | Feed | Confirm |
| Task failed | If critical | Push | Push | Push |
| Issue created (LOW) | - | Feed | Feed | - |
| Issue created (MEDIUM) | - | Push | Push | - |
| Issue created (HIGH) | At T-2h | Push | Push | - |
| Issue created (CRITICAL) | Push | Push | Push | - |
| Issue resolved | - | Push | Push | If owner |
| System unblocked | - | Push | Push | If affected |
| 100% readiness achieved | Push | Push | Push | - |
| Kickoff | Push | Push | Push | Push |
| Post-game report due | - | Push | - | - |

---

## Escalation Timing

### Auto-Escalation Rules
- HIGH issue unresolved >30 min after T-2h → IT Exec alert
- CRITICAL issue created → Immediate all-level alert
- Game <90% at T-1h → IT Exec conference call triggered
- Game <100% at T-15m → Emergency protocol activated

### Time-Based Escalation Flow

| Time | GDA Level | Supervisor | NFL Lead | IT Executive |
|------|-----------|------------|----------|--------------|
| T-6h | Report Issues | Triage Issues | - | - |
| T-4h | Update Status | Coordinate | Monitor/Resolve | League Overview |
| T-2h | Assist Resolve | Escalate if needed | ALL ISSUES VISIBLE | Game Focus |
| T-1h | Final Push | Emergency Support | Override Authority | Final Gate |

---

## Task States

```
Open → In Progress → Complete
     → Blocked → Open (when deps satisfied)
     → Skipped (requires authorization)
In Progress → Fail (requires incident)
```

### State Transitions
| From | To (Valid) |
|------|------------|
| Open | In Progress, Blocked, Skipped |
| Blocked | Open |
| In Progress | Complete, Fail |
| Complete | (terminal) |
| Fail | (terminal) |
| Skipped | (terminal) |

---

## Quick Reference Cards

### IT Executive
- **When to Act:** T-4h (compliance), T-2h (issues), T-1h (gate), CRITICAL anytime
- **Key Metrics:** All games ≥70% at T-4h, ≥90% at T-3h, =100% at T-1h
- **Actions:** Approve overrides, escalation calls, emergency decisions

### NFL Lead
- **Authority:** Edit playbooks, resolve issues, manage GDAs, request overrides
- **Targets:** M1=0%, M2=70%, M3=90%, M4=100%
- **Post-Game:** GMS report due T+4h

### GDA Operator
- **Task States:** Open, In Progress, Blocked, Complete, Failed, Skipped
- **Evidence Required:** Photo/screenshot, timestamp (auto), notes
- **Need Help:** Call Supervisor, Report Issue in app

### Gatekeeper (EFC/FTR/IR_Tech)
- **EFC Gates:** C2P, WiFi (after spectrum clearance)
- **FTR Gates:** SVS, Hawk_Eye (after network validation)
- **IR_Tech Gates:** Hawk_Eye (after calibration)
- **Priority:** Complete gate tasks ASAP - others are waiting!

---

**Document Version:** 8.3.1
**Last Updated:** December 19, 2025
**Maintained By:** NFLIT360 Architecture Team
