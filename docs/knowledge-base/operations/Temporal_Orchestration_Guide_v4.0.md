# NFL GDA Temporal Orchestration Guide v4.0
## Visual Sequencing: 16 Playbooks | 9 Systems | M1-M6 Timeline

**Purpose**: This guide visualizes how all 16 playbooks orchestrate through the 6-milestone temporal framework, showing activation timing, dependencies, and critical coordination points.

---

## ⏰ TEMPORAL FRAMEWORK OVERVIEW

```
M1: Pre-Arrival          M2: Pre-Game         M3: Systems         M4: Final          M5: In-Game        M6: Post-Game
   Verification           Preparation          Validation          Readiness          Operations         Review
   
T-48h to T-24h          T-5h to T-4h         T-4h to T-1h        T-1h to KO         KO to Game End     Game End +1h
     ↓                       ↓                     ↓                   ↓                   ↓                  ↓
[Remote Checks]         [Infrastructure]     [Deploy & Test]     [Position]         [Monitor]          [Debrief]
```

---

## 📅 MILESTONE-BY-MILESTONE ACTIVATION SEQUENCE

### **M1: PRE-ARRIVAL VERIFICATION** (T-48h to T-24h)

**Active Playbooks**: 0 (Remote pre-checks, not yet on-site)

**Purpose**: Remote system health checks, venue readiness validation, schedule coordination

**Key Activities**:
- Venue coordinators confirm FTC access credentials
- Equipment manifests reviewed
- GDA assignments finalized in EVERGAME
- Travel and lodging confirmed for road games

---

### **M2: PRE-GAME PREPARATION** (T-5h to T-4h)

**Active Playbooks**: 2 (Foundational Systems)

```
🔧 FTC (Football Technology Core) - FIRST TO ACTIVATE
   └── Tasks: 1.1 → 1.5 (Access FTC, verify power/cooling, HVAC, connectivity)
   └── Purpose: Establish infrastructure backbone for ALL systems
   └── Critical Output: FTC readiness = green light for all downstream systems

📡 EFC (Event Frequency Coordination) - PARALLEL TO FTC
   └── Tasks: Begin CBRS spectrum scanning, frequency coordination
   └── Purpose: RF environment clearance before C2P/C2C activation
   └── Critical Output: Frequency sets assigned, interference cleared
```

**Critical Milestone**: By end of M2, FTC + EFC must be operational or ALL downstream systems blocked

---

### **M3: SYSTEMS VALIDATION** (T-4h to T-1h) - **PRIMARY DEPLOYMENT WINDOW**

**Active Playbooks**: 14 (ALL operational systems)

This is the busiest phase - nearly all systems deploy and test in parallel.

#### **EARLY M3 (T-4h to T-3.5h): Network Infrastructure**

```
PHASE 1: Network Foundation (T-4h)
├── 🔧 FTC (continued)
│   └── Tasks: 2.1 → 4.2 (Fiber path validation, server health, network tests)
│
├── 🌐 WiFi
│   └── Tasks: 1.1 → 1.5 (Controller health, SSID validation, AP checks, cart antenna alignment)
│   └── Dependencies: FTC (uplink connectivity)
│
└── 🔗 FTR (Field Technology Resources)
    └── Tasks: 1.1 → 1.13 (Cart positioning, OpticalCon cables, WiFi antennas, IVR monitors)
    └── Dependencies: FTC (core network)
    └── Critical: Must position carts at 50-yard line before sideline systems can deploy
```

**Output**: Network backbone ready (FTC → FTR → WiFi all green)

---

#### **MID M3 (T-3.5h to T-3h): Sideline & Booth Deployment**

