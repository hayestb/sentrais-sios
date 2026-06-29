# NFLIT360 Build 8.3.1 - Assignment Logic Experience Guide
## One GDA → One Game → One Day - Complete Flow

---

## Core Assignment Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSIGNMENT CONSTRAINTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RULE 1: ONE GAME PER DAY                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ✅ GDA assigned to 1:00 PM game                                │
│  ❌ Cannot also work 4:25 PM game same day                      │
│  ❌ Cannot also work 8:20 PM game same day                      │
│                                                                  │
│  RULE 2: ONE SYSTEM PER GAME                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ✅ GDA assigned to IVRS for Week 16 game                       │
│  ❌ Cannot also claim C2P for same game (requires override)     │
│                                                                  │
│  RULE 3: ONE POSITION PER SYSTEM                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ✅ GDA assigned to IVRS Home Booth                             │
│  ❌ Cannot also claim IVRS Visitor Booth                        │
│                                                                  │
│  ═══════════════════════════════════════════════════════════════│
│                                                                  │
│  One GDA → One Position → One System → One Game → One Day       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Override Authority Matrix

| Scenario | System Behavior | Override Required | Override Authority |
|----------|-----------------|-------------------|-------------------|
| GDA claims 2nd game same day | ❌ BLOCKED | Yes | NFL Lead or Supervisor |
| GDA claims 2nd system same game | ❌ BLOCKED | Yes | NFL Lead or Supervisor |
| GDA claims 2nd position same system | ❌ BLOCKED | No (not allowed) | N/A |
| Position already taken | ❌ BLOCKED | No | Must choose different |
| Certification insufficient | ❌ BLOCKED | No | Must obtain certification |
| Game on different day | ✅ ALLOWED | No | Self-service |

---

## Position Counts by System

```
┌─────────────────────────────────────────────────────────────────┐
│                 POSITIONS PER STADIUM (16 Total)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MULTI-POSITION SYSTEMS:                                        │
│  ┌──────────┬───────────────────────────────────────────────┐  │
│  │  IVRS    │ Home Booth | Visitor Booth | Home Field |     │  │
│  │  (4)     │ Visitor Field                                 │  │
│  ├──────────┼───────────────────────────────────────────────┤  │
│  │  SVS     │ Home Sideline | Visitor Sideline |            │  │
│  │  (4)     │ Home Booth | Visitor Booth                    │  │
│  ├──────────┼───────────────────────────────────────────────┤  │
│  │  C2P     │ Home Sideline | Visitor Sideline              │  │
│  │  (2)     │                                               │  │
│  ├──────────┼───────────────────────────────────────────────┤  │
│  │  FTR     │ Primary Tech | Secondary Tech                 │  │
│  │  (2)     │                                               │  │
│  └──────────┴───────────────────────────────────────────────┘  │
│                                                                  │
│  SINGLE-POSITION SYSTEMS:                                       │
│  ┌──────────┬───────────────────────────────────────────────┐  │
│  │  EFC     │ Stadium-Wide (1)                              │  │
│  │  WiFi    │ Stadium-Wide (1)                              │  │
│  │  O2O     │ Stadium-Wide (1)                              │  │
│  │  IR_Tech │ Stadium-Wide (1)                              │  │
│  │  Hawk_Eye│ Stadium-Wide (1) - Vendor                     │  │
│  └──────────┴───────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Assignment State Machine

```
                           GDA Login
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Select Game      │
                    │   from Available    │
                    └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Already Assigned   │
                    │  to Game THIS DAY?  │
                    └─────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
      [ YES - Same Game ]              [ YES - Different Game ]
              │                                 │
              ▼                                 ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │   View Existing     │         │   ❌ BLOCKED        │
    │   Assignment        │         │   Already working   │
    │     (LOCKED)        │         │   another game      │
    │                     │         │   this day          │
    │ To add 2nd system:  │         │                     │
    │ Requires OVERRIDE   │         │ [Request Override]  │
    └─────────────────────┘         └─────────────────────┘
                                                │
              ┌─────────────────────────────────┘
              │
              ▼
    [ NO - Not Assigned Today ]
              │
              ▼
    ┌─────────────────────┐
    │   Select System     │
    │   from Available    │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Multi-Position     │
    │     System?         │
    └─────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
[ YES ]              [ NO ]
    │                   │
    ▼                   ▼
┌───────────────┐  ┌───────────────┐
│Select Position│  │Auto-Assign to │
│from Available │  │Single Position│
└───────────────┘  └───────────────┘
    │                   │
    ▼                   │
┌───────────────┐       │
│Position Free? │       │
└───────────────┘       │
    │                   │
