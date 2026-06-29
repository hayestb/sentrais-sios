# NFLIT360 Build 8.3.2 - Role Experience Guide (Consolidated)
## Complete User Journey Documentation - All Roles, All Phases

---

## Document Overview

This is the **CORE TOOLKIT** document for NFLIT360 user experience. It covers every stakeholder's complete journey from pre-game assignment through post-game reporting.

### Cross-Reference Documents
| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Detailed assignment rules, override flows | Assignment questions |
| [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Issue lifecycle, triage, escalation | Issue handling questions |
| [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Playbook edit authority, lock states | Playbook edit questions |

---

## Role Hierarchy & Authority Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    NFLIT360 ROLE HIERARCHY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      ┌─────────────────┐                        │
│                      │  IT EXECUTIVE   │                        │
│                      │     (CTO)       │                        │
│                      │                 │                        │
│                      │ Exception       │                        │
│                      │ Reports Only    │                        │
│                      └────────┬────────┘                        │
│                               │                                  │
│                      ┌────────┴────────┐                        │
│                      │       VP        │                        │
│                      │   Operations    │                        │
│                      │                 │                        │
│                      │ Override        │                        │
│                      │ Authority       │                        │
│                      └────────┬────────┘                        │
│                               │                                  │
│              ┌────────────────┼────────────────┐                │
│              │                │                │                │
│      ┌───────┴───────┐ ┌─────┴─────┐ ┌───────┴───────┐        │
│      │   NFL LEAD    │ │NFL LEAD   │ │   NFL LEAD    │        │
│      │   Game 1      │ │Game 2     │ │   Game 3      │        │
│      │               │ │           │ │               │        │
│      │ Full Game     │ │Full Game  │ │ Full Game     │        │
│      │ Authority     │ │Authority  │ │ Authority     │        │
│      └───────┬───────┘ └─────┬─────┘ └───────┬───────┘        │
│              │               │               │                  │
│      ┌───────┴───────┐       │       ┌───────┴───────┐        │
│      │  SUPERVISOR   │       │       │  SUPERVISOR   │        │
│      │  (Field)      │       │       │  (Field)      │        │
│      └───────┬───────┘       │       └───────┬───────┘        │
│              │               │               │                  │
│      ┌───────┴───────┐       │       ┌───────┴───────┐        │
│      │  GDA TEAM     │       │       │  GDA TEAM     │        │
│      │  (9 Systems)  │       │       │  (9 Systems)  │        │
│      └───────────────┘       │       └───────────────┘        │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

### Override Authority Summary

| Override Type | Authority | IT Exec Role |
|---------------|-----------|--------------|
| Same-day game assignment | VP Operations | Exception report |
| Same-game multiple system | VP Operations | Exception report |
| Playbook hard lock | VP Operations | Exception report |
| Task skip authorization | VP Operations | Exception report |
| Emergency game decision | VP + IT Exec | Direct involvement |

---

# PART 1: PRE-GAME EXPERIENCE (GD-7 to GD-1)

## 1.1 GDA Pre-Assignment Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    GDA ASSIGNMENT MODEL                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GDAs are PRE-ASSIGNED to games by NFL Operations               │
│                                                                  │
│  Assignment is based on:                                        │
│  • Certification level (L1, L2, L3)                             │
│  • Geographic availability                                      │
│  • System specialization                                        │
│  • Historical performance                                       │
│                                                                  │
│  ═══════════════════════════════════════════════════════════════│
│                                                                  │
│  WHAT GDAs CHOOSE:                                              │
│  ✅ Position within their assigned system (multi-position only) │
│                                                                  │
│  WHAT GDAs DO NOT CHOOSE:                                       │
│  ❌ Which game to work                                          │
│  ❌ Which system to operate                                     │
│  ❌ Which day to work                                           │
│                                                                  │
│  ═══════════════════════════════════════════════════════════════│
│                                                                  │
│  ASSIGNMENT CONSTRAINT:                                         │
│  One GDA → One System → One Game → One Day                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Team Assignment Concept

GDAs assigned to multi-position systems (IVRS, SVS, C2P, FTR) are assigned as a **TEAM**. Position selection is simply choosing which location within the team assignment they will work.

```
EXAMPLE: IVRS Team Assignment - Week 16 Saints @ Falcons

┌─────────────────────────────────────────────────────────────────┐
│  IVRS TEAM (4 GDAs Assigned)                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Team Members:           Position Selection:                    │
│  • J. Martinez  ───────► Home Booth (self-selected)            │
│  • S. Lee       ───────► Visitor Booth (self-selected)         │
│  • K. Brown     ───────► Home Field (self-selected)            │
│  • A. Patel     ───────► Visitor Field (self-selected)         │
│                                                                  │
│  All 4 GDAs were pre-assigned to IVRS for this game.           │
│  They simply selected which position to work.                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1.2 GD-7: Assignment Notification

### What GDA Sees (7 Days Before Game)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 NEW GAME ASSIGNMENT                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  You have been assigned to an upcoming game                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ASSIGNMENT DETAILS                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Game:       Week 16 - Saints @ Falcons                     ││
│  │  Date:       Sunday, January 4, 2025                        ││
│  │  Kickoff:    1:00 PM ET                                     ││
│  │  Venue:      Mercedes-Benz Stadium, Atlanta                 ││
│  │                                                              ││
│  │  YOUR ASSIGNMENT                                            ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │  System:     IVRS (Instant Video Replay System)             ││
│  │  Team Size:  4 GDAs                                         ││
│  │  Hat Color:  🔵 Blue                                        ││
│  │                                                              ││
│  │  POSITION SELECTION                                         ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │  ⚠️ Action Required: Select your position                  ││
│  │  Deadline: GD-3 (January 1)                                 ││
│  │                                                              ││
│  │  [Select Position Now]                                      ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  YOUR CERTIFICATION                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Level: L2 ✅ Valid for IVRS                                ││
│  │  Expires: March 15, 2025                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [View Assignment]  [Select Position]  [Report Conflict]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Position Selection Screen (Multi-Position Systems Only)

```
┌─────────────────────────────────────────────────────────────────┐
│  SELECT YOUR POSITION - IVRS                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | Mercedes-Benz Stadium             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR TEAM (IVRS - 4 Positions)                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  ┌─────────────────┐    ┌─────────────────┐                ││
│  │  │   HOME BOOTH    │    │  VISITOR BOOTH  │                ││
│  │  │   Level 2+2     │    │   Level 2+2     │                ││
│  │  │                 │    │                 │                ││
│  │  │  🟢 AVAILABLE   │    │  🟢 AVAILABLE   │                ││
│  │  │                 │    │                 │                ││
│  │  │  [SELECT]       │    │  [SELECT]       │                ││
│  │  └─────────────────┘    └─────────────────┘                ││
│  │                                                              ││
│  │  ┌─────────────────┐    ┌─────────────────┐                ││
│  │  │   HOME FIELD    │    │  VISITOR FIELD  │                ││
│  │  │   Level 2       │    │   Level 2       │                ││
│  │  │                 │    │                 │                ││
│  │  │  🔴 TAKEN       │    │  🟢 AVAILABLE   │                ││
│  │  │  (S. Lee)       │    │                 │                ││
│  │  │                 │    │  [SELECT]       │                ││
│  │  └─────────────────┘    └─────────────────┘                ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  TEAM MEMBERS ASSIGNED:                                         │
│  • S. Lee - Home Field ✅                                       │
│  • J. Martinez - Pending selection                              │
│  • K. Brown - Pending selection                                 │
│  • A. Patel - Pending selection                                 │
│                                                                  │
│  ℹ️ All positions have the same tasks. You're choosing your    │
│     work location within the team.                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Position Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ POSITION CONFIRMED                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR COMPLETE ASSIGNMENT                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Game:       Week 16 - Saints @ Falcons                     ││
│  │  Date:       Sunday, January 4, 2025                        ││
│  │  Venue:      Mercedes-Benz Stadium                          ││
│  │                                                              ││
│  │  System:     IVRS                                           ││
│  │  Position:   🔒 HOME BOOTH                                  ││
│  │  Hat Color:  🔵 Blue                                        ││
│  │                                                              ││
│  │  Arrival:    T-5h (8:00 AM for 1:00 PM kickoff)            ││
│  │  Check-in:   Gate C - Credential Office                     ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  YOUR IVRS TEAM:                                                │
│  • J. Martinez - Home Booth (You)                               │
│  • S. Lee - Home Field                                          │
│  • K. Brown - Visitor Booth                                     │
│  • A. Patel - Visitor Field                                     │
│                                                                  │
│  [Add to Calendar]  [View Venue Map]  [Contact Supervisor]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Single-Position Systems (No Selection Required)

For EFC, WiFi, O2O, IR_Tech, Hawk-Eye - GDAs are assigned directly to the position:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 NEW GAME ASSIGNMENT                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR COMPLETE ASSIGNMENT                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Game:       Week 16 - Saints @ Falcons                     ││
│  │  Date:       Sunday, January 4, 2025                        ││
│  │  Venue:      Mercedes-Benz Stadium                          ││
│  │                                                              ││
│  │  System:     EFC (Electronic Frequency Coordinator)         ││
│  │  Position:   🔒 STADIUM-WIDE (Single Position)              ││
│  │  Hat Color:  🟠 Orange                                      ││
│  │                                                              ││
│  │  ⚠️ GATEKEEPER ROLE                                        ││
│  │  Your CBRS clearance unblocks C2P and WiFi teams            ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ✅ No position selection required - single position system     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1.3 GD-1: Day Before Game

### GDA Receives Detailed Instructions

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 GAME DAY PREP - TOMORROW                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | January 4, 2025                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR ASSIGNMENT SUMMARY                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  System:     IVRS - Home Booth                              ││
│  │  Hat Color:  🔵 Blue                                        ││
│  │  Arrival:    8:00 AM (T-5h)                                 ││
│  │  Kickoff:    1:00 PM                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ARRIVAL INSTRUCTIONS                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📍 Check-in Location: Gate C - Credential Office           ││
│  │  🅿️ Parking: Lot B - Staff Entrance                        ││
│  │  📱 Contact on arrival: M. Thompson (Supervisor)            ││
│  │     Phone: (555) 123-4567                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  YOUR TASKS TOMORROW (Preview)                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  1. Arrival confirmation                                    ││
│  │  2. Equipment inventory check                               ││
│  │  3. Tablet power-on and connectivity test                   ││
│  │  4. Replay system integration test                          ││
│  │  5. Booth-field sync verification                           ││
│  │  6. Final IVRS certification                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  YOUR TEAM                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Supervisor: M. Thompson                                    ││
│  │  NFL Lead: S. Johnson                                       ││
│  │  IVRS Teammates:                                            ││
│  │  • S. Lee (Home Field)                                      ││
│  │  • K. Brown (Visitor Booth)                                 ││
│  │  • A. Patel (Visitor Field)                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  WEATHER FORECAST                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  🌤️ Partly Cloudy | High: 52°F | Low: 38°F                 ││
│  │  Indoor stadium - no weather impact expected                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Confirm Attendance]  [View Venue Map]  [Contact Supervisor]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1.4 Assignment Conflict & Override Process

### When GDA Has a Conflict

If a GDA cannot work their assigned game, they report a conflict:

```
┌─────────────────────────────────────────────────────────────────┐
│  REPORT ASSIGNMENT CONFLICT                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ASSIGNED GAME                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Week 16 - Saints @ Falcons | Jan 4 | 1:00 PM               ││
│  │  System: IVRS | Position: Home Booth                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CONFLICT REASON                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Personal emergency                                        ││
│  │ ● Schedule conflict                                         ││
│  │ ○ Illness/medical                                           ││
│  │ ○ Transportation issue                                      ││
│  │ ○ Other (specify)                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DETAILS                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Prior commitment - family event scheduled before I          ││
│  │ received this assignment.                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ⚠️ Your conflict will be reviewed by your Supervisor          │
│     and NFL Lead. You will be notified of the decision.        │
│                                                                  │
│  [Cancel]  [Submit Conflict Report]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### VP Override (For Exceptions)

If operations needs to assign a GDA to a second game same day (rare):

```
┌─────────────────────────────────────────────────────────────────┐
│  VP OPERATIONS - OVERRIDE REQUEST                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🔔 Exception Request - Same Day Assignment                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUESTOR: NFL Lead - S. Johnson                               │
│  REQUEST TYPE: Assign GDA to second game same day               │
│                                                                  │
│  GDA: J. Martinez                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  CURRENT ASSIGNMENT                                         ││
│  │  Game 1: Saints @ Falcons | 1:00 PM | IVRS                  ││
│  │  Expected End: ~4:00 PM                                     ││
│  │                                                              ││
│  │  REQUESTED ADDITIONAL ASSIGNMENT                            ││
│  │  Game 2: Bears @ Lions | 4:25 PM | IVRS                     ││
│  │  Same venue (double-header)                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  JUSTIFICATION FROM NFL LEAD:                                   │
│  "Same stadium double-header. IVRS tech called out sick.        │
│   J. Martinez is only qualified and available backup.           │
│   Minimal travel, games are back-to-back at same venue."        │
│                                                                  │
│  RISK ASSESSMENT                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ⚠️ Gap between games: 25 minutes                          ││
│  │  ⚠️ Total work hours: ~9 hours                             ││
│  │  ✅ Same venue - no travel                                  ││
│  │  ✅ GDA certified for both                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DECISION                                                       │
│  ○ Approve Override                                             │
│  ○ Deny - Find alternative                                      │
│                                                                  │
│  Notes:                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Deny]  [Approve Override]                                     │
│                                                                  │
│  ⚠️ This exception will appear on IT Executive's report        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