```
PHASE 2: Sideline Systems (T-3.5h)
├── 🔴 C2P (Coach-to-Player) - Home & Visitor Sideline
│   ├── Home: Tasks 1.1 → 1.9 (WhatsApp check-in, antenna mount, UPS on, helmet distribution)
│   ├── Visitor: Tasks 1.1 → 1.9 (Mirror of Home)
│   └── Dependencies: EFC (frequency clearance), FTR (cart positioned)
│
├── 🟡 C2C (Coach-to-Coach) - Home & Visitor Sideline ✨ NEW
│   ├── Home: Tasks 1.1 → 1.7 (Cart position, fiber validation, GreenGo setup, beltpack distribution)
│   ├── Visitor: Tasks 1.1 → 1.7 (Mirror of Home)
│   └── Dependencies: FTR (cart positioned), FTC (fiber paths)
│
└── 🟣 SVS (Sideline Viewing System) - Home & Visitor Sideline
    ├── Home: Tasks 1.1 → 1.5 (Surface pen test, team names, charging cart connection)
    ├── Visitor: Tasks 1.1 → 1.5 (Mirror of Home)
    └── Dependencies: FTR (network setup), FTC (backend servers)

PHASE 3: Booth Systems (T-3.5h)
├── 🟡 C2C (Coach-to-Coach) - Home & Visitor Booth ✨ NEW
│   ├── Home: Tasks 1.1 → 1.5 (Fiber validation 24+12 strands, wired GreenGo setup)
│   ├── Visitor: Tasks 1.1 → 1.5 (Mirror of Home)
│   └── Dependencies: FTC (fiber infrastructure)
│
├── 🟣 SVS (Sideline Viewing System) - Home & Visitor Booth
│   ├── Home: Tasks 1.1 → 1.15 (StillShot server, PlayView, coach video feeds, booth tablets)
│   ├── Visitor: Tasks 1.1 → 1.15 (Mirror of Home)
│   └── Dependencies: FTC (backend servers), FTR (network)
│
├── 🔵 IVRS (Injury Video Review) - Home & Visitor Booth
│   ├── Home: Tasks 1.1 → 1.6 (Booth setup, GreenGo comms, program audio, video feeds)
│   ├── Visitor: Tasks 1.1 → 1.6 (Mirror of Home)
│   └── Dependencies: FTR (video feeds), FTC (backend)
│
└── 🎥 Hawk-Eye (Instant Replay) - IR Booth + Coaches Booths
    └── Tasks: 1.1 → 1.8 (Rack power, network, time sync, camera feeds, config profile)
    └── Dependencies: FTC (backend servers), FTR (network), broadcast feeds
```

**Output**: All equipment distributed, systems powered on and connected

---

#### **LATE M3 (T-3h to T-1h): System Testing & Coordination**

```
PHASE 4: System Testing (T-3h)
├── 🟡 C2C System Tests (ALL 4 LOCATIONS COORDINATE)
│   ├── Home Booth → Home Sideline: End-to-end test (Task 2.2)
│   ├── Visitor Booth → Visitor Sideline: End-to-end test (Task 2.2)
│   └── CRITICAL: Booth-to-sideline communication must be validated
│
├── 🔴 C2P System Tests
│   ├── Home: Helmet module testing, frequency validation
│   ├── Visitor: Helmet module testing, frequency validation
│   └── Coordination with EFC for interference clearance
│
├── 🟣 SVS System Tests
│   ├── All 4 locations: Tablet connectivity, image quality, failover testing
│   └── CRITICAL COORDINATION: At T-30min, all 4 SVS locations sync "new game" start
│
├── 🔵 IVRS System Tests
│   ├── Home/Visitor Booth: Video tag testing, AT Spotter coordination
│   └── Sideline monitors: AJA unit failover testing
│
├── 🎥 Hawk-Eye System Tests
│   └── Replay workflow test with IR Tech (capture, playback, export to AMGC)
│
└── 🌐 WiFi System Tests (T-3h)
    └── Throughput tests: Home bench, Visitor bench, 50-yard line seating
```

**CRITICAL COORDINATION POINT (T-2h)**: All systems final testing with coaching staff present

```
PHASE 5: Final Validation (T-2h)
├── 🟡 C2C: Final testing with coaching staff (sideline + booth positions)
├── 🔴 C2P: Final helmet testing with equipment managers
├── 🟣 SVS: Final tablet distribution and coach validation
├── 🔵 IVRS: Final video feed validation with AT Spotters
└── 🎥 Hawk-Eye: Final replay workflow with Replay Official
```

**Output**: All systems validated, coaching staff confirmed, issues reported to NFL Ops

---

### **M4: FINAL READINESS** (T-1h to Kickoff)

**Active Playbooks**: 16 (ALL systems in final readiness state)

#### **T-90min: EVERGAME Readiness Confirmation**

