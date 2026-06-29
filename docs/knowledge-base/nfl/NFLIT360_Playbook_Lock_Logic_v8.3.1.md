# NFLIT360 Build 8.3.1 - Playbook Update & Lock Logic
## Playbook Lifecycle, Edit Authority, and Lock Framework

---

## Playbook Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYBOOK STRUCTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PLAYBOOK = Collection of TASKS for a SYSTEM at a VENUE        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  EVERGAME 360 MASTER PLAYBOOK                               ││
│  │  (Global template - All venues, all systems)                ││
│  │                                                              ││
│  │  └── VENUE PLAYBOOK                                         ││
│  │      (Venue-specific customizations)                        ││
│  │                                                              ││
│  │      └── SYSTEM PLAYBOOK                                    ││
│  │          (System-specific tasks at venue)                   ││
│  │                                                              ││
│  │          └── GAME INSTANCE                                  ││
│  │              (Specific game execution)                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Each level inherits from above and can ADD or MODIFY tasks    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Playbook Edit Authority Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT AUTHORITY MATRIX                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PLAYBOOK LEVEL        │ WHO CAN EDIT         │ APPROVAL       │
│  ══════════════════════│══════════════════════│════════════════│
│                        │                      │                │
│  MASTER PLAYBOOK       │ IT Executive         │ CTO Sign-off   │
│  (Global templates)    │ System Architects    │ Required       │
│                        │                      │                │
│  ──────────────────────│──────────────────────│────────────────│
│                        │                      │                │
│  VENUE PLAYBOOK        │ IT Executive         │ IT Exec        │
│  (Venue customizations)│ NFL Lead             │ Approval       │
│                        │                      │                │
│  ──────────────────────│──────────────────────│────────────────│
│                        │                      │                │
│  GAME INSTANCE         │ NFL Lead             │ NO APPROVAL    │
│  (Game-specific edits) │ (assigned to game)   │ REQUIRED       │
│                        │                      │                │
│  ══════════════════════│══════════════════════│════════════════│
│                                                                  │
│  ⚠️ NFL Lead can edit their assigned game's playbook            │
│     WITHOUT requiring IT Executive or CTO approval              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Playbook Lock States

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYBOOK LOCK STATES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🟢 UNLOCKED                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  When:     T-14 days to T-4h                                    │
│  Who:      NFL Lead (assigned) can freely edit                  │
│  Actions:  Add tasks, modify tasks, delete tasks, reorder       │
│                                                                  │
│  🟡 SOFT LOCK                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  When:     T-4h to T-1h (Compliance Countdown)                  │
│  Who:      NFL Lead can still edit with WARNING                 │
│  Actions:  All edits logged, confirmation required              │
│  Warning:  "Changes during compliance window are audited"       │
│                                                                  │
│  🔴 HARD LOCK                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  When:     T-1h to T+4h (Final Gate through Game)               │
│  Who:      ONLY IT Executive can unlock                         │
│  Actions:  No edits without executive override                  │
│  Override: Requires documented reason + IT Exec approval        │
│                                                                  │
│  ⚫ CLOSED                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  When:     After T+4h (Post-game report submitted)              │
│  Who:      NO ONE can edit                                      │
│  Actions:  Read-only historical record                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Lock Timeline Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYBOOK LOCK TIMELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  T-14d         T-4h         T-1h          T0          T+4h     │
│    │             │            │            │            │       │
│    │  🟢 UNLOCKED │  🟡 SOFT   │  🔴 HARD   │            │       │
│    │             │   LOCK     │   LOCK     │            │       │
│    │             │            │            │            │       │
│    │◄───────────►│◄──────────►│◄───────────────────────►│       │
│    │   NFL Lead  │  NFL Lead  │  IT Exec Override Only  │       │
│    │  Free Edit  │ + Warning  │  Required for Changes   │       │
│    │             │            │            │            │       │
│    │             │ Compliance │   Final    │   Game    │       │
│    │   Planning  │ Countdown  │   Gate     │  Active   │       │
│    │    Phase    │   Phase    │            │           │       │
│    │             │            │            │            │       │
│    │             │            │            │         ⚫ CLOSED  │
│    │             │            │            │            │       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## NFL Lead Playbook Edit Experience