> 📋 **Cross-Reference:** See [Assignment Logic Document](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) for complete override rules and state machine.

---

# PART 2: GAME DAY EXPERIENCE BY ROLE

## 2.1 IT Executive Experience

### Role Profile

| Attribute | Value |
|-----------|-------|
| **Primary Function** | League-wide oversight, exception monitoring |
| **Scope** | All games across all venues |
| **Key Responsibility** | Receive exception reports, emergency decisions only |
| **Decision Authority** | Emergency game decisions (with VP) |
| **Visibility** | Aggregate metrics, exception reports, escalated issues |

### Pre-Game Week: Exception Report Review

```
┌─────────────────────────────────────────────────────────────────┐
│  IT EXECUTIVE DASHBOARD - EXCEPTION REPORT                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 Games | Sunday Slate                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WEEKLY SUMMARY                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Total Games This Week:     13                              ││
│  │  GDAs Assigned:             208                             ││
│  │  Certification Compliance:  98.2%                           ││
│  │  Venue Readiness:           92% (avg)                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔔 EXCEPTIONS THIS WEEK (4)                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Type                 │ Game        │ Status   │ VP     ││
│  │───│──────────────────────│─────────────│──────────│────────││
│  │ 1 │ Same-Day Assignment  │ ATL DH      │ Approved │ Smith  ││
│  │ 2 │ Playbook Override    │ CHI @ DET   │ Approved │ Smith  ││
│  │ 3 │ Task Skip Auth       │ SF @ SEA    │ Pending  │ Jones  ││
│  │ 4 │ Certification Waiver │ MIA @ BUF   │ Denied   │ Smith  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [View Exception Details]  [Export Report]                      │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                  │
│  GAMES REQUIRING ATTENTION                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ CHI @ DET - 2 HIGH issues, readiness at 94%             ││
│  │ ⚠️ SF @ SEA - Pending task skip approval                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Game Day: Compliance Countdown (T-4h)

```
┌─────────────────────────────────────────────────────────────────┐
│  IT EXECUTIVE - COMPLIANCE COUNTDOWN                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Active Games: 4 | ⏱️ Compliance Window Open                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1:00 PM GAMES (T-4h = 9:00 AM)                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Game             │ Readiness │ Issues │ Status              ││
│  │──────────────────│───────────│────────│─────────────────────││
│  │ NO @ ATL         │    72%    │   0    │ ✅ On Track         ││
│  │ CHI @ DET        │    68%    │   2    │ ⚠️ Monitoring      ││
│  │ NYG @ PHI        │    70%    │   1    │ ✅ On Track         ││
│  │ JAX @ TEN        │    75%    │   0    │ ✅ On Track         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  MILESTONE TARGETS:                                             │
│  • T-4h: 70% minimum ✅                                         │
│  • T-2h: 90% minimum                                            │
│  • T-1h: 100% required                                          │
│                                                                  │
│  ⚠️ CHI @ DET has 2 HIGH priority issues                       │
│  [View Issue Details]                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### T-2h: Issue Visibility Window Opens

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 ISSUE VISIBILITY WINDOW - T-2h                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  All HIGH priority issues now visible                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OPEN HIGH PRIORITY ISSUES                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │ ISS-441 | CHI @ DET | IVRS Booth 3                          ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Severity: 🟠 HIGH | Age: 1h 20m | Status: In Progress       ││
│  │ Issue: Hardware failure - tablet not powering on            ││
│  │ Owner: J. Martinez + On-site Support                        ││
│  │ Resolution: Deploying backup equipment                      ││
│  │ ETA: 30 minutes                                             ││
│  │                                                              ││
│  │ Game Readiness Impact: -6% if unresolved                    ││
│  │                                                              ││
│  │ [View Details]                                              ││
│  │                                                              ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │ ISS-443 | CHI @ DET | C2P Home Side                         ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Severity: 🟠 HIGH | Age: 45m | Status: In Progress          ││
│  │ Issue: Radio sync with EFC clearance                        ││
│  │ Owner: K. Brown                                             ││
│  │ Resolution: Standard sync procedure                         ││
│  │ ETA: 20 minutes                                             ││
│  │                                                              ││
│  │ [View Details]                                              ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ℹ️ Issues are being managed by NFL Lead. No action required   │
│     unless escalated or game falls below 90% at T-1h.          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### T-1h: Final Gate

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 FINAL GATE CHECK - T-1h                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  100% Readiness Required for Kickoff                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1:00 PM GAMES - FINAL STATUS                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Game             │ Readiness │ Status                       ││
│  │──────────────────│───────────│──────────────────────────────││
│  │ NO @ ATL         │   100%    │ ✅ READY                     ││
│  │ CHI @ DET        │    96%    │ ⚠️ 1 TASK PENDING OVERRIDE  ││
│  │ NYG @ PHI        │   100%    │ ✅ READY                     ││
│  │ JAX @ TEN        │   100%    │ ✅ READY                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔔 EXCEPTION: CHI @ DET                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ VP Operations has approved task skip for IVRS Booth 3       ││
│  │ Reason: Hardware failure, 3/4 booths operational            ││
│  │ Risk: 🟡 MEDIUM - Reduced redundancy                        ││
│  │                                                              ││
│  │ This exception is logged in your weekly report.             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Acknowledge]  [View Full Report]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2.2 VP Operations Experience