```
ALL SYSTEMS REPORT READINESS STATUS TO EVERGAME:
├── 🔧 FTC: Infrastructure health confirmed
├── 📡 EFC: Frequency environment clean
├── 🔗 FTR: Network operational
├── 🌐 WiFi: AP availability + capacity validated
├── 🔴 C2P Home/Visitor: Ready for kickoff
├── 🟡 C2C Home/Visitor Sideline + Booth: Ready for kickoff ✨
├── 🟣 SVS Home/Visitor Sideline + Booth: Ready for kickoff
├── 🔵 IVRS Home/Visitor Booth: Ready for kickoff
└── 🎥 Hawk-Eye: Replay system operational

OUTPUT: League-Wide Readiness Score calculated (target: >97%)
```

#### **T-1h: GDA Positioning**

```
ALL GDAS POSITION FOR GAME OPERATIONS:
├── C2P Techs: Home/Visitor bench areas
├── C2C Techs: Home/Visitor bench areas + booth areas ✨
├── SVS Techs: Home/Visitor sidelines + booth areas
├── IVRS Techs: Home/Visitor booth areas (support AT Spotters + medical staff)
├── Hawk-Eye Tech: IR booth (support Replay Official)
├── FTR: Visitor sideline (behind bench, for all sideline tech support)
├── EFC: Press box or field (monitor RF spectrum)
├── WiFi Tech: NOC or stadium IT room (monitor network)
└── FTC Admin: FTC room (monitor infrastructure)
```

**Critical Rule**: GDAs must NOT have additional duties/responsibilities during game day other than their assigned system

---

### **M5: IN-GAME OPERATIONS** (Kickoff to Game End)

**Active Playbooks**: 16 (ALL systems in active monitoring state)

#### **Primary Activities**:

```
🔴 C2P: Monitor helmet comms, cutoff enforcement (15-sec rule), troubleshoot failures
🟡 C2C: Monitor booth-to-sideline comms, beltpack battery levels, equity enforcement (if needed) ✨
🟣 SVS: Monitor tablet connectivity, image delivery, server health
🔵 IVRS: Support AT Spotters, tag injury plays, provide medical staff video access
🎥 Hawk-Eye: Support Replay Official, capture clips, export to AMGC, troubleshoot
🔗 FTR: Respond to all sideline tech escalations, coordinate equipment replacements
🌐 WiFi: Monitor AP health, bandwidth utilization, respond to connectivity issues
📡 EFC: Monitor RF spectrum, mitigate interference, log events
🔧 FTC: Monitor infrastructure (temp, power, network, servers), respond to backend escalations
```

#### **CRITICAL INCIDENT RESPONSE: Equity Enforcement**

**C2C Equity Rule** (Total system failure = both wireless AND wired inoperable):
```
1. C2C Tech (affected team) → NFL Football Operations Rep
2. NFL Ops Rep → GDOC (212.450.2087)
3. GDOC → Instructs opposing coaching staff to relinquish ALL beltpacks + headsets
4. Equipment held until affected system restored
5. Upon restoration → Equipment returned to opposing team

EXCEPTION: Partial failure (some coaches can communicate) = NO equity enforcement
```

**C2P Equity Rule** (Total system failure):
```
Similar process - opposing team cannot use C2P until problem resolved
NOTE: If C2C equity enforced, teams MAY use C2P transmit radio (red "C2P Coach") 
      for play calls ONLY after C2P tech confirms cutoff is operational
```

**SVS Equity Rule** (Tiered by failure type):
```
- Total system failure (all tablets) → Opposing team cannot use tablets
- Sideline tablets only failure → Opposing team sideline off, booth remains
- Booth tablets only failure → Opposing team booth off, sideline remains  
- Angle failure (SL or EZ) → Opposing team loses same angle, other remains
```

---

### **M6: POST-GAME REVIEW** (Game End +1h)

**Active Playbooks**: 16 (ALL systems in debrief state)

#### **Phase 1: Equipment Collection & Inspection**

```
🔴 C2P: Collect helmet modules from equipment managers
🟡 C2C: Collect all beltpacks (20 bench + booth) + headsets (40) from equipment managers ✨
🟣 SVS: Collect all tablets (20 sideline + 12 booth per team) from equipment managers
🔵 IVRS: Collect booth equipment, headsets, verify no damage
🎥 Hawk-Eye: Shutdown replay systems, export final clips
🔗 FTR: Secure cart equipment, spare inventory count
🌐 WiFi: Export performance summary (client counts, throughput, error rates)
📡 EFC: Export RF spectrum logs, interference events
🔧 FTC: Generate system health report (environmental, network, server performance)
```

#### **Phase 2: Damage Inspection & RMA**

