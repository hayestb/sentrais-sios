# EVERGAME 360 - Assignment Model Visual Guide
## One Assignment Per GDA Per Game - Visual Proof

---

## 🎯 **Assignment Model at a Glance**

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME: Week 16                            │
│                   Saints @ Falcons - Jan 4                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SYSTEM ASSIGNMENTS (16 Total Positions)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    IVRS      │  │     C2P      │  │     SVS      │         │
│  │  4 Positions │  │  2 Positions │  │  4 Positions │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ Home Booth   │  │ Home Side    │  │ Home Side    │         │
│  │ ✅ GDA1      │  │ ✅ GDA5      │  │ ✅ GDA9      │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ Visitor Booth│  │ Visitor Side │  │ Visitor Side │         │
│  │ ✅ GDA2      │  │ ✅ GDA6      │  │ ✅ GDA10     │         │
│  ├──────────────┤  └──────────────┘  ├──────────────┤         │
│  │ Home Field   │                     │ Home Booth   │         │
│  │ ✅ GDA3      │                     │ 🟢 Available │         │
│  ├──────────────┤                     ├──────────────┤         │
│  │ Visitor Field│                     │ Visitor Booth│         │
│  │ ✅ GDA4      │                     │ 🟢 Available │         │
│  └──────────────┘                     └──────────────┘         │
│                                                                  │
│  Single Position Systems:                                       │
│  FTR: ✅ GDA7  |  WiFi: ✅ GDA8  |  EFC: 🟢 Open              │
│  O2O: 🟢 Open  |  IR_TECH: 🟢 Open  |  HAWKEYE: 🟢 Open       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 **Assignment Rules Visualized**

### ✅ ALLOWED: Different Games, Different Assignments

```
         GDA1 Assignment Calendar
┌────────────┬────────────┬────────────┐
│  Week 16   │ Wild Card  │ Super Bowl │
├────────────┼────────────┼────────────┤
│   IVRS     │    C2P     │    SVS     │
│ Home Booth │ Home Side  │Visitor Booth│
│     ✅     │     ✅     │     ✅     │
└────────────┴────────────┴────────────┘
    Game 1       Game 2       Game 3
```

### ❌ BLOCKED: Same Game, Multiple Assignments

```
        GDA1 Attempts for Week 16
┌──────────────────────────────────────┐
│            WEEK 16 GAME              │
├──────────────────────────────────────┤
│ 1st Assignment: IVRS Home Booth  ✅  │
│ 2nd Attempt:    C2P Home Side    ❌  │
│                                       │
│ ERROR: "Already assigned to IVRS"    │
└──────────────────────────────────────┘
```

---

## 📊 **Assignment State Machine**

```
                 GDA Login
                     │
                     ▼
            ┌─────────────────┐
            │ Select Game     │
            └─────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Check if Already│
            │ Assigned to Game│
            └─────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    [YES]                      [NO]
        │                         │
        ▼                         ▼
┌──────────────┐         ┌──────────────┐
│View Existing │         │Select System │
│ Assignment   │         └──────────────┘
│   (LOCKED)   │                 │
└──────────────┘                 ▼
                         ┌──────────────┐
                         │Multi-Position│
                         │   System?    │
                         └──────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
                [YES]                      [NO]
                    │                         │
                    ▼                         ▼
           ┌──────────────┐         ┌──────────────┐
           │Select Position│        │Auto-Assign   │
           └──────────────┘         │Single Position│
                    │                └──────────────┘
                    ▼                         │
           ┌──────────────┐                  │
           │Position Free?│                  │
           └──────────────┘                  │
                    │                         │
        ┌───────────┴───────────┐            │
        │                       │            │
        ▼                       ▼            ▼
    [YES]                    [NO]           │
        │                       │            │
        ▼                       ▼            │
┌──────────────┐     ┌──────────────┐       │
│LOCK POSITION │     │Show TAKEN    │       │
│Create Assignment│  │Select Another│       │
└──────────────┘     └──────────────┘       │
        │                                    │
        └────────────────┬───────────────────┘
                         │
                         ▼
                ┌──────────────┐
                │  ASSIGNMENT  │
                │   COMPLETE   │
                │   (LOCKED)   │
                └──────────────┘
```