### Role Profile

| Attribute | Value |
|-----------|-------|
| **Primary Function** | Operational oversight, override authority |
| **Scope** | All games, all operational decisions |
| **Key Responsibility** | Approve exceptions, manage escalations |
| **Decision Authority** | All override types (assignment, playbook, task skip) |
| **Reports To** | IT Executive (exception summaries) |

### Override Approval Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  VP OPERATIONS - OVERRIDE QUEUE                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Active Games: 4 | Pending Overrides: 2                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔔 PENDING APPROVAL (2)                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │ OVERRIDE #1 - PLAYBOOK HARD LOCK                           ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Game: CHI @ DET | Time to Kick: 52 min                      ││
│  │ Requestor: S. Johnson (NFL Lead)                            ││
│  │ Request: Skip IVRS Booth 3 power-on task                    ││
│  │ Reason: Hardware failure, cannot resolve                    ││
│  │ Risk: 🟡 MEDIUM                                             ││
│  │ Age: 3 minutes                                              ││
│  │                                                              ││
│  │ [View Details]  [Deny]  [Approve]                           ││
│  │                                                              ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │ OVERRIDE #2 - SAME-DAY ASSIGNMENT                          ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Requestor: NFL Lead - T. Williams                           ││
│  │ GDA: M. Garcia                                              ││
│  │ Request: Work second game (ATL doubleheader)                ││
│  │ Reason: Staffing shortage, same venue                       ││
│  │ Risk: 🟡 MEDIUM                                             ││
│  │ Age: 15 minutes                                             ││
│  │                                                              ││
│  │ [View Details]  [Deny]  [Approve]                           ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  TODAY'S APPROVED OVERRIDES: 3                                  │
│  [View Override Log]                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