┌───┴───┐               │
│       │               │
▼       ▼               │
[YES]  [NO]             │
│       │               │
▼       ▼               │
┌────────┐ ┌──────────┐ │
│LOCK IT │ │Show TAKEN│ │
│        │ │Try Again │ │
└────────┘ └──────────┘ │
    │                   │
    └─────────┬─────────┘
              │
              ▼
    ┌─────────────────────┐
    │    ASSIGNMENT       │
    │     COMPLETE        │
    │                     │
    │  GDA is now LOCKED  │
    │  to this game for   │
    │  this day           │
    └─────────────────────┘
```

---

## GDA Assignment Experience

### Step 1: Game Selection Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  GDA DIGITAL READINESS APP - SELECT GAME                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Welcome, J. Martinez                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR ASSIGNMENTS                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ✅ Jan 4 (Sunday) | Saints @ Falcons | 1:00 PM | ASSIGNED   ││
│  │    System: IVRS | Position: Visitor Booth                   ││
│  │    [View Assignment]                                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ✅ Jan 11 (Saturday) | Wild Card | 4:30 PM | ASSIGNED       ││
│  │    System: C2P | Position: Home Sideline                    ││
│  │    [View Assignment]                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  AVAILABLE GAMES                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔴 Jan 4 (Sunday) | Bears @ Lions | 4:25 PM | BLOCKED       ││
│  │    ⚠️ You are already assigned to a game on Jan 4          ││
│  │    [Request Override]                                       ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🟢 Jan 5 (Monday) | MNF Game | 8:15 PM | OPEN               ││
│  │    12 positions available                                   ││
│  │    [Select Game]                                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🟢 Jan 12 (Sunday) | Divisional | 3:00 PM | OPEN            ││
│  │    16 positions available                                   ││
│  │    [Select Game]                                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Blocked - Same Day Conflict

```
┌─────────────────────────────────────────────────────────────────┐
│  ❌ SAME-DAY CONFLICT                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  You can only work ONE game per day                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR CURRENT ASSIGNMENT FOR JAN 4:                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Game:      Saints @ Falcons                                ││
│  │  Time:      1:00 PM ET                                      ││
│  │  System:    IVRS                                            ││
│  │  Position:  Visitor Booth                                   ││
│  │  Status:    🔒 LOCKED                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REQUESTED GAME:                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Game:      Bears @ Lions                                   ││
│  │  Time:      4:25 PM ET                                      ││
│  │  Status:    ❌ BLOCKED (same day)                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GDAs are limited to ONE game per day to ensure:                │
│  • Full focus on assigned game                                  │
│  • Adequate rest between assignments                            │
│  • Travel time considerations                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Need to work both games? Request manager override.         ││
│  │                                                              ││
│  │  [Request Override]  [Choose Different Day]  [Cancel]       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Override Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUEST OVERRIDE - SAME DAY ASSIGNMENT                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Requires NFL Lead or Supervisor approval                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OVERRIDE REQUEST DETAILS                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Current Assignment:                                        ││
│  │  • Saints @ Falcons | 1:00 PM | IVRS Visitor Booth          ││
│  │                                                              ││
│  │  Requested Additional Assignment:                           ││
│  │  • Bears @ Lions | 4:25 PM | [Select System]                ││
│  │                                                              ││
│  │  Gap Between Games: 3h 25m                                  ││
│  │  Travel Distance: 15 miles (same market)                    ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REASON FOR OVERRIDE REQUEST                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Staffing shortage - no other qualified GDAs               ││
│  │ ○ Same venue - minimal travel                               ││
│  │ ● GDA volunteered for additional coverage                   ││
│  │ ○ Emergency replacement needed                              ││
│  │ ○ Other (specify below)                                     ││
│  │                                                              ││
│  │ Additional Notes:                                           ││
│  │ ┌───────────────────────────────────────────────────────┐   ││
│  │ │ Games are in same stadium complex. Happy to help.    │   ││
│  │ └───────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REQUEST WILL BE SENT TO:                                       │
│  • M. Thompson (Supervisor) - Primary                           │
│  • S. Johnson (NFL Lead) - Secondary                            │
│                                                                  │
│  [Cancel]  [Submit Override Request]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Manager Override Approval Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  SUPERVISOR/NFL LEAD - OVERRIDE REQUEST                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🔔 New Override Request                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUESTOR: J. Martinez                                         │
│  REQUEST TYPE: Same-Day Multiple Game Assignment                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  GAME 1 (Current)         │  GAME 2 (Requested)            ││
│  │  ─────────────────────────│──────────────────────────────  ││
│  │  Saints @ Falcons         │  Bears @ Lions                 ││
│  │  1:00 PM - ~4:00 PM       │  4:25 PM - ~7:30 PM            ││
│  │  Mercedes-Benz Stadium    │  Ford Field                    ││
│  │  IVRS - Visitor Booth     │  [Pending Selection]           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  RISK ASSESSMENT                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ⚠️ Travel Time: ~25 minutes between venues                ││
│  │  ⚠️ Gap: Only 25 minutes between Game 1 end & Game 2 start ││
│  │  ⚠️ Fatigue Risk: 6+ hours of continuous work              ││
│  │  ✅ Certification: Valid for both systems                  ││
│  │  ✅ No other conflicts identified                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GDA REASON: "Games are in same stadium complex. Happy to help."│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  DECISION                                                   ││
│  │  ○ Approve - GDA can work both games                       ││
│  │  ○ Deny - Too risky / Not recommended                      ││
│  │                                                              ││
│  │  Notes to GDA:                                              ││
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │                                                       │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Deny Request]  [Approve Override]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Same-Game Additional System Override

