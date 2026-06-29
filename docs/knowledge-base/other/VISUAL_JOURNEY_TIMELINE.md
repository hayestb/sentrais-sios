# NFLIT360 Build 8.3.1 - Visual Journey Timeline
## Game Day Orchestration Flow by Role

---

## Master Timeline: T-6h to T+6h

```
═══════════════════════════════════════════════════════════════════════════════════
                              GAME DAY TIMELINE
═══════════════════════════════════════════════════════════════════════════════════

TIME    T-6h    T-5h    T-4h    T-3h    T-2h    T-1h    T0      T+3h    T+6h
        │       │       │       │       │       │       │       │       │
PHASE   │ OPEN  │  M1   │  M2   │  M3   │       │  M4   │  M5   │       │  M6
        │       │DISCOV │DIAGNO │DEPLOY │       │VALID  │OPERATE│       │DEBRIEF
        │       │  0%   │  70%  │  90%  │       │ 100%  │ 100%  │       │
        │       │       │       │       │       │       │       │       │
────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┴────────

IT EXECUTIVE
════════════
        │       │       │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │
        │       │       │ Compliance Countdown Active   │       │       │
        │       │       │               ┌───────┤       │       │       │
        │       │       │               │ T-2h  │       │       │       │
        │       │       │               │Issues │       │       │       │
        │       │       │               │Visible│       │       │       │
        │       │       │               └───────┤       │       │       │
        │       │       │                       │▓▓▓▓▓▓▓│       │       │
        │       │       │                       │ Final │       │       │
        │       │       │                       │ Gate  │       │       │
        │       │       │                       │       │▓▓▓▓▓▓▓│       │
        │       │       │                       │       │Monitor│       │
        │       │       │                       │       │       │▓▓▓▓▓▓▓│
        │       │       │                       │       │       │Reports│

NFL LEAD
════════
        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │
        │              Full Operational Control          │       │       │
┌───────┤                                               │       │       │
│ Game  │                                               │       │       │
│ Open  │                                               │       │       │
│ Prep  │                                               │       │       │
└───────┤                                               │       │       │
        │                                               │▓▓▓▓▓▓▓│       │
        │                                               │In-Game│       │
        │                                               │Monitor│       │
        │                                               │       │▓▓▓▓▓▓▓▓▓▓▓▓▓│
        │                                               │       │ Post-Game   │
        │                                               │       │ Reporting   │

GDA SUPERVISOR
══════════════
        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │
        │              Field Team Coordination           │       │       │
┌───────┤       ┌───────┐       ┌───────┐       ┌───────┤       │       │
│ Team  │       │Cascade│       │Issue  │       │ Final │       │       │
│Arrival│       │Unblock│       │ Triage│       │ Checks│       │       │
└───────┤       └───────┘       └───────┘       └───────┤       │       │
        │                                               │▓▓▓▓▓▓▓│       │
        │                                               │Support│       │

EFC COORDINATOR (GATEKEEPER)
════════════════════════════
        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │       │       │       │
        │    PRIMARY    │       │       │       │       │       │       │
        │    WINDOW     │       │       │       │       │       │       │
┌───────┼───────┐       │       │       │       │       │       │       │
│Arrive │ CBRS  │       │       │       │       │       │       │       │
│ Setup │ SCAN  │       │       │       │       │       │       │       │
└───────┼───────┘       │       │       │       │       │       │       │
        │       ▼       │       │       │       │       │       │       │
        │    UNBLOCK    │       │       │       │       │       │       │
        │    C2P/WiFi   │       │       │       │       │       │       │
        │               │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │
        │               │      MONITOR/SUPPORT  │       │       │       │

FTR TECH (GATEKEEPER)
═════════════════════
        │       │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │       │       │
        │       │    PRIMARY    │       │       │       │       │       │
        │       │    WINDOW     │       │       │       │       │       │
        │┌──────┼───────┐       │       │       │       │       │       │
        ││Arrive│Network│       │       │       │       │       │       │
        ││ Setup│ Valid │       │       │       │       │       │       │
        │└──────┼───────┘       │       │       │       │       │       │
        │       │       ▼       │       │       │       │       │       │
        │       │    UNBLOCK    │       │       │       │       │       │
        │       │    SVS/Hawk   │       │       │       │       │       │
        │       │               │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │
        │       │               │    SUPPORT    │       │       │       │

IVRS TECH
═════════
        │       │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │       │
        │       │       PRIMARY WINDOW  │       │       │       │       │
        │┌──────┼───────┬───────┬───────┤       │       │       │       │
        ││Arrive│ Booth │Tablets│ Test  │       │       │       │       │
        ││ Setup│ Setup │Deploy │ Replay│       │       │       │       │
        │└──────┼───────┴───────┴───────┤       │       │       │       │
        │       │                       │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │
        │       │                       │ SUPPORT/READY │       │       │

C2P TECH (BLOCKED UNTIL EFC)
════════════════════════════
        │░░░░░░░│       │       │       │       │       │       │       │
        │BLOCKED│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │       │
        │by EFC │      PRIMARY WINDOW   │       │       │       │       │
        │       │┌──────┬───────┬───────┤       │       │       │       │
        │       ││Radio │ Freq  │ Coach │       │       │       │       │
        │       ││ Inv  │ Prog  │ Dist  │       │       │       │       │
        │       │└──────┴───────┴───────┤       │       │       │       │
        │       │                       │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │
        │       │                       │ SUPPORT/READY │       │       │

SVS TECH (BLOCKED UNTIL FTR)
════════════════════════════
        │       │░░░░░░░│       │       │       │       │       │       │
        │       │BLOCKED│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │       │
        │       │by FTR │  PRIMARY WIN  │       │       │       │       │
        │       │       │┌──────┬───────┤       │       │       │       │
        │       │       ││Network│ Sync │       │       │       │       │
        │       │       ││ Test │ Booth │       │       │       │       │
        │       │       │└──────┴───────┤       │       │       │       │
        │       │       │               │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │
        │       │       │               │ SUPPORT/READY │       │       │

HAWK-EYE (BLOCKED UNTIL FTR + IR_Tech)
══════════════════════════════════════
│▓▓▓▓▓▓▓│       │       │       │       │       │       │       │       │
│ EARLY │░░░░░░░░░░░░░░░│       │       │       │       │       │       │
│ARRIVAL│    BLOCKED    │▓▓▓▓▓▓▓│       │       │       │       │       │
│ T-9h  │  by FTR+IR    │PRIMARY│       │       │       │       │       │
│       │               │ WIN   │       │       │       │       │       │
│Camera │               │┌──────┤       │       │       │       │       │
│ Setup │               ││Integ │       │       │       │       │       │
│       │               ││ Test │       │       │       │       │       │
│       │               │└──────┤       │       │       │       │       │
        │               │       │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│       │       │       │
        │               │       │ BROADCAST RDY │       │       │       │

═══════════════════════════════════════════════════════════════════════════════════
                                    LEGEND
═══════════════════════════════════════════════════════════════════════════════════

▓▓▓ = Active work window        ░░░ = Blocked (waiting on dependency)
───► = Unblocks downstream      │ = Timeline marker

MILESTONE THRESHOLDS:
M1 (T-5h): 0%    M2 (T-4h): 70%    M3 (T-3h): 90%    M4 (T-1h): 100%

HAT COLORS:
Orange = EFC/C2P    Blue = IVRS    Purple = SVS
Gray = FTR/IR/O2O   Vendor = Hawk-Eye

═══════════════════════════════════════════════════════════════════════════════════
```