### Unlocked State (T-14d to T-4h)

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK EDITOR                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | Mercedes-Benz Stadium             │
│  Status: 🟢 UNLOCKED | You can freely edit this playbook       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SYSTEM: IVRS (4 Positions)                                     │
│                                                                  │
│  TASKS                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Task Name                    │ Position │ Phase │ Edit ││
│  │───│──────────────────────────────│──────────│───────│──────││
│  │ 1 │ Arrival confirmation         │ All      │ M1    │ [✏️] ││
│  │ 2 │ Equipment inventory check    │ All      │ M1    │ [✏️] ││
│  │ 3 │ Tablet power-on test         │ All      │ M1    │ [✏️] ││
│  │ 4 │ Network connectivity test    │ All      │ M2    │ [✏️] ││
│  │ 5 │ Replay system integration    │ All      │ M2    │ [✏️] ││
│  │ 6 │ Booth-field sync test        │ Booth    │ M3    │ [✏️] ││
│  │ 7 │ Final certification          │ All      │ M4    │ [✏️] ││
│  │   │                              │          │       │      ││
│  │   │ [+ Add Task]                 │          │       │      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACTIONS                                                        │
│  [Add Task] [Reorder] [Import from Template] [Preview] [Save]  │
│                                                                  │
│  CHANGES PENDING: 0                                             │
│  Last Saved: Never (imported from venue template)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Add Task Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ADD TASK TO PLAYBOOK                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  IVRS Playbook | Week 16                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TASK DETAILS                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │ Task Name:                                                  ││
│  │ ┌───────────────────────────────────────────────────────┐   ││
│  │ │ Pre-game tablet battery check                         │   ││
│  │ └───────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │ Description:                                                ││
│  │ ┌───────────────────────────────────────────────────────┐   ││
│  │ │ Verify all tablets have >80% battery before           │   ││
│  │ │ distributing to booths/field positions.               │   ││
│  │ └───────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │ Apply To:                                                   ││
│  │ ☑️ Home Booth    ☑️ Visitor Booth                          ││
│  │ ☑️ Home Field    ☑️ Visitor Field                          ││
│  │                                                              ││
│  │ Milestone:                                                  ││
│  │ [M1 - DISCOVER ▼]                                           ││
│  │                                                              ││
│  │ Insert After Task:                                          ││
│  │ [2. Equipment inventory check ▼]                            ││
│  │                                                              ││
│  │ Evidence Required:                                          ││
│  │ ☑️ Photo        ☐ Text Entry        ☐ Signature            ││
│  │                                                              ││
│  │ Is Gate Task:                                               ││
│  │ ○ No            ○ Yes (blocks downstream systems)          ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Cancel]  [Add Task]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Soft Lock State (T-4h to T-1h)

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK EDITOR                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | Mercedes-Benz Stadium             │
│  Status: 🟡 SOFT LOCK | Edits allowed with confirmation        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ COMPLIANCE WINDOW ACTIVE                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ You are editing during the compliance countdown (T-4h).     ││
│  │ All changes are audited and require confirmation.           ││
│  │ IT Executive will see all modifications in their dashboard. ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SYSTEM: IVRS (4 Positions)                                     │
│                                                                  │
│  TASKS                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Task Name                    │ Position │ Phase │ Edit ││
│  │───│──────────────────────────────│──────────│───────│──────││
│  │ 1 │ Arrival confirmation         │ All      │ M1    │ [✏️] ││
│  │ 2 │ Equipment inventory check    │ All      │ M1    │ [✏️] ││
│  │ 3 │ ⚡ Battery check (NEW)       │ All      │ M1    │ [✏️] ││
│  │ 4 │ Tablet power-on test         │ All      │ M1    │ [✏️] ││
│  │...│ ...                          │ ...      │ ...   │ ...  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACTIONS                                                        │
│  [Add Task ⚠️] [Reorder ⚠️] [Save with Reason]                 │
│                                                                  │
│  CHANGES PENDING: 1 (Added battery check task)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Soft Lock Save Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│  CONFIRM PLAYBOOK CHANGES                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ⚠️ You are saving changes during the compliance window        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CHANGES TO BE SAVED                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ + ADDED: "Pre-game tablet battery check" (Task #3)          ││
│  │   Position: All | Milestone: M1 | Evidence: Photo           ││
│  │                                                              ││
│  │ ~ REORDERED: Tasks 4-8 shifted by +1                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REASON FOR CHANGE (Required)                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Adding battery check based on last week's issue where       ││
│  │ tablets ran out of power mid-game. Proactive measure.       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ACKNOWLEDGMENT                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ☑️ I understand this change is being made during the       ││
│  │    compliance window and will be audited                    ││
│  │ ☑️ I have verified this change will not negatively impact  ││
│  │    game readiness                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Cancel]  [Confirm & Save Changes]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Hard Lock State (T-1h to T+4h)

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK VIEWER                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | Mercedes-Benz Stadium             │
│  Status: 🔴 HARD LOCK | Read-only until game completion        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔒 PLAYBOOK LOCKED                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ This playbook is locked for the final gate and game.        ││
│  │ No changes can be made without IT Executive override.       ││
│  │                                                              ││
│  │ Lock Reason: Final Gate (T-1h)                              ││
│  │ Locked At: 12:00 PM ET                                      ││
│  │ Unlock After: T+4h (Post-game report)                       ││
│  │                                                              ││
│  │ [Request Emergency Override]                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SYSTEM: IVRS (4 Positions)                                     │
│                                                                  │
│  TASKS (Read Only)                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Task Name                    │ Position │ Phase │Status││
│  │───│──────────────────────────────│──────────│───────│──────││
│  │ 1 │ Arrival confirmation         │ All      │ M1    │ ✅   ││
│  │ 2 │ Equipment inventory check    │ All      │ M1    │ ✅   ││
│  │ 3 │ Battery check                │ All      │ M1    │ ✅   ││
│  │ 4 │ Tablet power-on test         │ All      │ M1    │ 🔄   ││
│  │...│ ...                          │ ...      │ ...   │ ...  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [View Only - No Edit Actions Available]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Emergency Override Request

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUEST EMERGENCY PLAYBOOK OVERRIDE                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🔴 This requires IT Executive approval                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CURRENT LOCK STATUS                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Game: Week 16 | Saints @ Falcons                            ││
│  │ Status: 🔴 HARD LOCK                                        ││
│  │ Time to Kickoff: 45 minutes                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REQUESTED CHANGE                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Change Type:                                                ││
│  │ ○ Add Task                                                  ││
│  │ ○ Modify Task                                               ││
│  │ ● Skip Task (mark as not required)                          ││
│  │ ○ Delete Task                                               ││
│  │                                                              ││
│  │ Affected Task:                                              ││
│  │ [#4 - Tablet power-on test (IVRS Booth 3) ▼]                ││
│  │                                                              ││
│  │ Reason:                                                     ││
│  │ ┌───────────────────────────────────────────────────────┐   ││
│  │ │ Hardware failure at Booth 3 cannot be resolved before │   ││
│  │ │ kickoff. Backup equipment deployed but this specific  │   ││
│  │ │ test cannot be completed. Other 3 booths fully        │   ││
│  │ │ operational. Game can proceed safely.                 │   ││
│  │ └───────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │ Risk Assessment:                                            ││
│  │ ○ 🟢 LOW - No impact to game operations                    ││
│  │ ● 🟡 MEDIUM - Reduced redundancy                           ││
│  │ ○ 🟠 HIGH - Potential game impact                          ││
│  │ ○ 🔴 CRITICAL - Would not recommend                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Cancel]  [Submit Override Request]                            │
│                                                                  │
│  ⚠️ IT Executive will be notified immediately                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## IT Executive Override Approval

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK OVERRIDE REQUEST                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🔔 Urgent - Requires your decision                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REQUEST DETAILS                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Game:         Week 16 | Saints @ Falcons                   ││
│  │ Venue:        Mercedes-Benz Stadium                         ││
│  │ NFL Lead:     S. Johnson                                    ││
│  │ Time to Kick: 45 minutes                                    ││
│  │ Requested:    2 minutes ago                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  REQUESTED CHANGE                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Action: SKIP TASK                                           ││
│  │ Task:   #4 - Tablet power-on test (IVRS Booth 3)           ││
│  │ System: IVRS                                                ││
│  │ Impact: 1 of 4 IVRS positions affected                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  NFL LEAD JUSTIFICATION                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Hardware failure at Booth 3 cannot be resolved before       ││
│  │ kickoff. Backup equipment deployed but this specific test   ││
│  │ cannot be completed. Other 3 booths fully operational.      ││
│  │ Game can proceed safely.                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  RISK ASSESSMENT: 🟡 MEDIUM - Reduced redundancy               │
│                                                                  │
│  GAME READINESS IMPACT                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Current Readiness: 96%                                      ││
│  │ If Approved: Will reach 100% (skipped task counted)        ││
│  │ If Denied: Will remain at 96% at kickoff                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  RELATED ISSUE: ISS-441 (IVRS Booth 3 hardware failure)        │
│  [View Issue Details]                                           │
│                                                                  │
│  DECISION                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ APPROVE - Allow task to be skipped                       ││
│  │ ○ DENY - Task must be completed                            ││
│  │                                                              ││
│  │ Decision Notes:                                             ││
│  │ ┌───────────────────────────────────────────────────────┐   ││
│  │ │ Approved. 3 of 4 booths operational is acceptable    │   ││
│  │ │ redundancy. Follow up on equipment replacement.      │   ││
│  │ └───────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Deny Override]  [Approve Override]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Playbook Audit Log