```
ALL SYSTEMS: Inspect equipment for damage
├── Note malfunctioning units
├── Initiate RMA if needed (Novalume for GreenGo, Bexel for FTR, etc.)
└── Log missing equipment for accountability
```

#### **Phase 3: GMS Reporting**

```
ALL SYSTEMS: Submit game day reports to GMS.NFL.NET
├── System performance summary
├── Issues encountered + resolutions
├── Equipment damage/loss
├── Recommendations for improvement
└── Upload to EVERGAME for historical analysis
```

#### **Phase 4: Clock Out & Final Status**

```
ALL GDAS:
├── Clock out in UKG
├── Post 'System Complete' in Football Technology WhatsApp
└── EVERGAME records final task completion rates, performance scores
```

---

## 🔗 CRITICAL COORDINATION POINTS

### **COORDINATION POINT 1: T-3h (C2C End-to-End Testing)**
**Who**: All 4 C2C GDAs (Home/Visitor Sideline + Home/Visitor Booth)
**What**: Validate booth-to-sideline communication both teams
**Why**: Ensure equity enforcement readiness if failure occurs in-game
**Dependencies**: FTC fiber paths, FTR cart positioning

---

### **COORDINATION POINT 2: T-2h (Final System Validation)**
**Who**: All 16 playbooks, all GDAs
**What**: Final testing with coaching staff present, NFL Ops notification if issues
**Why**: Last opportunity to resolve problems before game operations
**Escalation**: Issues reported to NFL Football Operations (212.450.2087)

---

### **COORDINATION POINT 3: T-30min (SVS New Game Sync)**
**Who**: All 4 SVS GDAs (Home/Visitor Sideline + Home/Visitor Booth)
**What**: Coordinate "new game" start across all locations
**Why**: Ensures tablet image delivery synchronized for both teams
**Dependencies**: FTC backend servers, FTR network infrastructure

---

### **COORDINATION POINT 4: T-1h (GDA Positioning)**
**Who**: All GDAs across all systems
**What**: Position at assigned locations, remain through game end
**Why**: Maintain communication for coaches, respond to issues immediately
**Rule**: No additional duties/responsibilities during game day

---

## 📊 DEPENDENCY CHAIN VISUALIZATION

```
FOUNDATIONAL (M2)
    FTC ──────────────────────────────────────────────┐
     ↓                                                  ↓
    EFC (frequency clearance) ──→ C2P (requires RF)    │
                                                        │
NETWORK (Early M3)                                     │
    FTC ──→ FTR ──────────────────────────────────────┤
     ↓       ↓                                          │
    WiFi    │                                          │
            │                                          │
OPERATIONS (Mid-Late M3)                              │
            ├──→ C2C Home/Visitor Sideline ✨          │
            ├──→ C2C Home/Visitor Booth ✨   ──────────┘
            ├──→ C2P Home/Visitor Sideline
            ├──→ SVS Home/Visitor Sideline + Booth
            ├──→ IVRS Home/Visitor Booth
            └──→ Hawk-Eye IR + Coaches Booths

LEGEND:
──→ Direct dependency (upstream must complete before downstream)
✨  New v4.0 playbook
```

---

## ⚠️ FAILURE CASCADE SCENARIOS

### **Scenario 1: FTC Failure (M2)**
```
❌ FTC offline → ALL DOWNSTREAM SYSTEMS BLOCKED
   ├── No fiber paths → C2C cannot connect
   ├── No backend servers → SVS, IVRS, Hawk-Eye cannot operate
   ├── No uplink → WiFi cannot provide internet
   └── RESULT: Game delay or postponement

MITIGATION:
   └── FTC redundancy: UPS + generator tie-in, backup servers
   └── M2 activation ensures 4+ hours to resolve infrastructure issues
```

---

### **Scenario 2: FTR Failure (Early M3)**
```
❌ FTR cart not positioned → SIDELINE SYSTEMS BLOCKED
   ├── No cart → C2P cannot mount antennas
   ├── No cart → C2C cannot connect GreenGo
   ├── No cart → SVS cannot connect charging carts
   └── RESULT: Sideline systems offline, equity enforcement triggered

MITIGATION:
   └── FTR priority: First sideline system to deploy (T-4h)
   └── 3+ hours buffer to reposition cart if weather/field issues
```

---