> 📋 **Cross-Reference:** See [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) for complete override workflow.

---

## 2.3 NFL Lead Experience

### Role Profile

| Attribute | Value |
|-----------|-------|
| **Primary Function** | Single game operational command |
| **Scope** | One game at one venue |
| **Key Responsibility** | 100% game readiness, issue resolution |
| **Decision Authority** | Full playbook edit (until hard lock), issue management, GDA coordination |
| **Override Request** | Can request VP override for hard lock changes |

### T-6h: Game Window Opens

```
┌─────────────────────────────────────────────────────────────────┐
│  NFL LEAD COMMAND CENTER                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | Ford Field | ⏱️ 06:00:00 to kickoff               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GAME READINESS                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Overall: 0%                                                 ││
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │                                                              ││
│  │ M1 DISCOVER (T-5h): 0% ───────────────► Target: 25%        ││
│  │ M2 DIAGNOSE (T-4h): -  ───────────────► Target: 70%        ││
│  │ M3 DEPLOY (T-2h):   -  ───────────────► Target: 90%        ││
│  │ M4 VALIDATE (T-1h): -  ───────────────► Target: 100%       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PLAYBOOK STATUS: 🟢 UNLOCKED (Hard lock at T-1h)              │
│  [Edit Playbook]                                                │
│                                                                  │
│  SYSTEM STATUS                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ System   │ Status     │ Team         │ Progress            ││
│  │──────────│────────────│──────────────│─────────────────────││
│  │ EFC      │ 🟢 Active  │ 1 GDA        │ Starting            ││
│  │ IVRS     │ 🟢 Active  │ 4 GDAs       │ Starting            ││
│  │ C2P      │ ⚪ Blocked │ 2 GDAs       │ Awaiting EFC        ││
│  │ SVS      │ ⚪ Blocked │ 4 GDAs       │ Awaiting FTR        ││
│  │ FTR      │ 🟢 Active  │ 2 GDAs       │ Starting            ││
│  │ IR_Tech  │ 🟢 Active  │ 1 GDA        │ Starting            ││
│  │ O2O      │ 🟢 Active  │ 1 GDA        │ Starting            ││
│  │ WiFi     │ ⚪ Blocked │ 1 GDA        │ Awaiting EFC        ││
│  │ Hawk_Eye │ 🏷️ Vendor │ 1 Tech       │ Camera setup        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GDA ARRIVALS: 12/16 checked in                                │
│  [View Team Status]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Playbook Management (Unlocked State)

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK EDITOR                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | IVRS System                                        │
│  Status: 🟢 UNLOCKED | Hard lock in 5h 00m                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TASKS (6 Total)                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Task Name                    │ Phase │ Positions │ Edit ││
│  │───│──────────────────────────────│───────│───────────│──────││
│  │ 1 │ Arrival confirmation         │ M1    │ All (4)   │ [✏️] ││
│  │ 2 │ Equipment inventory check    │ M1    │ All (4)   │ [✏️] ││
│  │ 3 │ Tablet power-on test         │ M2    │ All (4)   │ [✏️] ││
│  │ 4 │ Replay system integration    │ M2    │ All (4)   │ [✏️] ││
│  │ 5 │ Booth-field sync test        │ M3    │ Booth (2) │ [✏️] ││
│  │ 6 │ Final IVRS certification     │ M4    │ All (4)   │ [✏️] ││
│  │   │                              │       │           │      ││
│  │   │ [+ Add Task]                 │       │           │      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  AUTHORITY: You can freely add, modify, or delete tasks        │
│  No VP approval required until Hard Lock at T-1h                │
│                                                                  │
│  [Add Task]  [Reorder]  [Import Template]  [Save]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Playbook Soft Lock (T-4h to T-1h)

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK EDITOR                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | IVRS System                                        │
│  Status: 🟡 SOFT LOCK | Hard lock in 3h 00m                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ COMPLIANCE WINDOW ACTIVE                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ You can still edit, but:                                    ││
│  │ • All changes require a documented reason                   ││
│  │ • Changes are logged in audit trail                         ││
│  │ • IT Executive exception report will include changes        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Edit with Reason Required]                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Playbook Hard Lock - Override Request (T-1h to T0)

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK - HARD LOCKED                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | All Systems                                        │
│  Status: 🔴 HARD LOCK | Kickoff in 52 min                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔒 PLAYBOOK LOCKED FOR FINAL GATE                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ No changes can be made without VP Operations approval.      ││
│  │                                                              ││
│  │ If you need to skip a task or make emergency changes:       ││
│  │ [Request VP Override]                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CURRENT GAME STATUS: 96% Ready                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ 1 task cannot be completed:                             ││
│  │    IVRS Booth 3 - Power-on test (Hardware failure)          ││
│  │                                                              ││
│  │ [Request Override to Skip Task]                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Override Request to VP

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUEST VP OVERRIDE                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | Playbook Hard Lock Override                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUEST TYPE                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Add emergency task                                        ││
│  │ ○ Modify existing task                                      ││
│  │ ● Skip task (mark as authorized skip)                       ││
│  │ ○ Delete task                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  TASK TO SKIP                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ System: IVRS                                                ││
│  │ Position: Booth 3 (Visitor Booth)                           ││
│  │ Task: #3 - Tablet power-on test                             ││
│  │ GDA: K. Brown                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  JUSTIFICATION (Required)                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Hardware failure at Booth 3 cannot be resolved before       ││
│  │ kickoff (ISS-441). Backup equipment also failed - possible  ││
│  │ power supply issue at location. Other 3 IVRS positions      ││
│  │ (Home Booth, Home Field, Visitor Field) are 100%            ││
│  │ operational. Game can proceed safely with 3/4 coverage.     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  RISK ASSESSMENT                                                │
│  ○ 🟢 LOW - No impact to game operations                       │
│  ● 🟡 MEDIUM - Reduced redundancy                              │
│  ○ 🟠 HIGH - Potential game impact                             │
│  ○ 🔴 CRITICAL - Would not recommend proceeding                │
│                                                                  │
│  LINKED ISSUE: ISS-441 (IVRS Booth 3 hardware failure)         │
│                                                                  │
│  [Cancel]  [Submit to VP Operations]                            │
│                                                                  │
│  ⚠️ VP will be notified immediately. IT Exec receives report.  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

> 📋 **Cross-Reference:** See [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) for complete lock state rules and audit requirements.

### Issue Management

```
┌─────────────────────────────────────────────────────────────────┐
│  NFL LEAD - ISSUE DASHBOARD                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | Ford Field | ⏱️ 02:30:00 to kickoff               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ISSUE SUMMARY                                                  │
│  ┌───────┬───────┬───────┬───────┬───────┐                     │
│  │ Total │ Open  │ In Prg│Resolved│ Closed│                     │
│  │   4   │   0   │   2   │   1   │   1   │                     │
│  └───────┴───────┴───────┴───────┴───────┘                     │
│                                                                  │
│  SEVERITY SLAs                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🟢 LOW:      Resolve by end of game                         ││
│  │ 🟡 MEDIUM:   Resolve before M4 (T-1h)                       ││
│  │ 🟠 HIGH:     Resolve within 60 minutes                      ││
│  │ 🔴 CRITICAL: Immediate resolution required                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACTIVE ISSUES                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ISS-441 │ IVRS Booth 3 │ 🟠 HIGH │ 1h 45m │ In Progress    ││
│  │         │ Hardware failure - tablet not powering on         ││
│  │         │ Owner: J. Martinez + Support                      ││
│  │         │ SLA: ⚠️ 15 min remaining                         ││
│  │         │ [View] [Update] [Escalate]                        ││
│  │─────────│───────────────────────────────────────────────────││
│  │ ISS-443 │ C2P Home     │ 🟠 HIGH │ 45m    │ In Progress    ││
│  │         │ Radio sync issue                                  ││
│  │         │ Owner: K. Brown                                   ││
│  │         │ SLA: ✅ On track                                  ││
│  │         │ [View] [Update] [Escalate]                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Create Issue]  [View All]  [Filter]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