---

## 🎮 **Live Scenarios**

### Scenario A: Full IVRS Coverage
```
IVRS System - Week 16 Game
┌─────────────────┬──────────┬──────────┐
│    Position     │   GDA    │  Status  │
├─────────────────┼──────────┼──────────┤
│ Home Booth      │  GDA1    │ LOCKED   │
│ Visitor Booth   │  GDA2    │ LOCKED   │
│ Home Field      │  GDA3    │ LOCKED   │
│ Visitor Field   │  GDA4    │ LOCKED   │
└─────────────────┴──────────┴──────────┘

New GDA5 tries to select IVRS:
→ All positions show as TAKEN
→ Must select different system
```

### Scenario B: Partial SVS Coverage
```
SVS System - Week 16 Game
┌─────────────────┬──────────┬──────────┐
│    Position     │   GDA    │  Status  │
├─────────────────┼──────────┼──────────┤
│ Home Sideline   │  GDA9    │ LOCKED   │
│ Visitor Sideline│  GDA10   │ LOCKED   │
│ Home Booth      │    -     │ AVAILABLE│
│ Visitor Booth   │    -     │ AVAILABLE│
└─────────────────┴──────────┴──────────┘

New GDA11 selects SVS:
→ Sees 2 positions available
→ Can select Home or Visitor Booth
→ Once selected, LOCKED to that position
```

---

## 📱 **User Interface States**

### GDA Dashboard View
```
┌─────────────────────────────────────────┐
│         MY ASSIGNMENTS                  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Week 16 - Saints @ Falcons          │ │
│ │ System: IVRS                         │ │
│ │ Position: Home Booth                 │ │
│ │ Status: 🔒 LOCKED                    │ │
│ │ [View Tasks]                         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Wild Card Game 1                     │ │
│ │ System: C2P                          │ │
│ │ Position: Visitor Sideline           │ │
│ │ Status: 🔒 LOCKED                    │ │
│ │ [View Tasks]                         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Select Another Game for Assignment]     │
└─────────────────────────────────────────┘
```

---

## 🛡️ **Enforcement Points**

```
Assignment Creation Pipeline
════════════════════════════

1. UI Prevention
   └─> "Already assigned" badge
   └─> Disabled selection buttons
   └─> Warning messages

2. Frontend Validation
   └─> JavaScript checks
   └─> Form validation
   └─> Confirmation dialogs

3. Backend Validation
   └─> assignment_manager.can_assign()
   └─> Database constraints
   └─> Business logic rules

4. Database Enforcement
   └─> Unique constraints
   └─> Foreign key relationships
   └─> Transaction integrity

5. Audit Trail
   └─> Assignment timestamp
   └─> User tracking
   └─> Change history
```

---

## ✅ **Proof of Enforcement**

The model **GUARANTEES** one assignment per GDA per game through:

| Level | Enforcement | Method |
|-------|-------------|--------|
| **Database** | Unique constraint | (game_id, gda_id) must be unique |
| **Backend** | Python validation | `can_assign()` method checks |
| **Frontend** | UI blocking | Disabled buttons, warning messages |
| **Visual** | Status indicators | LOCKED, TAKEN, ASSIGNED badges |
| **Audit** | Tracking | Every assignment logged with timestamp |

---

## 🎉 **Conclusion**

The EVERGAME 360 POC model **absolutely enforces** the one-assignment-per-game rule through multiple layers of validation and clear visual feedback. GDAs can work multiple games with different assignments, but are strictly limited to one role per game.

**The model is ready for live testing with your target games!**