### **Scenario 3: EFC Failure to Clear Frequencies (M3)**
```
❌ EFC cannot clear RF interference → C2P BLOCKED
   ├── C2P cannot activate without clean frequency set
   ├── Interference from external sources (TV stations, special events)
   └── RESULT: C2P offline, equity enforcement triggered

MITIGATION:
   └── EFC early activation (M2): 5+ hours to coordinate with external sources
   └── Backup frequency sets (FS1 + FS2) available per sideline
```

---

## 🎯 EXECUTIVE DASHBOARD VIEWS (Real-Time M1-M6 Tracking)

### **Dashboard 1: NFL Executive (Business Values)**
```
LEAGUE-WIDE READINESS SCORE (Real-Time)
├── M2: FTC + EFC Status (🟢 Green = infrastructure ready)
├── M3: 14 Systems Deployment Progress (% complete per system)
├── M4: Final Readiness (target: >97% all games)
└── M5: In-Game Operations (incidents logged, resolution times)

CRITICAL ALERTS:
├── 🔴 M2: FTC failure → Game delay risk
├── 🟡 M3: System deployment behind schedule → Readiness at risk
└── 🔴 M5: Equity enforcement triggered → Competitive integrity event
```

---

### **Dashboard 2: NFL IT Executive (All Systems)**
```
SYSTEM-BY-SYSTEM READINESS (14 Games, Week 10)
├── FTC: 14/14 venues (🟢 100%)
├── EFC: 14/14 venues (🟢 100%)
├── FTR: 14/14 venues (🟢 100%)
├── WiFi: 14/14 venues (🟢 100%)
├── C2P: 14/14 venues (🟢 100%)
├── C2C: 14/14 venues (🟡 98.5% - 1 venue pending final test) ✨
├── SVS: 14/14 venues (🟢 100%)
├── IVRS: 14/14 venues (🟢 100%)
└── Hawk-Eye: 14/14 venues (🟢 100%)

TASK EXECUTION MONITOR (Real-Time)
├── M3 Active: 9,954 / 10,012 tasks complete (99.4%)
├── M4 Pending: 3 tasks (C2C Visitor Booth - ETA 25 min)
└── Issues: 2 open (DAL Visitor Booth C2C, minor delays)
```

---

### **Dashboard 3: NFL IT Lead (Venue Operations)**
```
MY ASSIGNED VENUES (MetLife, Lincoln Financial)
├── MetLife (NYG): M4 - Ready for Kickoff (24/24 GDAs certified)
├── Lincoln Financial (PHI): M4 - Ready for Kickoff (24/24 GDAs certified)

TECHNOLOGY COMPLIANCE AUDIT (Latest)
├── FTC: ✅ Last audit Nov 10, next Dec 1
├── WiFi: ✅ Last audit Nov 15, next weekly
├── C2P: ✅ Last audit Nov 1, next Dec 1
└── C2C: ✅ Last audit Nov 8, next weekly ✨

USER ASSIGNMENTS (Week 12)
├── Mike Anderson (L4): C2P, EFC - 2/3 games
├── Jessica Lee (L3): SVS, IVRS - 1/2 games
└── Chris Williams (L3): Hawk-Eye - 2/2 games (at capacity)
```

---

## 📅 IMPLEMENTATION ROADMAP (v4.0 Rollout)

### **Phase 1: Certification Training (April-May 2025)**
```
Week 1-2: C2C Training Module Development
Week 3: FTC Training Module Development  
Week 4: Level 1 Certification Pilot (20 GDAs)
```

### **Phase 2: Preseason Pilot (June-August 2025)**
```
June: Level 2 Supervised Game Deployments (3 venues)
       ├── Mercedes-Benz Stadium (Atlanta)
       ├── MetLife Stadium (NY)
       └── SoFi Stadium (LA)
July-Aug: Full GDA Workforce Certification (238 GDAs)
```

### **Phase 3: Regular Season Deployment (September 2025)**
```
Week 1: v4.0 Production Deployment (all 32 venues)
Week 8: Target 95%+ Level 2 certification compliance
```

---

**Document Status**: ✅ **Ready for NFL Leadership Review & Pilot Authorization**

**Version**: 4.0 Temporal Orchestration Guide  
**Date**: November 18, 2025  
**Next Update**: Post-Pilot (Preseason Week 1, August 2025)

---

🏈 **"16 Playbooks, 9 Systems, 1 Synchronized Temporal Framework"** ⚡