> 📋 **Cross-Reference:** See [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) for complete triage, escalation, and resolution workflows.

---

## 2.4 GDA Supervisor Experience

### Role Profile

| Attribute | Value |
|-----------|-------|
| **Primary Function** | Field team coordination |
| **Scope** | Multiple systems/positions at single venue |
| **Key Responsibility** | GDA support, issue triage, team coordination |
| **Decision Authority** | Field-level decisions, issue triage |
| **Reports To** | NFL Lead |

### Mobile Team Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  SUPERVISOR - TEAM STATUS                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  M. Thompson | Ford Field | ⏱️ 04:15:00 to kickoff             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MY TEAM (8 GDAs)                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ GDA             │ System    │ Status     │ Progress         ││
│  │─────────────────│───────────│────────────│──────────────────││
│  │ T. Wilson       │ EFC       │ ✅ Working │ 60% (3/5 tasks)  ││
│  │ J. Martinez     │ IVRS B1   │ ⚠️ Issue  │ 33% - blocked    ││
│  │ S. Lee          │ IVRS F1   │ ✅ Working │ 50% (3/6 tasks)  ││
│  │ K. Brown        │ IVRS B2   │ ✅ Working │ 50% (3/6 tasks)  ││
│  │ A. Patel        │ IVRS F2   │ ✅ Working │ 50% (3/6 tasks)  ││
│  │ M. Garcia       │ C2P Home  │ ⏸️ Blocked │ 0% (await EFC)   ││
│  │ L. Chen         │ C2P Visit │ ⏸️ Blocked │ 0% (await EFC)   ││
│  │ R. Davis        │ WiFi      │ ⏸️ Blocked │ 0% (await EFC)   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔔 NEEDS ATTENTION                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ J. Martinez (IVRS B1) - Issue reported 10 min ago          ││
│  │ ISS-441: Hardware failure - needs support                   ││
│  │ [View Issue]  [Contact GDA]  [Request Support]              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  QUICK ACTIONS                                                  │
│  [📍 View Map]  [📞 Team Call]  [📋 All Tasks]  [🚨 Report]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Issue Triage