```
┌─────────────────────────────────────────────────────────────────┐
│  ❌ SAME-GAME MULTIPLE SYSTEM REQUEST                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  You are already assigned to a system for this game             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YOUR CURRENT ASSIGNMENT:                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Game:      Saints @ Falcons | Jan 4 | 1:00 PM              ││
│  │  System:    IVRS                                            ││
│  │  Position:  Visitor Booth                                   ││
│  │  Status:    🔒 LOCKED                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REQUESTED ADDITIONAL SYSTEM:                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  System:    C2P                                             ││
│  │  Position:  [Would need to select]                          ││
│  │  Status:    ❌ BLOCKED (same game)                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ⚠️ Standard operations require ONE system per GDA per game    │
│                                                                  │
│  Exceptions may be granted for:                                 │
│  • Critical staffing emergencies                                │
│  • Systems in same physical location                            │
│  • Non-overlapping task windows                                 │
│                                                                  │
│  [Request Override]  [Keep Current Assignment]  [Cancel]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Selection Screen (Multi-Position Example)

```
┌─────────────────────────────────────────────────────────────────┐
│  SELECT SYSTEM - Wild Card Game                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Jan 11 | 4:30 PM | TBD Venue                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AVAILABLE SYSTEMS                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ System   │ Positions │ Available │ Certification Required   ││
│  │──────────│───────────│───────────│──────────────────────────││
│  │ EFC      │    1      │  🟢 1     │ L3 ✅ You qualify        ││
│  │ IVRS     │    4      │  🟢 2     │ L2 ✅ You qualify        ││
│  │ C2P      │    2      │  🔴 0     │ L2 (FULL)                ││
│  │ SVS      │    4      │  🟢 3     │ L1 ✅ You qualify        ││
│  │ FTR      │    2      │  🟢 1     │ L2 ✅ You qualify        ││
│  │ IR_Tech  │    1      │  🔴 0     │ L2 (FULL)                ││
│  │ O2O      │    1      │  🟢 1     │ L1 ✅ You qualify        ││
│  │ WiFi     │    1      │  🟢 1     │ L2 ✅ You qualify        ││
│  │ Hawk_Eye │    1      │  🔴 0     │ Vendor (FULL)            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ⚠️ Once selected, you are LOCKED to this game for Jan 11      │
│                                                                  │
│  [Select IVRS] [Select SVS] [Select FTR] ...                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Position Selection Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  SELECT POSITION - IVRS                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Wild Card Game | IVRS System                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AVAILABLE POSITIONS                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  ┌─────────────────┐    ┌─────────────────┐                ││
│  │  │   Home Booth    │    │  Visitor Booth  │                ││
│  │  │                 │    │                 │                ││
│  │  │  🔴 TAKEN       │    │  🟢 AVAILABLE   │                ││
│  │  │  (M. Chen)      │    │                 │                ││
│  │  │                 │    │  [SELECT]       │                ││
│  │  └─────────────────┘    └─────────────────┘                ││
│  │                                                              ││
│  │  ┌─────────────────┐    ┌─────────────────┐                ││
│  │  │   Home Field    │    │  Visitor Field  │                ││
│  │  │                 │    │                 │                ││
│  │  │  🔴 TAKEN       │    │  🟢 AVAILABLE   │                ││
│  │  │  (S. Lee)       │    │                 │                ││
│  │  │                 │    │  [SELECT]       │                ││
│  │  └─────────────────┘    └─────────────────┘                ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Back to Systems]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Confirmation & Lock