```
┌─────────────────────────────────────────────────────────────────┐
│  PLAYBOOK AUDIT LOG                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Week 16 | Saints @ Falcons | IVRS Playbook                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Dec 15 │ CREATED from venue template                        ││
│  │ 10:00  │ By: System (auto-generated for Week 16)            ││
│  │ 🟢     │ Tasks: 7 (inherited from venue template)           ││
│  │────────│────────────────────────────────────────────────────││
│  │ Dec 16 │ MODIFIED                                           ││
│  │ 14:30  │ By: S. Johnson (NFL Lead)                          ││
│  │ 🟢     │ Added: "Battery check" task (#3)                   ││
│  │        │ Reason: "Proactive based on prior issue"           ││
│  │────────│────────────────────────────────────────────────────││
│  │ Dec 19 │ MODIFIED (Soft Lock)                               ││
│  │ 09:15  │ By: S. Johnson (NFL Lead)                          ││
│  │ 🟡     │ Modified: "Equipment inventory" description        ││
│  │        │ Reason: "Clarified to include serial numbers"      ││
│  │        │ ⚠️ Made during compliance window                   ││
│  │────────│────────────────────────────────────────────────────││
│  │ Dec 19 │ LOCKED                                             ││
│  │ 12:00  │ By: System (auto-lock at T-1h)                     ││
│  │ 🔴     │ Reason: Final Gate                                 ││
│  │────────│────────────────────────────────────────────────────││
│  │ Dec 19 │ OVERRIDE REQUEST                                   ││
│  │ 12:15  │ By: S. Johnson (NFL Lead)                          ││
│  │ 🔴     │ Requested: Skip task #4 (Booth 3)                  ││
│  │        │ Reason: Hardware failure, cannot resolve           ││
│  │────────│────────────────────────────────────────────────────││
│  │ Dec 19 │ OVERRIDE APPROVED                                  ││
│  │ 12:18  │ By: IT Executive (CTO)                             ││
│  │ 🔴     │ Decision: Approved skip, 3/4 booths sufficient     ││
│  │        │ Task #4 marked as SKIPPED (authorized)             ││
│  │────────│────────────────────────────────────────────────────││
│  │ Dec 19 │ CLOSED                                             ││
│  │ 17:30  │ By: System (auto-close at T+4h)                    ││
│  │ ⚫     │ Final Status: Complete (with 1 authorized skip)    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Export Audit Log]  [View Full History]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Edit Types and Permissions

| Edit Type | Unlocked (T-14d to T-4h) | Soft Lock (T-4h to T-1h) | Hard Lock (T-1h to T+4h) |
|-----------|--------------------------|--------------------------|--------------------------|
| **Add Task** | ✅ NFL Lead | ⚠️ NFL Lead + Reason | 🔴 IT Exec Override |
| **Modify Task** | ✅ NFL Lead | ⚠️ NFL Lead + Reason | 🔴 IT Exec Override |
| **Delete Task** | ✅ NFL Lead | ⚠️ NFL Lead + Reason | 🔴 IT Exec Override |
| **Reorder Tasks** | ✅ NFL Lead | ⚠️ NFL Lead + Reason | 🔴 IT Exec Override |
| **Skip Task** | ✅ NFL Lead | ⚠️ NFL Lead + Reason | 🔴 IT Exec Override |
| **Import Template** | ✅ NFL Lead | ❌ Not allowed | ❌ Not allowed |
| **View History** | ✅ All | ✅ All | ✅ All |

---

## Task Skip vs Delete

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKIP vs DELETE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SKIP TASK                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  • Task remains in playbook                                     │
│  • Marked as "Skipped" with reason                              │
│  • Counts toward 100% completion                                │
│  • Appears in audit log                                         │
│  • Available during Hard Lock (with override)                   │
│  • Use for: "Can't complete due to circumstances"               │
│                                                                  │
│  DELETE TASK                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  • Task removed from playbook                                   │
│  • Not visible to GDAs                                          │
│  • Does not count in completion math                            │
│  • Recorded in audit log (deletion event)                       │
│  • NOT available during Hard Lock                               │
│  • Use for: "This task should not exist"                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Playbook Lock Rules Summary

| Rule | Description | Enforced By |
|------|-------------|-------------|
| **NFL Lead Edit Authority** | NFL Lead can edit assigned game without approval | Role-based |
| **Soft Lock Warning** | Changes T-4h to T-1h require reason | Workflow |
| **Hard Lock** | Auto-lock at T-1h | System |
| **Override Authority** | Only IT Exec can override hard lock | Role-based |
| **Audit Trail** | All changes logged with user and reason | System |
| **Auto-Close** | Playbook closes at T+4h, becomes read-only | System |
| **Template Protection** | Master/venue templates require higher approval | Role-based |

---

**Document Version:** 8.3.1  
**Playbook Update & Lock Logic**