```
┌─────────────────────────────────────────────────────────────────┐
│  TRIAGE ISSUE - ISS-441                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Reported by: J. Martinez | 12 min ago                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REPORTED DETAILS                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ System: IVRS | Position: Home Booth                         ││
│  │ Reported Severity: 🟠 HIGH                                  ││
│  │ Category: Hardware Malfunction                              ││
│  │ Description: Tablet #3 will not power on. Tried power       ││
│  │ cycle, different cable, different outlet.                   ││
│  │ Evidence: [📷 View Photo]                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  IMPACT ASSESSMENT                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Blocked Tasks: 4 (25% of IVRS workload)                     ││
│  │ Other IVRS positions: Unaffected                            ││
│  │ Game Readiness Impact: -6% if unresolved                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  TRIAGE DECISION                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Confirm Severity: [🟠 HIGH ▼]                               ││
│  │ Assign To: [J. Martinez + On-site Support ▼]                ││
│  │ Resolution: [Deploy backup from equipment room ▼]           ││
│  │ Target Time: [45 minutes ▼]                                 ││
│  │                                                              ││
│  │ Notes: Dispatching venue support to retrieve backup tablet  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Save Triage]                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2.5 GDA Field Operator Experience

### Role Profile (All GDA Types)

| Attribute | Value |
|-----------|-------|
| **Primary Function** | Execute assigned tasks, capture evidence |
| **Scope** | Single system, single position |
| **Key Responsibility** | Task completion, evidence capture, issue reporting |
| **Decision Authority** | None (execute assigned work) |
| **Reports To** | Supervisor, NFL Lead |

### System-Specific Profiles

| System | Hat | Positions | Dependencies | Gate Role |
|--------|-----|-----------|--------------|-----------|
| **EFC** | 🟠 Orange | 1 | None | ✅ Gates C2P, WiFi |
| **IVRS** | 🔵 Blue | 4 | None | Gates C2P voice |
| **C2P** | 🟠 Orange | 2 | EFC, IVRS | No |
| **FTR** | ⚪ Gray | 2 | None | ✅ Gates SVS, Hawk_Eye |
| **SVS** | 🟣 Purple | 4 | FTR | No |
| **IR_Tech** | ⚪ Gray | 1 | None | ✅ Gates Hawk_Eye |
| **Hawk_Eye** | 🏷️ Vendor | 1 | FTR, IR_Tech | No |
| **O2O** | ⚪ Gray | 1 | None | No |
| **WiFi** | (varies) | 1 | EFC | No |

---

### GDA Task Screen - Standard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  GDA TASK LIST                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  J. Martinez | IVRS - Home Booth | 🔵 Blue Hat                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PROGRESS: 50% ████████████░░░░░░░░░░░░                         │
│                                                                  │
│  MY TASKS                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ 1. Arrival confirmation                        COMPLETE  ││
│  │      📷 Evidence captured | ⏱️ 8:02 AM                      ││
│  │                                                              ││
│  │ ✅ 2. Equipment inventory check                   COMPLETE  ││
│  │      📷 Evidence captured | ⏱️ 8:15 AM                      ││
│  │      Tablets: 3 | Chargers: 3 | Cables: 6                   ││
│  │                                                              ││
│  │ ✅ 3. Tablet power-on test                        COMPLETE  ││
│  │      📷 Evidence captured | ⏱️ 8:28 AM                      ││
│  │                                                              ││
│  │ ▶️ 4. Replay system integration test              IN PROGRESS││
│  │      [Continue Task]                                        ││
│  │                                                              ││
│  │ ⏸️ 5. Booth-field sync test                       PENDING   ││
│  │                                                              ││
│  │ ⏸️ 6. Final IVRS certification                    PENDING   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [📷 Capture Evidence]  [🚨 Report Issue]  [📞 Call Supervisor] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### GDA Task Screen - Blocked State

```
┌─────────────────────────────────────────────────────────────────┐
│  GDA TASK LIST                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  M. Garcia | C2P - Home Sideline | 🟠 Orange Hat                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⏸️ BLOCKED - Awaiting EFC Spectrum Clearance                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Your tasks require EFC to complete CBRS spectrum scan.      ││
│  │ EFC Tech: T. Wilson | Progress: 60%                         ││
│  │ Estimated unblock: ~25 minutes                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PROGRESS: 17% ████░░░░░░░░░░░░░░░░░░░░░                        │
│                                                                  │
│  MY TASKS                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ 1. Arrival confirmation                        COMPLETE  ││
│  │                                                              ││
│  │ 🔒 2. Radio inventory check                       BLOCKED   ││
│  │      Waiting for: EFC spectrum clearance                    ││
│  │                                                              ││
│  │ 🔒 3. Frequency programming                       BLOCKED   ││
│  │      Waiting for: EFC spectrum clearance                    ││
│  │                                                              ││
│  │ 🔒 4. Coach radio distribution                    BLOCKED   ││
│  │      Waiting for: EFC spectrum clearance                    ││
│  │                                                              ││
│  │ 🔒 5. IVRS voice integration test                 BLOCKED   ││
│  │      Waiting for: EFC + IVRS voice check                    ││
│  │                                                              ││
│  │ 🔒 6. Final C2P certification                     BLOCKED   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  WHILE WAITING:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☐ Verify radio equipment is accessible                      ││
│  │ ☐ Review frequency programming procedures                   ││
│  │ ☐ Confirm coach locations for distribution                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### GDA Unblock Notification

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 TASKS UNBLOCKED!                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  EFC spectrum clearance complete - You can now proceed!         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ UNBLOCKED BY: T. Wilson (EFC)                               │
│  ⏱️ Time: 9:45 AM                                               │
│                                                                  │
│  YOUR TASKS NOW AVAILABLE:                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ▶️ 2. Radio inventory check                       READY     ││
│  │ ▶️ 3. Frequency programming                       READY     ││
│  │ ▶️ 4. Coach radio distribution                    READY     ││
│  │ 🔒 5. IVRS voice integration test      Still waiting IVRS   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Start Tasks Now]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Gatekeeper View (EFC Example)