---

## Dependency Cascade Flow

```
═══════════════════════════════════════════════════════════════════════════════════
                        DEPENDENCY CASCADE FLOW
═══════════════════════════════════════════════════════════════════════════════════

                                T-5h                T-4h                T-3h
                                  │                   │                   │
LEVEL 0 ─────────────────────────────────────────────────────────────────────────
(No Dependencies)                 │                   │                   │
                                  │                   │                   │
    ┌─────────┐                   │                   │                   │
    │   EFC   │──── CBRS Scan ───►│── COMPLETE ──────►│                   │
    │  Gate   │                   │      │            │                   │
    └─────────┘                   │      │            │                   │
                                  │      │            │                   │
    ┌─────────┐                   │      │            │                   │
    │   FTR   │──── Network ─────►│── Validate ─────►│── COMPLETE ──────►│
    │  Gate   │                   │                   │      │            │
    └─────────┘                   │                   │      │            │
                                  │                   │      │            │
    ┌─────────┐                   │                   │      │            │
    │ IR_Tech │──── Calibrate ───►│── COMPLETE ─────►│      │            │
    │  Gate   │                   │      │            │      │            │
    └─────────┘                   │      │            │      │            │
                                  │      │            │      │            │
    ┌─────────┐                   │      │            │      │            │
    │  IVRS   │──── Booth Setup ─►│── Tablets ──────►│── COMPLETE ──────►│
    └─────────┘                   │                   │      │            │
                                  │      │            │      │            │
    ┌─────────┐                   │      │            │      │            │
    │   O2O   │──── Equipment ───►│── Testing ──────►│── COMPLETE ──────►│
    └─────────┘                   │      │            │      │            │
                                  │      │            │      │            │
                                  │      ▼            │      ▼            │
LEVEL 1 ─────────────────────────────────────────────────────────────────────────
(1 Dependency)                    │                   │                   │
                                  │  ┌───UNBLOCK───┐  │                   │
    ┌─────────┐                   │  │             │  │                   │
    │   C2P   │◄─── EFC ──────────┼──┘             │  │                   │
    │         │──── Blocked ─────►│── Radio Prog ─►│── COMPLETE ────────►│
    └─────────┘                   │                │  │                   │
                                  │                │  │  ┌───UNBLOCK───┐  │
    ┌─────────┐                   │                │  │  │             │  │
    │  WiFi   │◄─── EFC ──────────┼────────────────┘  │  │             │  │
    │         │──── Blocked ─────►│── Connect ───────►│──┘ COMPLETE ──►│
    └─────────┘                   │                   │                   │
                                  │                   │  ┌───UNBLOCK───┐  │
    ┌─────────┐                   │                   │  │             │  │
    │   SVS   │◄─── FTR ──────────┼───────────────────┼──┘             │  │
    │         │──── Blocked ─────►│── Blocked ───────►│── Network ────►│
    └─────────┘                   │                   │                   │
                                  │                   │                   │
LEVEL 2 ─────────────────────────────────────────────────────────────────────────
(2 Dependencies)                  │                   │                   │
                                  │                   │  ┌───UNBLOCK───┐  │
    ┌─────────┐                   │                   │  │ (Both deps) │  │
    │Hawk_Eye │◄─── FTR + IR ─────┼───────────────────┼──┘             │  │
    │         │──── Blocked ─────►│── Blocked ───────►│── Integrate ──►│
    └─────────┘                   │                   │                   │

═══════════════════════════════════════════════════════════════════════════════════
```

