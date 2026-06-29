# NFLIT360 Build 8.3.2 - Visual Journey Timeline (Consolidated)
## Complete Timeline Visualizations - All Phases, All Roles

---

## Document Overview

This is the **CORE TOOLKIT** document for NFLIT360 timeline visualizations. It provides ASCII diagrams showing the complete game day lifecycle from pre-game assignment through post-game reporting.

### Cross-Reference Documents
| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Detailed assignment rules | Assignment questions |
| [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Issue lifecycle details | Issue handling |
| [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Playbook edit authority | Playbook questions |

---

# SECTION 1: PRE-GAME TIMELINE (GD-14 to GD-1)

## 1.1 Assignment Lifecycle Timeline

```
═══════════════════════════════════════════════════════════════════════════════
                         PRE-GAME ASSIGNMENT LIFECYCLE
═══════════════════════════════════════════════════════════════════════════════

TIME      GD-14      GD-7       GD-3       GD-1       GD (T-6h)
            │          │          │          │            │
            │          │          │          │            │
   ─────────┴──────────┴──────────┴──────────┴────────────┴─────────────────────

OPERATIONS  │▓▓▓▓▓▓▓▓▓▓│          │          │            │
PLANNING    │ Schedule │          │          │            │
            │ Created  │          │          │            │
            │          │          │          │            │
            
GDA         │          │▓▓▓▓▓▓▓▓▓▓│          │            │
ASSIGNMENT  │          │ GDAs     │          │            │
NOTIFICATION│          │ Notified │          │            │
            │          │          │          │            │
            
POSITION    │          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│            │
SELECTION   │          │ Multi-position GDAs │            │
(Multi-Pos) │          │ select location     │            │
            │          │          │ Deadline │            │
            │          │          │          │            │
            
CONFIRMATION│          │          │          │▓▓▓▓▓▓▓▓▓▓▓▓│
            │          │          │          │ GD-1 Prep  │
            │          │          │          │ Notification│
            │          │          │          │            │
            
GAME OPENS  │          │          │          │            │▓▓▓▓▓▓▓
            │          │          │          │            │Tasks
            │          │          │          │            │Active

═══════════════════════════════════════════════════════════════════════════════

LEGEND:
▓▓▓ = Active phase
```

## 1.2 Position Selection Flow (Multi-Position Systems Only)

```
═══════════════════════════════════════════════════════════════════════════════
                    POSITION SELECTION - TEAM ASSIGNMENT MODEL
═══════════════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────┐
                    │      GDA PRE-ASSIGNED TO GAME       │
                    │      (by NFL Operations)            │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         SYSTEM ASSIGNMENT           │
                    │   (Based on certification + need)   │
                    └─────────────────┬───────────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
              ┌──────────────────┐      ┌──────────────────┐
              │  SINGLE-POSITION │      │  MULTI-POSITION  │
              │     SYSTEMS      │      │     SYSTEMS      │
              │                  │      │                  │
              │  EFC, WiFi, O2O  │      │  IVRS (4), SVS(4)│
              │  IR_Tech, Hawk   │      │  C2P (2), FTR(2) │
              └────────┬─────────┘      └────────┬─────────┘
                       │                         │
                       ▼                         ▼
              ┌──────────────────┐      ┌──────────────────┐
              │   AUTO-ASSIGNED  │      │  SELECT POSITION │
              │   TO POSITION    │      │  (GD-7 to GD-3)  │
              │                  │      │                  │
              │   No selection   │      │  Team picks      │
              │   required       │      │  work locations  │
              └────────┬─────────┘      └────────┬─────────┘
                       │                         │
                       └────────────┬────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────────┐
                    │         ASSIGNMENT LOCKED           │
                    │    GDA → Position → System → Game   │
                    └─────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
```

## 1.3 GD-1 Notification Timeline

```
═══════════════════════════════════════════════════════════════════════════════
                           GD-1 (DAY BEFORE GAME)
═══════════════════════════════════════════════════════════════════════════════

TIME      8:00 AM    12:00 PM   4:00 PM    8:00 PM    GAME DAY
            │          │          │          │            │
            │          │          │          │            │
   ─────────┴──────────┴──────────┴──────────┴────────────┴─────────────────────

GDA         │▓▓▓▓▓▓▓▓▓▓│          │          │            │
NOTIFICATION│ Detailed │          │          │            │
            │ Prep     │          │          │            │
            │ Packet   │          │          │            │
            
INCLUDES:   │          │          │          │            │
            │ • Assignment summary                        │
            │ • Arrival instructions                      │
            │ • Venue map / parking                       │
            │ • Task preview                              │
            │ • Team roster                               │
            │ • Weather forecast                          │
            │ • Supervisor contact                        │
            
CONFIRM     │          │          │▓▓▓▓▓▓▓▓▓▓│            │
ATTENDANCE  │          │          │ GDA      │            │
            │          │          │ confirms │            │
            │          │          │ ready    │            │

NFL LEAD    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│            │
PREP        │ Review roster, playbook, venue status      │

═══════════════════════════════════════════════════════════════════════════════
```

---

# SECTION 2: GAME DAY MASTER TIMELINE (T-6h to T+6h)

## 2.1 Complete Game Day Timeline - All Roles

```
═══════════════════════════════════════════════════════════════════════════════
                           MASTER GAME DAY TIMELINE
                    All Roles | T-6h to T+6h | Ford Field
═══════════════════════════════════════════════════════════════════════════════

TIME    T-6h   T-5h   T-4h   T-3h   T-2h   T-1h   T0    T+3h   T+4h   T+6h
          │      │      │      │      │      │      │      │      │      │
          │      │      │      │      │      │      │      │      │      │
  ────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴────

  MILESTONES:
          │      │ M1   │ M2   │      │ M3   │ M4   │      │      │      │
          │      │25%   │70%   │      │90%   │100%  │KICK  │      │      │
          │      │      │      │      │      │      │      │      │      │

═══════════════════════════════════════════════════════════════════════════════
IT EXEC   │      │      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │      │▓▓▓▓▓▓│
          │      │      │Compliance  │Issue │Final│      │      │Report│
          │      │      │Countdown   │View  │Gate │      │      │Review│
          │      │      │Begins      │T-2h  │     │      │      │      │

VP OPS    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │      │▓▓▓▓▓▓│
          │Override Queue - Available for Approvals│      │      │Log   │
          │                         │Soft │Hard │      │      │Review│
          │                         │Lock │Lock │      │      │      │

NFL LEAD  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
          │ Game │ M1   │ M2   │Cascade│Issue│Final│MONITOR │Prep │Submit│
          │ Open │Discov│Diagnose    │Track│Gate │        │Rpt  │GMS   │
          │      │🟢FREE│🟡SOFT│      │     │🔴LOCK│        │     │      │

SUPERVISOR│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░│      │
          │Arrivals│Support│Cascade│Triage│Final│Support│  │      │
          │        │Gates  │       │Issues│Push │       │  │      │

═══════════════════════════════════════════════════════════════════════════════
GDA SYSTEMS:
═══════════════════════════════════════════════════════════════════════════════

EFC       │      │▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░░░░░░░░░░░░│      │      │      │
⭐GATE    │      │CBRS Scan    │ Monitor / Support   │      │      │      │
🟠 Orange │      │➡️ Unblocks C2P, WiFi              │      │      │      │

FTR       │      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░░░░░│      │      │      │
⭐GATE    │      │Network Validation │Support       │      │      │      │
⚪ Gray   │      │➡️ Unblocks SVS, Hawk_Eye         │      │      │      │

IR_TECH   │      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░░░░░│      │      │      │
⭐GATE    │      │Calibration        │Support       │      │      │      │
⚪ Gray   │      │➡️ Unblocks Hawk_Eye              │      │      │      │

IVRS      │      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░│      │      │      │
🔵 Blue   │      │Booth Setup / Integration│Support │      │      │      │
          │      │➡️ Gates C2P voice check         │      │      │      │

O2O       │      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░│      │      │      │
⚪ Gray   │      │Official Radio Setup     │Support │      │      │      │
          │      │(Independent - no deps)          │      │      │      │

C2P       │      │░░░░░│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░│      │      │      │
🟠 Orange │      │BLOCK│Radio Prog / Distrib │Support │      │      │      │
          │      │(EFC)│                     │        │      │      │      │

WiFi      │      │░░░░░│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░│      │      │      │
          │      │BLOCK│Stadium WiFi Valid   │Support │      │      │      │
          │      │(EFC)│                     │        │      │      │      │

SVS       │      │░░░░░░░░░░░░░│▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░│      │      │      │
🟣 Purple │      │   BLOCKED   │Tablet Deploy│Support │      │      │      │
          │      │   (FTR)     │             │        │      │      │      │

HAWK_EYE  │▓▓▓▓▓▓│░░░░░░░░░░░░░│▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░│      │      │      │
🏷️ Vendor │Camera│   BLOCKED   │Integration  │Broadcast│      │      │      │
          │Setup │(FTR+IR_Tech)│             │Ready   │      │      │      │
          │Early │             │             │        │      │      │      │

═══════════════════════════════════════════════════════════════════════════════

LEGEND:
▓▓▓ = Primary work window       ░░░ = Blocked (waiting on dependency)
➡️ = Unblocks downstream        ⭐ = Gatekeeper role
🟢 = Unlocked   🟡 = Soft Lock   🔴 = Hard Lock

═══════════════════════════════════════════════════════════════════════════════
```

---

# SECTION 3: PLAYBOOK LOCK TIMELINE

## 3.1 Playbook Lock States

```
═══════════════════════════════════════════════════════════════════════════════
                           PLAYBOOK LOCK TIMELINE
                              NFL Lead Authority
═══════════════════════════════════════════════════════════════════════════════

TIME     GD-14        T-4h         T-1h          T0          T+4h
           │            │            │            │            │
           │            │            │            │            │
    ┌──────┴──────┐┌────┴────┐┌─────┴─────────────┴─────┐┌─────┴─────┐
    │             ││         ││                         ││           │
    │ 🟢 UNLOCKED ││ 🟡 SOFT ││      🔴 HARD LOCK       ││ ⚫ CLOSED │
    │             ││  LOCK   ││                         ││           │
    │             ││         ││                         ││           │
    └─────────────┘└─────────┘└─────────────────────────┘└───────────┘
           │            │            │            │            │
           │            │            │            │            │
           ▼            ▼            ▼            ▼            ▼

    ┌─────────────┐┌─────────┐┌─────────────────────────┐┌───────────┐
    │ NFL Lead    ││NFL Lead ││  VP Operations Only     ││ Read-Only │
    │ Free Edit   ││+ Warning││  Override Required      ││ Forever   │
    │             ││+ Reason ││                         ││           │
    │ No approval ││ Audited ││  Override Request OK    ││ No edits  │
    │ required    ││         ││                         ││           │
    └─────────────┘└─────────┘└─────────────────────────┘└───────────┘

═══════════════════════════════════════════════════════════════════════════════

EDIT AUTHORITY BY PHASE:

         │ 🟢 UNLOCKED  │ 🟡 SOFT LOCK │ 🔴 HARD LOCK │ ⚫ CLOSED │
─────────│──────────────│──────────────│──────────────│───────────│
Add Task │ ✅ NFL Lead  │ ⚠️ + Reason │ VP Override  │ ❌ None   │
Modify   │ ✅ NFL Lead  │ ⚠️ + Reason │ VP Override  │ ❌ None   │
Delete   │ ✅ NFL Lead  │ ⚠️ + Reason │ VP Override  │ ❌ None   │
Skip     │ ✅ NFL Lead  │ ⚠️ + Reason │ VP Override  │ ❌ None   │
View     │ ✅ All       │ ✅ All      │ ✅ All       │ ✅ All    │

═══════════════════════════════════════════════════════════════════════════════

> 📋 Cross-Reference: See [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md)
   for complete edit authority rules and audit requirements.

═══════════════════════════════════════════════════════════════════════════════
```

---

# SECTION 4: DEPENDENCY CASCADE TIMELINE

## 4.1 System Unblock Sequence

```
═══════════════════════════════════════════════════════════════════════════════
                         DEPENDENCY CASCADE TIMELINE
                           System Unblock Sequence
═══════════════════════════════════════════════════════════════════════════════

DEPENDENCY LEVELS:

LEVEL 0 (No Dependencies) ─────────────────────────────────────────────────────
│
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│   │   EFC   │  │   FTR   │  │ IR_TECH │  │  IVRS   │  │   O2O   │
│   │ ⭐GATE │  │ ⭐GATE │  │ ⭐GATE │  │         │  │         │
│   │ 🟠Orange│  │ ⚪Gray  │  │ ⚪Gray  │  │ 🔵Blue  │  │ ⚪Gray  │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └─────────┘
│        │            │            │            │
│        │            │            │            │
│        ▼            ▼            ▼            ▼
│   ┌─────────────────────────────────────────────────────────────┐
│   │               START IMMEDIATELY AT T-5h                     │
│   └─────────────────────────────────────────────────────────────┘

LEVEL 1 (1 Dependency) ────────────────────────────────────────────────────────
│
│   Blocked until EFC completes:       Blocked until FTR completes:
│   ┌─────────┐  ┌─────────┐           ┌─────────┐
│   │   C2P   │  │  WiFi   │           │   SVS   │
│   │ 🟠Orange│  │         │           │ 🟣Purple│
│   └────┬────┘  └────┬────┘           └────┬────┘
│        │            │                     │
│        ▼            ▼                     ▼
│   ┌───────────────────────┐         ┌───────────────┐
│   │ Unblocked when EFC    │         │ Unblocked when│
│   │ spectrum clearance    │         │ FTR network   │
│   │ certified             │         │ validated     │
│   └───────────────────────┘         └───────────────┘

LEVEL 2 (2 Dependencies) ──────────────────────────────────────────────────────
│
│   Blocked until FTR AND IR_Tech complete:
│   ┌─────────┐
│   │HAWK_EYE │
│   │ 🏷️Vendor│
│   └────┬────┘
│        │
│        ▼
│   ┌───────────────────────┐
│   │ Unblocked when BOTH   │
│   │ FTR network AND       │
│   │ IR_Tech calibration   │
│   │ complete              │
│   └───────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
```

## 4.2 Cascade Flow Visualization

```
═══════════════════════════════════════════════════════════════════════════════
                           CASCADE FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════════

T-5h                    T-4h                    T-3h                    T-2h
 │                       │                       │                       │
 │                       │                       │                       │
 ▼                       ▼                       ▼                       ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                              LEVEL 0 START                                  │
└─────────────────────────────────────────────────────────────────────────────┘
     │
     ├──► EFC starts CBRS scan
     │         │
     │         ▼ (completes ~T-4h)
     │    ┌─────────────────────────────────────────────────────────────────┐
     │    │  ✅ EFC SPECTRUM CLEARANCE CERTIFIED                           │
     │    │  ➡️ UNBLOCKS: C2P (2 GDAs), WiFi (1 GDA)                       │
     │    └─────────────────────────────────────────────────────────────────┘
     │              │
     │              ├──► C2P starts radio programming
     │              └──► WiFi starts stadium validation
     │
     ├──► FTR starts network validation
     │         │
     │         ▼ (completes ~T-3h)
     │    ┌─────────────────────────────────────────────────────────────────┐
     │    │  ✅ FTR NETWORK VALIDATED                                       │
     │    │  ➡️ UNBLOCKS: SVS (4 GDAs) - partial                           │
     │    │  ➡️ UNBLOCKS: Hawk_Eye (1 Vendor) - waiting IR_Tech too        │
     │    └─────────────────────────────────────────────────────────────────┘
     │              │
     │              └──► SVS starts tablet deployment
     │
     ├──► IR_Tech starts calibration
     │         │
     │         ▼ (completes ~T-3h)
     │    ┌─────────────────────────────────────────────────────────────────┐
     │    │  ✅ IR_TECH CALIBRATION COMPLETE                               │
     │    │  ➡️ COMBINED WITH FTR: Hawk_Eye fully unblocked                │
     │    └─────────────────────────────────────────────────────────────────┘
     │              │
     │              └──► Hawk_Eye starts integration tests
     │
     ├──► IVRS starts booth setup (independent)
     │
     └──► O2O starts official radio setup (independent)

═══════════════════════════════════════════════════════════════════════════════
```

---

# SECTION 5: ISSUE VISIBILITY TIMELINE

## 5.1 Issue Visibility by Severity

```
═══════════════════════════════════════════════════════════════════════════════
                        ISSUE VISIBILITY BY SEVERITY
                    Who Sees What and When
═══════════════════════════════════════════════════════════════════════════════

TIME      T-6h      T-5h      T-4h      T-3h      T-2h      T-1h      T0
            │         │         │         │         │         │         │
            │         │         │         │         │         │         │
   ─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────

🟢 LOW SEVERITY
────────────────────────────────────────────────────────────────────────────────
GDA        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
Supervisor │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
NFL Lead   │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Feed only
VP Ops     │                                                       │
IT Exec    │                                                       │

🟡 MEDIUM SEVERITY
────────────────────────────────────────────────────────────────────────────────
GDA        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
Supervisor │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
NFL Lead   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ Push notify
VP Ops     │                                                       │
IT Exec    │                                                       │

🟠 HIGH SEVERITY
────────────────────────────────────────────────────────────────────────────────
GDA        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
Supervisor │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
NFL Lead   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
VP Ops     │                         │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ T-2h window
IT Exec    │                         │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Report only
                                     ▲
                          T-2h VISIBILITY WINDOW OPENS

🔴 CRITICAL SEVERITY
────────────────────────────────────────────────────────────────────────────────
GDA        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
Supervisor │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
NFL Lead   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
VP Ops     │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ IMMEDIATE
IT Exec    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ IMMEDIATE

═══════════════════════════════════════════════════════════════════════════════

LEGEND:
▓▓▓ = Real-time visibility with push notifications
░░░ = Feed visibility (no push) or report only

> 📋 Cross-Reference: See [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md)
   for complete severity definitions and escalation rules.

═══════════════════════════════════════════════════════════════════════════════
```

## 5.2 Issue Escalation Flow

```
═══════════════════════════════════════════════════════════════════════════════
                          ISSUE ESCALATION FLOW
═══════════════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────┐
                    │         ISSUE CREATED           │
                    │         (by GDA)                │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   AUTO-NOTIFY: SUPERVISOR       │
                    │   (Immediate for all issues)    │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │ 🟢 LOW / 🟡 MED │             │ 🟠 HIGH / 🔴 CRIT│
          └────────┬────────┘             └────────┬────────┘
                   │                               │
                   ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │ NFL Lead: FEED  │             │ NFL Lead: PUSH  │
          │ (Awareness)     │             │ (Immediate)     │
          └────────┬────────┘             └────────┬────────┘
                   │                               │
                   │                    ┌──────────┴──────────┐
                   │                    │                     │
                   │                    ▼                     ▼
                   │          ┌─────────────────┐   ┌─────────────────┐
                   │          │   🟠 HIGH       │   │   🔴 CRITICAL   │
                   │          │   (at T-2h)     │   │   (Immediate)   │
                   │          └────────┬────────┘   └────────┬────────┘
                   │                   │                     │
                   │                   ▼                     ▼
                   │          ┌─────────────────┐   ┌─────────────────┐
                   │          │  VP: VISIBLE    │   │  VP: PUSH       │
                   │          │  IT Exec: REPORT│   │  IT Exec: PUSH  │
                   │          └─────────────────┘   └─────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Resolve at      │
          │ Supervisor/NFL  │
          │ Lead level      │
          └─────────────────┘

═══════════════════════════════════════════════════════════════════════════════

AUTO-ESCALATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• HIGH issue unresolved >30 min after T-2h → VP alert
• CRITICAL issue → Immediate VP + IT Exec
• Game <90% at T-3h → VP alert
• Game <100% at T-30m → Emergency protocol (VP + IT Exec)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════════════════════════════════════
```

---

# SECTION 6: OVERRIDE FLOW TIMELINES

## 6.1 VP Override Request Flow

```
═══════════════════════════════════════════════════════════════════════════════
                         VP OVERRIDE REQUEST FLOW
═══════════════════════════════════════════════════════════════════════════════

OVERRIDE TYPES:
┌─────────────────┬─────────────────────────────────────────────────────────┐
│ Same-Day Assign │ GDA working 2+ games on same day                        │
│ Same-Game Multi │ GDA working 2+ systems on same game                     │
│ Playbook Change │ Edit during Hard Lock (T-1h to T+4h)                    │
│ Task Skip       │ Authorize skip for uncompletable task                   │
│ Cert Waiver     │ Allow uncertified GDA (emergency only)                  │
└─────────────────┴─────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │    SITUATION REQUIRES           │
                    │    EXCEPTION                    │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │    NFL LEAD CREATES             │
                    │    OVERRIDE REQUEST             │
                    │                                 │
                    │    • Type of override           │
                    │    • Justification              │
                    │    • Risk assessment            │
                    │    • Supporting evidence        │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │    VP OPERATIONS RECEIVES       │
                    │    (Push notification)          │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌─────────────────┐             ┌─────────────────┐
          │    APPROVE      │             │     DENY        │
          │                 │             │                 │
          │  • Log decision │             │  • Log reason   │
          │  • Notify Lead  │             │  • Notify Lead  │
          │  • IT Exec rpt  │             │  • IT Exec rpt  │
          │  • Execute      │             │  • Alternative  │
          └─────────────────┘             └─────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │    IT EXECUTIVE RECEIVES        │
                    │    EXCEPTION REPORT             │
                    │    (Summary, not approval)      │
                    └─────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

> 📋 Cross-Reference: See [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md)
   for assignment override rules.
> 📋 Cross-Reference: See [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md)
   for playbook override rules.

═══════════════════════════════════════════════════════════════════════════════
```

---

# SECTION 7: QUICK REFERENCE TIMELINE CARDS

## 7.1 GDA Timeline Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GDA TIMELINE QUICK CARD                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRE-GAME:                                                                  │
│  ┌─────────┬─────────┬─────────┬─────────┬──────────┐                      │
│  │  GD-7   │  GD-3   │  GD-1   │  T-5h   │  GAME    │                      │
│  │ Assign  │Position │  Prep   │ Arrive  │  Active  │                      │
│  │ Notify  │Deadline │ Packet  │         │          │                      │
│  └─────────┴─────────┴─────────┴─────────┴──────────┘                      │
│                                                                             │
│  GAME DAY:                                                                  │
│  ┌─────────┬─────────┬─────────┬─────────┬──────────┐                      │
│  │  T-5h   │ Work or │Complete │  T-1h   │    T0    │                      │
│  │ Check-in│ Blocked │  Tasks  │All Done │ KICKOFF  │                      │
│  └─────────┴─────────┴─────────┴─────────┴──────────┘                      │
│                                                                             │
│  YOUR STATES:                                                               │
│  ⏸️ BLOCKED → Work prep tasks while waiting                                │
│  ▶️ ACTIVE → Complete tasks, capture evidence                              │
│  ✅ DONE → Stay available for support                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.2 NFL Lead Timeline Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NFL LEAD TIMELINE QUICK CARD                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PLAYBOOK AUTHORITY:                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ GD-14 ──────── T-4h ──────── T-1h ──────── T+4h                   │    │
│  │    🟢 FREE        🟡 SOFT       🔴 HARD       ⚫ CLOSED            │    │
│  │   (edit OK)    (+ reason)   (VP override)   (read only)           │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  MILESTONES:                                                                │
│  ┌─────────┬─────────┬─────────┬─────────┬──────────┐                      │
│  │  T-5h   │  T-4h   │  T-2h   │  T-1h   │    T0    │                      │
│  │  M1     │  M2     │  M3     │  M4     │ KICKOFF  │                      │
│  │  25%    │  70%    │  90%    │  100%   │  ✅      │                      │
│  └─────────┴─────────┴─────────┴─────────┴──────────┘                      │
│                                                                             │
│  ISSUE VISIBILITY:                                                          │
│  • All issues: You see immediately                                          │
│  • HIGH at T-2h: VP + IT Exec see                                          │
│  • CRITICAL: Everyone sees immediately                                      │
│                                                                             │
│  POST-GAME: GMS Report due T+4h                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.3 VP Operations Timeline Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VP OPERATIONS TIMELINE QUICK CARD                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OVERRIDE AUTHORITY (All Game Day):                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ T-6h ─────────────────────────────────────────────── T+4h         │    │
│  │         AVAILABLE FOR OVERRIDE APPROVALS                          │    │
│  │                                                                    │    │
│  │  • Assignment exceptions                                          │    │
│  │  • Playbook hard lock changes (after T-1h)                        │    │
│  │  • Task skip authorizations                                       │    │
│  │  • Certification waivers                                          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  CRITICAL WINDOWS:                                                          │
│  ┌─────────┬─────────┬─────────┬─────────┬──────────┐                      │
│  │  T-4h   │  T-2h   │  T-1h   │  T-30m  │    T0    │                      │
│  │ Soft    │HIGH vis │ Hard    │Emergency│ Kickoff  │                      │
│  │ Lock    │ window  │ Lock    │protocol │          │                      │
│  └─────────┴─────────┴─────────┴─────────┴──────────┘                      │
│                                                                             │
│  All decisions logged → IT Exec exception report                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.4 IT Executive Timeline Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       IT EXECUTIVE TIMELINE QUICK CARD                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  YOUR ROLE: Exception Reports (Not Approval Authority)                      │
│                                                                             │
│  VISIBILITY WINDOWS:                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ T-4h ──────── T-2h ──────── T-1h ──────── T0 ──────── T+4h        │    │
│  │   │           │             │            │            │           │    │
│  │   ▼           ▼             ▼            ▼            ▼           │    │
│  │ Compliance  HIGH Issues   Final Gate  Kickoff    Reports Due     │    │
│  │ Countdown   Visible       100% Req    Monitor    Review          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  EXCEPTION REPORT INCLUDES:                                                 │
│  • VP-approved overrides (assignment, playbook, task skip)                 │
│  • VP-denied requests with reasons                                         │
│  • HIGH/CRITICAL issues                                                    │
│  • Games with exceptions                                                   │
│                                                                             │
│  EMERGENCY ONLY: Game decision (with VP)                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# SECTION 8: NOTIFICATION MATRIX

## 8.1 Complete Notification Timeline

```
═══════════════════════════════════════════════════════════════════════════════
                         NOTIFICATION MATRIX
                    Who Gets Notified and When
═══════════════════════════════════════════════════════════════════════════════

EVENT                    │ IT EXEC  │ VP OPS   │ NFL LEAD │ SUPERVISOR│ GDA
─────────────────────────│──────────│──────────│──────────│───────────│────────
                         │          │          │          │           │
PRE-GAME                 │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
GDA assigned to game     │          │          │ ✅ Feed  │           │ ✅ Push
Position selected        │          │          │ ✅ Feed  │           │ ✅ Push
GD-1 prep notification   │          │          │ ✅ Push  │ ✅ Push   │ ✅ Push
Conflict reported        │          │          │ ✅ Push  │ ✅ Push   │
                         │          │          │          │           │
OVERRIDE REQUESTS        │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
Override requested       │ Report   │ ✅ Push  │ ✅ Confirm│           │
Override approved        │ Report   │ Log      │ ✅ Push  │ If assign │ If assign
Override denied          │ Report   │ Log      │ ✅ Push  │ If assign │ If assign
                         │          │          │          │           │
GAME DAY                 │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
Game window opens (T-6h) │          │          │ ✅ Push  │ ✅ Push   │ ✅ Push
Milestone threshold miss │ ✅ Push  │ ✅ Push  │ ✅ Push  │ ✅ Push   │
Soft lock begins (T-4h)  │          │          │ ✅ Push  │           │
Hard lock begins (T-1h)  │          │          │ ✅ Push  │           │
                         │          │          │          │           │
TASK STATUS              │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
Task blocked             │          │          │ ✅ Feed  │ ✅ Push   │ ✅ Push
Task unblocked           │          │          │ ✅ Feed  │ ✅ Push   │ ✅ Push
Task completed           │          │          │ ✅ Feed  │ ✅ Feed   │
Task failed              │          │          │ ✅ Push  │ ✅ Push   │
                         │          │          │          │           │
ISSUES                   │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
🟢 LOW created           │          │          │ ✅ Feed  │ ✅ Push   │
🟡 MEDIUM created        │          │          │ ✅ Push  │ ✅ Push   │
🟠 HIGH created          │ T-2h rpt │ T-2h vis │ ✅ Push  │ ✅ Push   │
🔴 CRITICAL created      │ ✅ Push  │ ✅ Push  │ ✅ Push  │ ✅ Push   │
Issue resolved           │          │          │ ✅ Feed  │ ✅ Push   │ ✅ Push
                         │          │          │          │           │
FINAL GATE               │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
100% readiness           │ ✅ Push  │ ✅ Push  │ ✅ Push  │ ✅ Push   │ ✅ Push
Game <100% at T-30m      │ ✅ Push  │ ✅ Push  │ ✅ Push  │ ✅ Push   │
Kickoff confirmed        │ ✅ Push  │          │ ✅ Push  │ ✅ Push   │
                         │          │          │          │           │
POST-GAME                │          │          │          │           │
─────────────────────────│──────────│──────────│──────────│───────────│────────
GMS report due reminder  │          │          │ ✅ Push  │           │
GMS report submitted     │ ✅ Feed  │ ✅ Feed  │ Confirm  │           │
Weekly exception summary │ ✅ Push  │ ✅ Feed  │          │           │

═══════════════════════════════════════════════════════════════════════════════

LEGEND:
✅ Push  = Push notification (immediate alert)
✅ Feed  = Feed update (visible when viewing)
Report   = Included in exception report
T-2h vis = Visible starting at T-2h window
T-2h rpt = Included in T-2h exception report

═══════════════════════════════════════════════════════════════════════════════
```

---

# APPENDIX: Cross-Reference Index

| Topic | Primary Document | Section |
|-------|------------------|---------|
| Assignment rules | [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Core Rules |
| Position selection | [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Team Assignment |
| Override authority | [Assignment Logic](./NFLIT360_Assignment_Logic_v8.3.1_CORRECTED.md) | Override Matrix |
| Issue severity | [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Severity Levels |
| Issue escalation | [Issue Management Logic](./NFLIT360_Issue_Management_Logic_v8.3.1.md) | Escalation Rules |
| Playbook lock states | [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Lock States |
| Playbook override | [Playbook Lock Logic](./NFLIT360_Playbook_Lock_Logic_v8.3.1.md) | Override Flow |

---

**Document Version:** 8.3.2 (Consolidated)  
**Includes:** Pre-game timeline, Playbook locks, Issue visibility, Override flows  
**Cross-References:** 3 supporting logic documents