```
┌─────────────────────────────────────────────────────────────────┐
│  CONFIRM ASSIGNMENT                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ⚠️ This action cannot be undone without manager approval       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  ASSIGNMENT DETAILS                                         ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │  Game:      Wild Card - TBD @ TBD                           ││
│  │  Date:      January 11, 2025 (Saturday)                     ││
│  │  Time:      4:30 PM ET                                      ││
│  │  Venue:     TBD (assigned when matchups set)                ││
│  │  System:    IVRS                                            ││
│  │  Position:  Visitor Booth                                   ││
│  │  Hat Color: 🔵 Blue                                         ││
│  │                                                              ││
│  │  YOUR CERTIFICATION: L2 ✅ Valid                            ││
│  │                                                              ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │  By confirming, you acknowledge:                            ││
│  │  • You will be LOCKED to this game for Jan 11               ││
│  │  • You cannot work other games on Jan 11                    ││
│  │  • You must arrive at T-5h before kickoff                   ││
│  │  • You must complete all assigned tasks                     ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌───────────────────┐    ┌───────────────────┐                │
│  │  [CANCEL]         │    │  [CONFIRM & LOCK] │                │
│  └───────────────────┘    └───────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## NFL Lead: Assignment Management View

```
┌─────────────────────────────────────────────────────────────────┐
│  NFL LEAD - ASSIGNMENT MANAGEMENT                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | Mercedes-Benz Stadium             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STAFFING OVERVIEW                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Positions: 14/16 Filled | 2 Open                            ││
│  │ ██████████████████████████████████████████░░░░ 87.5%        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔔 PENDING OVERRIDE REQUESTS (2)                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ J. Martinez - Same Day (2 games)         [Review]           ││
│  │ K. Brown - Same Game (2 systems)         [Review]           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SYSTEM BREAKDOWN                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ System   │ Filled │ Open │ Status                          ││
│  │──────────│────────│──────│─────────────────────────────────││
│  │ EFC      │  1/1   │  0   │ ✅ Complete                     ││
│  │ IVRS     │  4/4   │  0   │ ✅ Complete                     ││
│  │ C2P      │  2/2   │  0   │ ✅ Complete                     ││
│  │ SVS      │  4/4   │  0   │ ✅ Complete                     ││
│  │ FTR      │  2/2   │  0   │ ✅ Complete                     ││
│  │ IR_Tech  │  0/1   │  1   │ 🔴 Unstaffed                   ││
│  │ O2O      │  1/1   │  0   │ ✅ Complete                     ││
│  │ WiFi     │  0/1   │  1   │ 🔴 Unstaffed                   ││
│  │ Hawk_Eye │  Vendor│  -   │ ✅ Vendor confirmed            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACTIONS                                                        │
│  [Review Overrides] [Invite GDAs] [Reassign] [Send Reminder]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Assignment Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                   ASSIGNMENT LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  T-14 days    T-7 days    T-3 days    T-1 day    Game Day      │
│      │            │           │           │          │          │
│      │            │           │           │          │          │
│   ┌──┴──┐      ┌──┴──┐     ┌──┴──┐    ┌──┴──┐    ┌──┴──┐      │
│   │OPEN │ ───► │LOCK │ ───►│CONF │ ───►│READY│ ───►│ACTIV│      │
│   └─────┘      └─────┘     └─────┘    └─────┘    └─────┘      │
│                                                                  │
│   Positions    GDA         GDA        GDA        Tasks         │
│   available    claims      confirms   arrives    unlock        │
│   for claim    position    attendance at venue                 │
│                                                                  │
│   Day is       Day is                                          │
│   now BLOCKED  now BLOCKED                                     │
│   for GDA      for GDA                                         │
│                                                                  │
│                                          │                      │
│                                          ▼                      │
│                                    ┌───────────┐                │
│                                    │ COMPLETE  │                │
│                                    │ (T+4h)    │                │
│                                    └───────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Rules Summary

| Rule | Description | Override? | Authority |
|------|-------------|-----------|-----------|
| **One Game Per Day** | GDA cannot work multiple games same day | Yes | NFL Lead/Supervisor |
| **One System Per Game** | GDA cannot work multiple systems same game | Yes | NFL Lead/Supervisor |
| **One Position Per System** | GDA cannot claim multiple positions | No | N/A |
| **Position Lock** | Once claimed, position unavailable | N/A | System enforced |
| **Certification Match** | Must meet system certification level | No | Must obtain cert |
| **Vendor Exclusion** | Hawk-Eye not available to GDAs | No | Vendor-managed |

---

**Document Version:** 8.3.1  
**Assignment Logic Guide - Corrected**