---

## Escalation Flow

```
═══════════════════════════════════════════════════════════════════════════════════
                           ESCALATION FLOW
═══════════════════════════════════════════════════════════════════════════════════

ISSUE SEVERITY:  LOW    MEDIUM    HIGH    CRITICAL


                    GDA                SUPERVISOR           NFL LEAD            IT EXEC
                     │                     │                   │                   │
                     │                     │                   │                   │
    LOW ─────────────┼─────────────────────┼──── Logged ───────┼───────────────────│
         Issue       │                     │     (Feed)        │                   │
                     │                     │                   │                   │
                     │                     │                   │                   │
    MEDIUM ──────────┼─────── Notify ──────┼──── Logged ───────┼───────────────────│
         Issue       │        (Push)       │     (Push)        │                   │
                     │                     │                   │                   │
                     │                     │                   │                   │
    HIGH ────────────┼─────── Notify ──────┼──── Notify ───────┼─── At T-2h ───────┤
         Issue       │        (Push)       │     (Push)        │    (Push)         │
                     │                     │                   │                   │
                     │                     │                   │                   │
    CRITICAL ────────┼─────── Notify ──────┼──── Notify ───────┼──── IMMEDIATE ────┤
         Issue       │        (Push)       │     (Push)        │     (Push)        │
                     │                     │                   │                   │

═══════════════════════════════════════════════════════════════════════════════════

                           TIME-BASED ESCALATION
═══════════════════════════════════════════════════════════════════════════════════

    T-6h            T-4h            T-2h            T-1h            T0
      │               │               │               │               │
      │               │               │               │               │
GDA   │  Report       │    Update     │    Assist     │    Final      │
Level │  Issues       │    Status     │    Resolve    │    Push       │
      │               │               │               │               │
      │               │               │               │               │
Super │  Triage       │   Coordinate  │   Escalate    │   Emergency   │
visor │  Issues       │   Resources   │   if needed   │   Support     │
      │               │               │               │               │
      │               │               │               │               │
NFL   │               │   Monitor     │ ALL ISSUES    │   Override    │
Lead  │               │   Resolve     │ VISIBLE HERE  │   Authority   │
      │               │               │               │               │
      │               │               │               │               │
IT    │               │   League      │   Game        │   Final       │
Exec  │               │   Overview    │   Focus       │   Gate        │
      │               │               │               │               │

═══════════════════════════════════════════════════════════════════════════════════
```