```
┌─────────────────────────────────────────────────────────────────┐
│  GDA TASK LIST - GATEKEEPER                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  T. Wilson | EFC | 🟠 Orange Hat | ⭐ GATEKEEPER                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ YOUR WORK UNBLOCKS OTHER TEAMS                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ WAITING FOR YOU:                                            ││
│  │ • C2P Team (2 GDAs, 12 tasks) - M. Garcia, L. Chen          ││
│  │ • WiFi Tech (1 GDA, 8 tasks) - R. Davis                     ││
│  │                                                              ││
│  │ Complete your CBRS scan as quickly as safely possible!      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PROGRESS: 60% ████████████████░░░░░░░░░░                       │
│                                                                  │
│  MY TASKS                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ 1. Arrival confirmation                        COMPLETE  ││
│  │ ✅ 2. Equipment check                             COMPLETE  ││
│  │ ▶️ 3. CBRS spectrum scan                      IN PROGRESS   ││
│  │      ⏱️ Estimated: 20 min remaining                         ││
│  │      [Continue Scan]                                        ││
│  │                                                              ││
│  │ ⏸️ 4. Frequency clearance certification    ⭐ GATE TASK     ││
│  │      This task unblocks C2P and WiFi                        ││
│  │                                                              ││
│  │ ⏸️ 5. Post-scan documentation                    PENDING    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Evidence Capture

```
┌─────────────────────────────────────────────────────────────────┐
│  CAPTURE EVIDENCE                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Task: Equipment inventory check                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUIRED EVIDENCE                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │ 📷 PHOTO (Required)                                         ││
│  │ ┌─────────────────────────────────────────────┐             ││
│  │ │                                             │             ││
│  │ │         [Tap to Take Photo]                 │             ││
│  │ │                                             │             ││
│  │ │   Show equipment with visible serial #s    │             ││
│  │ │                                             │             ││
│  │ └─────────────────────────────────────────────┘             ││
│  │                                                              ││
│  │ 📝 SERIAL NUMBERS (Required)                                ││
│  │ ┌─────────────────────────────────────────────┐             ││
│  │ │ Tablet 1: IVRS-2024-0440                    │             ││
│  │ │ Tablet 2: IVRS-2024-0441                    │             ││
│  │ │ Tablet 3: IVRS-2024-0442                    │             ││
│  │ └─────────────────────────────────────────────┘             ││
│  │                                                              ││
│  │ 📍 LOCATION: Auto-captured                                  ││
│  │    Ford Field - Section 112, Home Booth                     ││
│  │                                                              ││
│  │ ⏱️ TIMESTAMP: Auto-captured                                 ││
│  │    Dec 19, 2025 8:15:32 AM EST                              ││
│  │                                                              ││
│  │ 📋 NOTES (Optional)                                         ││
│  │ ┌─────────────────────────────────────────────┐             ││
│  │ │ All 3 tablets present and accounted for.    │             ││
│  │ │ Chargers verified. Ready for power-on test. │             ││
│  │ └─────────────────────────────────────────────┘             ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Cancel]  [Submit Evidence]                                    │
│                                                                  │
│  ⚠️ Evidence is immutable once submitted                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Issue Reporting

```
┌─────────────────────────────────────────────────────────────────┐
│  REPORT ISSUE                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  J. Martinez | IVRS - Home Booth                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AFFECTED TASK (Auto-linked)                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Task: Tablet power-on test | Status: IN PROGRESS            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ISSUE CATEGORY                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Equipment Failure        ● Hardware Malfunction           ││
│  │ ○ Software/Connectivity    ○ Missing Equipment              ││
│  │ ○ Personnel/Access         ○ Venue/Facility                 ││
│  │ ○ Other                                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SEVERITY                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ 🟢 LOW - I can work around this                           ││
│  │ ○ 🟡 MEDIUM - Slowing me down                               ││
│  │ ● 🟠 HIGH - I am blocked, cannot proceed                    ││
│  │ ○ 🔴 CRITICAL - Game may be at risk                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DESCRIPTION                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Tablet #3 (SN: IVRS-2024-0442) will not power on.          ││
│  │ Tried: power cycle, different cable, different outlet.      ││
│  │ No response. Screen completely dark.                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  TROUBLESHOOTING ATTEMPTED                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑️ Power cycled    ☑️ Different cable    ☑️ Different outlet││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  EVIDENCE: [📷 Add Photo]                                       │
│                                                                  │
│  [Cancel]  [🚨 Submit Issue]                                   │
│                                                                  │
│  Supervisor M. Thompson will be notified immediately            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

> 📋 **Cross-Reference:** See [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) for complete severity definitions, SLAs, and escalation rules.

---

# PART 3: POST-GAME EXPERIENCE

## 3.1 NFL Lead: GMS Report

```
┌─────────────────────────────────────────────────────────────────┐
│  GAME MANAGEMENT SYSTEM - POST-GAME REPORT                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  CHI @ DET | Ford Field | Final: CHI 24 - DET 17               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GAME SUMMARY                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Final Readiness: 100% (with 1 authorized skip)              ││
│  │ Issues Created: 4 | Resolved Pre-Kickoff: 4                 ││
│  │ In-Game Issues: 0                                           ││
│  │ GDA Performance: All satisfactory                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  EXCEPTIONS (VP Approved)                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • Task Skip: IVRS Booth 3 power-on test                    ││
│  │   Reason: Hardware failure (ISS-441)                        ││
│  │   Approved by: VP Smith                                     ││
│  │   Impact: 3/4 IVRS positions operational                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  EQUIPMENT STATUS                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑️ All equipment stored properly                           ││
│  │ ☑️ Damaged equipment flagged (1 IVRS tablet)               ││
│  │ ☑️ Serial numbers logged                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GDA PERFORMANCE                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ All 16 GDAs performed satisfactorily                        ││
│  │ No performance issues to flag                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  VENUE FEEDBACK                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Power outlet issue at Booth 3 - recommend pre-game check   ││
│  │ for all booth locations going forward.                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Save Draft]  [Submit Report]                                  │
│                                                                  │
│  ⏱️ Report due by: T+4h (5:00 PM)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 IT Executive: Weekly Exception Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  IT EXECUTIVE - WEEKLY EXCEPTION SUMMARY                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | 13 Games Complete                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WEEK SUMMARY                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Games at 100% by Kickoff:    13/13 (100%)                  ││
│  │ Total Issues:                42                             ││
│  │ Issues Resolved Pre-Kickoff: 40 (95%)                       ││
│  │ In-Game Issues:              2                              ││
│  │ VP Overrides Approved:       4                              ││
│  │ VP Overrides Denied:         1                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  EXCEPTIONS APPROVED                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Game        │ Type              │ Risk   │ VP          ││
│  │───│─────────────│───────────────────│────────│─────────────││
│  │ 1 │ CHI @ DET   │ Task Skip         │ Medium │ Smith       ││
│  │ 2 │ ATL DH      │ Same-Day Assign   │ Medium │ Smith       ││
│  │ 3 │ SF @ SEA    │ Playbook Override │ Low    │ Jones       ││
│  │ 4 │ MIA @ BUF   │ Task Skip         │ Low    │ Smith       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  EXCEPTION DENIED                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • MIA @ BUF - Certification Waiver (denied, found backup)  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  TRENDS                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • Hardware issues up 15% from last week                     ││
│  │ • IVRS tablets flagged for refresh at 3 venues              ││
│  │ • Average issue resolution time: 28 minutes                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Export Report]  [View All Games]  [View Trends]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 4: QUICK REFERENCE CARDS

## 4.1 GDA Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  GDA QUICK REFERENCE                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR ASSIGNMENT                                                │
│  • You are PRE-ASSIGNED to games (you don't choose)            │
│  • You SELECT your position on multi-position systems          │
│  • One game per day, one system per game                        │
│  • Your certification must match system requirements            │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  TASK STATES                                                    │
│  ⏸️ PENDING - Not yet available to start                       │
│  🔒 BLOCKED - Waiting on another system                        │
│  ▶️ IN PROGRESS - Currently working                            │
│  ✅ COMPLETE - Done with evidence                              │
│  ❌ FAILED - Issue reported                                    │
│  ⏭️ SKIPPED - VP authorized skip                               │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  EVIDENCE REQUIREMENTS                                          │
│  📷 Photo - Clear, shows serial numbers                        │
│  📝 Text - Exact values, no estimates                          │
│  ⏱️ Timestamp - Auto-captured, immutable                       │
│  📍 Location - Auto-captured for key tasks                     │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ISSUE SEVERITY                                                 │
│  🟢 LOW - Can work around                                      │
│  🟡 MEDIUM - Slowing down                                      │
│  🟠 HIGH - Blocked, can't proceed                              │
│  🔴 CRITICAL - Game at risk                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  NEED HELP?                                                     │
│  📞 Call Supervisor first                                       │
│  🚨 Report issues in app immediately                           │
│  💬 Message your team                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 NFL Lead Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  NFL LEAD QUICK REFERENCE                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR AUTHORITY                                                 │
│  ✅ Full playbook edit (until Hard Lock at T-1h)               │
│  ✅ Issue management and resolution                            │
│  ✅ GDA team coordination                                      │
│  ✅ Request VP override for hard lock changes                  │
│  ❌ Cannot override hard lock yourself                         │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  PLAYBOOK LOCK STATES                                          │
│  🟢 UNLOCKED (T-14d to T-4h): Edit freely, no approval        │
│  🟡 SOFT LOCK (T-4h to T-1h): Edit with reason, audited       │
│  🔴 HARD LOCK (T-1h to T+4h): VP override required            │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  MILESTONE TARGETS                                              │
│  M1 DISCOVER (T-5h): 25% minimum                               │
│  M2 DIAGNOSE (T-4h): 70% minimum ← Compliance starts          │
│  M3 DEPLOY (T-2h): 90% minimum ← Issues visible to Exec       │
│  M4 VALIDATE (T-1h): 100% required ← Hard lock               │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ISSUE ESCALATION                                               │
│  🟢🟡 LOW/MEDIUM: Manage with team                             │
│  🟠 HIGH: Visible to IT Exec at T-2h                           │
│  🔴 CRITICAL: Immediate all-level alert                        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  POST-GAME                                                      │
│  📋 GMS Report due by T+4h                                     │
│  📝 Document all exceptions                                    │
│  ⚠️ Flag equipment issues                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4.3 VP Operations Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  VP OPERATIONS QUICK REFERENCE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR AUTHORITY                                                 │
│  ✅ Approve/deny all override requests                         │
│  ✅ Same-day assignment exceptions                             │
│  ✅ Same-game multiple system exceptions                       │
│  ✅ Playbook hard lock overrides                               │
│  ✅ Task skip authorizations                                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  OVERRIDE REQUEST TYPES                                        │
│  • Assignment: GDA working 2+ games same day                   │
│  • Playbook: Changes after T-1h hard lock                      │
│  • Task Skip: Cannot complete, need authorized skip            │
│  • Certification: Waiver for unqualified GDA                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  DECISION FACTORS                                               │
│  📊 Risk level (Low/Medium/High/Critical)                      │
│  ⏱️ Time to kickoff                                            │
│  👥 Impact on game operations                                   │
│  📋 Justification from NFL Lead                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  REPORTING                                                      │
│  📋 All approvals logged for IT Exec exception report          │
│  📋 Denials logged with reason                                 │
│  📋 Weekly summary generated automatically                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4.4 IT Executive Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  IT EXECUTIVE QUICK REFERENCE                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR ROLE                                                      │
│  📊 Receive exception reports (not approval authority)         │
│  👁️ Monitor aggregate game readiness                          │
│  🔔 Review HIGH issues at T-2h visibility window               │
│  🚨 Emergency involvement (with VP) only                       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  VISIBILITY WINDOWS                                             │
│  T-4h: Compliance countdown begins                              │
│  T-2h: All HIGH+ issues visible                                 │
│  T-1h: Final gate (100% required)                               │
│  T+4h: Post-game reports due                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  EXCEPTION REPORTS INCLUDE                                      │
│  • VP-approved overrides (assignment, playbook, task skip)     │
│  • VP-denied requests                                          │
│  • HIGH/CRITICAL issues                                        │
│  • Games requiring attention                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  KEY METRICS                                                    │
│  • Games at 100% by kickoff (target: 100%)                     │
│  • Issues resolved pre-kickoff (target: >95%)                  │
│  • Weekly exceptions (track trend)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# APPENDIX: Cross-Reference Index

| Topic | Primary Document | Section |
|-------|------------------|---------|
| Assignment rules | [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Core Rules |
| One game per day | [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Constraint Rules |
| Override requests | [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Override Flow |
| Issue severity | [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Severity Levels |
| Issue triage | [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Triage Process |
| Issue escalation | [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Escalation Rules |
| Playbook lock states | [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Lock States |
| Playbook edit authority | [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Edit Authority |
| Playbook override | [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Override Flow |

---

**Document Version:** 8.3.2 (Consolidated)  
**Includes:** Assignment Logic, Issue Management, Playbook Lock  
**Cross-References:** 3 supporting logic documents