---

## Quick Reference Cards

### IT Executive Quick Card
```
┌─────────────────────────────────────────┐
│  IT EXECUTIVE - QUICK REFERENCE         │
├─────────────────────────────────────────┤
│                                         │
│  WHEN TO ACT:                           │
│  • T-4h: Compliance countdown starts    │
│  • T-2h: Review all open issues         │
│  • T-1h: Final gate approval            │
│  • CRITICAL: Any time                   │
│                                         │
│  KEY METRICS:                           │
│  • All games ≥70% at T-4h              │
│  • All games ≥90% at T-3h              │
│  • All games =100% at T-1h             │
│                                         │
│  ACTIONS AVAILABLE:                     │
│  • Approve overrides                    │
│  • Escalation calls                     │
│  • Emergency decisions                  │
│                                         │
└─────────────────────────────────────────┘
```

### NFL Lead Quick Card
```
┌─────────────────────────────────────────┐
│  NFL LEAD - QUICK REFERENCE             │
├─────────────────────────────────────────┤
│                                         │
│  YOUR AUTHORITY:                        │
│  • Edit playbooks (no CTO approval)     │
│  • Resolve issues                       │
│  • Manage GDA assignments               │
│  • Request overrides                    │
│                                         │
│  MILESTONE TARGETS:                     │
│  • M1 (T-5h): 0% minimum               │
│  • M2 (T-4h): 70% minimum              │
│  • M3 (T-3h): 90% minimum              │
│  • M4 (T-1h): 100% required            │
│                                         │
│  POST-GAME:                             │
│  • GMS report due T+4h                  │
│                                         │
└─────────────────────────────────────────┘
```

### GDA Quick Card
```
┌─────────────────────────────────────────┐
│  GDA OPERATOR - QUICK REFERENCE         │
├─────────────────────────────────────────┤
│                                         │
│  TASK STATES:                           │
│  ○ Open - Ready to start                │
│  ◐ In Progress - Working                │
│  ◌ Blocked - Waiting on dependency      │
│  ● Complete - Done with evidence        │
│  ✗ Failed - Issue reported              │
│  ⊘ Skipped - Authorized bypass          │
│                                         │
│  EVIDENCE REQUIRED:                     │
│  • Photo/screenshot                     │
│  • Timestamp (auto)                     │
│  • Notes (if needed)                    │
│                                         │
│  NEED HELP?                             │
│  • Call Supervisor                      │
│  • Report Issue (in app)                │
│                                         │
└─────────────────────────────────────────┘
```

### Gatekeeper Quick Card (EFC/FTR/IR_Tech)
```
┌─────────────────────────────────────────┐
│  GATEKEEPER - QUICK REFERENCE           │
├─────────────────────────────────────────┤
│                                         │
│  YOU CONTROL DOWNSTREAM SYSTEMS         │
│                                         │
│  EFC GATES:                             │
│  └─► C2P (after spectrum clearance)     │
│  └─► WiFi (after spectrum clearance)    │
│                                         │
│  FTR GATES:                             │
│  └─► SVS (after network validation)     │
│  └─► Hawk_Eye (after endpoints ready)   │
│                                         │
│  IR_Tech GATES:                         │
│  └─► Hawk_Eye (after calibration)       │
│                                         │
│  PRIORITY: Complete gate tasks ASAP     │
│  Others are waiting on you!             │
│                                         │
└─────────────────────────────────────────┘
```

---

**Document Version:** 8.3.1
**Visual Timeline Guide**
**Last Updated:** December 19, 2025
