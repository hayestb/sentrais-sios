# Sentrais Role × System × Location Matrix

## Complete Mapping of NFL GDA Operations

This matrix defines every unique playbook combination across the NFL's game day technology operations.

## 📊 Complete Matrix

| System | Role (Hat) | Location(s) | Playbook ID | Tasks | Critical Tasks | Avg Duration (min) | Dependencies |
|--------|-----------|-------------|-------------|-------|---------------|-------------------|--------------|
| **EFC** | Blue Hat | Stadium-Wide | PB_EFC_BLUE_STADIUM_001 | 19 | 12 | 340 | None (START) |
| **IVRS** | Blue Hat | Home Field | PB_IVRS_BLUE_HOME_001 | 12 | 8 | 90 | None |
| **IVRS** | Blue Hat | Visitor Field | PB_IVRS_BLUE_VISITOR_001 | 12 | 8 | 90 | None |
| **O2O** | Blue Hat | Field | PB_O2O_BLUE_FIELD_001 | 12 | 8 | 120 | EFC_1.8, FTR |
| **FTR** | Gray Hat | Home Sideline | PB_FTR_GRAY_HOME_001 | 39 | 21 | 210 | None |
| **FTR** | Gray Hat | Visitor Sideline | PB_FTR_GRAY_VISITOR_001 | 39 | 21 | 210 | None |
| **WiFi** | Gray Hat | Home Sideline | PB_WIFI_GRAY_HOME_001 | 16 | 9 | 210 | EFC_1.8 |
| **WiFi** | Gray Hat | Visitor Sideline | PB_WIFI_GRAY_VISITOR_001 | 16 | 9 | 210 | EFC_1.8 |
| **IR TECH** | Gray Hat | Booth + Field | PB_IRTECH_GRAY_BOOTH_001 | 38 | 24 | 360 | FTR |
| **Hawk-Eye** | Gray Hat | Stadium-Wide | PB_HAWKEYE_GRAY_STADIUM_001 | 127 | 64 | 540 | FTR, IR TECH |
| **C2P** | Orange Hat | Home Sideline | PB_C2P_ORANGE_HOME_001 | 23 | 14 | 190 | EFC_1.8 |
| **C2P** | Orange Hat | Visitor Sideline | PB_C2P_ORANGE_VISITOR_001 | 22 | 14 | 190 | EFC_1.8 |
| **SVS** | Purple Hat | Home Sideline | PB_SVS_PURPLE_HOME_SL_001 | 22 | 12 | 120 | FTR |
| **SVS** | Purple Hat | Visitor Sideline | PB_SVS_PURPLE_VISIT_SL_001 | 22 | 12 | 120 | FTR |
| **SVS** | Purple Hat | Home Booth | PB_SVS_PURPLE_HOME_BTH_001 | 45 | 24 | 240 | FTR |
| **SVS** | Purple Hat | Visitor Booth | PB_SVS_PURPLE_VISIT_BTH_001 | 45 | 24 | 240 | FTR |

## 🎭 Role-Based Operational Bundles (RBOBs)

### Blue Hat Bundle
**Total Tasks**: 55  
**Systems**: EFC, IVRS (Home), IVRS (Visitor), O2O  
**Playbooks Included**:
- PB_EFC_BLUE_STADIUM_001
- PB_IVRS_BLUE_HOME_001
- PB_IVRS_BLUE_VISITOR_001
- PB_O2O_BLUE_FIELD_001

**Coordination Requirements**:
- EFC must complete before O2O can start
- IVRS operations are independent (can run parallel)
- Blue Hat has 2 field technicians (Home/Visitor IVRS) + 1 EFC coordinator

### Gray Hat Bundle
**Total Tasks**: 270  
**Systems**: FTR (Home), FTR (Visitor), WiFi (Home), WiFi (Visitor), IR TECH, Hawk-Eye  
**Playbooks Included**:
- PB_FTR_GRAY_HOME_001
- PB_FTR_GRAY_VISITOR_001
- PB_WIFI_GRAY_HOME_001
- PB_WIFI_GRAY_VISITOR_001
- PB_IRTECH_GRAY_BOOTH_001
- PB_HAWKEYE_GRAY_STADIUM_001

**Coordination Requirements**:
- FTR (both sidelines) must complete before WiFi, IR TECH, Hawk-Eye
- WiFi requires EFC_1.8 completion
- IR TECH enables Hawk-Eye
- Requires 6 technicians: 2 FTR, 2 WiFi, 1 IR TECH, 1 Hawk-Eye

### Purple Hat Bundle
**Total Tasks**: 134  
**Systems**: SVS (4 locations)  
**Playbooks Included**:
- PB_SVS_PURPLE_HOME_SL_001
- PB_SVS_PURPLE_VISIT_SL_001
- PB_SVS_PURPLE_HOME_BTH_001
- PB_SVS_PURPLE_VISIT_BTH_001

**Coordination Requirements**:
- All 4 locations require FTR network infrastructure
- Home Booth and Visitor Booth must coordinate "new game" start
- Failover testing must occur across all 4 locations simultaneously
- Requires 4 technicians (one per location)

### Orange Hat Bundle
**Total Tasks**: 45  
**Systems**: C2P (Home), C2P (Visitor)  
**Playbooks Included**:
- PB_C2P_ORANGE_HOME_001
- PB_C2P_ORANGE_VISITOR_001

**Coordination Requirements**:
- Both locations require EFC_1.8 completion (radios ON)
- Home and Visitor C2P techs must coordinate helmet module handoff
- Equipment manager coordination required at T-3.5h
- Requires 2 technicians (one per sideline)

## 🗺️ Location-Based Distribution

### Field Locations

**Home Field**
- IVRS (Blue Hat) - 12 tasks
- O2O (Blue Hat, shared) - positioning

**Visitor Field**  
- IVRS (Blue Hat) - 12 tasks
- O2O (Blue Hat, shared) - positioning

**Home Sideline**
- FTR (Gray Hat) - 39 tasks
- WiFi (Gray Hat) - 16 tasks
- C2P (Orange Hat) - 23 tasks
- SVS (Purple Hat) - 22 tasks

**Visitor Sideline**
- FTR (Gray Hat) - 39 tasks
- WiFi (Gray Hat) - 16 tasks
- C2P (Orange Hat) - 22 tasks
- SVS (Purple Hat) - 22 tasks

**Home Booth**
- SVS (Purple Hat) - 45 tasks
- IR TECH (Gray Hat, shared) - booth setup portion

**Visitor Booth**
- SVS (Purple Hat) - 45 tasks
- IR TECH (Gray Hat, shared) - booth setup portion

**Stadium-Wide**
- EFC (Blue Hat) - 19 tasks
- Hawk-Eye (Gray Hat) - 127 tasks

## 🔗 Cross-Playbook Dependencies

### Level 1 Dependencies (Start Gate)
```
EFC (Stadium-Wide)
└─ Task: EFC_1.8 (Verizon radios ON)
   ├─> Enables: WiFi (Home)
   ├─> Enables: WiFi (Visitor)
   ├─> Enables: C2P (Home)
   ├─> Enables: C2P (Visitor)
   └─> Enables: O2O (Field)
```

### Level 2 Dependencies (Infrastructure)
```
FTR (Home Sideline)
└─ Task: FTR_1.18 (Network connections verified)
   ├─> Enables: SVS (Home Sideline)
   ├─> Enables: SVS (Home Booth)
   └─> Enables: IR TECH (partial)

FTR (Visitor Sideline)
└─ Task: FTR_2.22 (Network connections verified)
   ├─> Enables: SVS (Visitor Sideline)
   ├─> Enables: SVS (Visitor Booth)
   └─> Enables: IR TECH (partial)
```

### Level 3 Dependencies (Booth Systems)
```
IR TECH (Booth)
└─ Task: IRTECH_1.3 (Booth fully setup)
   └─> Enables: Hawk-Eye (Camera integration)
```

## 📦 Playbook File Naming Convention

**Format**: `playbook_{SYSTEM}_{ROLE}_{LOCATION}_{VERSION}.json`

**Examples**:
- `playbook_efc_blue_stadium_001.json`
- `playbook_wifi_gray_home_sideline_001.json`
- `playbook_svs_purple_visitor_booth_001.json`
- `playbook_c2p_orange_home_sideline_001.json`

**Role Abbreviations**:
- Blue Hat → `blue`
- Gray Hat → `gray`
- Purple Hat → `purple`
- Orange Hat → `orange`
- Yellow Hat → `yellow`
- Green Hat → `green`

**Location Abbreviations**:
- Stadium-Wide → `stadium`
- Home Sideline → `home_sideline`
- Visitor Sideline → `visitor_sideline`
- Home Field → `home_field`
- Visitor Field → `visitor_field`
- Home Booth → `home_booth`
- Visitor Booth → `visitor_booth`
- Booth (general) → `booth`
- Field (general) → `field`

## 🎯 Operational Deployment Mapping

### Minimum Staffing Requirements

**Per Game Day**:
- Blue Hats: 4 (1 EFC, 2 IVRS, 1 O2O shared)
- Gray Hats: 6 (2 FTR, 2 WiFi, 1 IR TECH, 1 Hawk-Eye)
- Purple Hats: 4 (1 per SVS location)
- Orange Hats: 2 (1 per C2P sideline)

**Total**: 16 technicians per game

### Multi-Game Sunday Staffing (16 games)

Assuming average of 8 simultaneous games:
- Blue Hats: 32 (4 per game × 8 games)
- Gray Hats: 48 (6 per game × 8 games)
- Purple Hats: 32 (4 per game × 8 games)
- Orange Hats: 16 (2 per game × 8 games)

**League-Wide Total**: 128 technicians working simultaneously

## 🚦 Dependency Graph Visualization

### ASCII Dependency Map

```
TIME: T-5h (M2 Start)
│
├─ [EFC] Clock in + CBRS Scans (START GATE)
│   └─ EFC_1.8: Radios ON ✓
│       ├─> [WiFi Home] Begin operations
│       ├─> [WiFi Visitor] Begin operations
│       ├─> [C2P Home] Begin operations
│       ├─> [C2P Visitor] Begin operations
│       └─> [O2O] Begin operations
│
├─ [FTR Home] Network setup (START GATE)
│   └─ FTR_1.18: Network ready ✓
│       ├─> [SVS Home SL] Begin operations
│       └─> [SVS Home Booth] Begin operations
│
├─ [FTR Visitor] Network setup (START GATE)
│   └─ FTR_2.22: Network ready ✓
│       ├─> [SVS Visitor SL] Begin operations
│       └─> [SVS Visitor Booth] Begin operations
│
├─ [IVRS Home] Independent operations (No dependencies)
├─ [IVRS Visitor] Independent operations (No dependencies)
│
TIME: T-3h (M3 Start)
│
├─ [IR TECH] Booth setup (REQUIRES: FTR)
│   └─ IRTECH_1.3: Booth ready ✓
│       └─> [Hawk-Eye] Camera integration
│
TIME: T-1h (M4 Final Readiness)
│
└─ [All Systems] Final validations, CIO certification
```

## 📊 Readiness Rollup Logic

### System-Level Readiness

For each playbook, calculate:
```javascript
system_readiness = (completed_tasks / total_tasks) × 100
```

Apply milestone thresholds:
- M2 (T-4h): Must be ≥ 70%
- M3 (T-2h): Must be ≥ 90%
- M4 (T-1h): Must be 100%

### Role-Level Readiness (RBOB)

For each role (hat color), aggregate across all systems:
```javascript
role_readiness = Σ(system_readiness × system_weight) / Σ(system_weight)
```

Where system_weight = number of critical tasks

### League-Level Readiness

For CIO dashboard across all games:
```javascript
league_readiness = Σ(game_readiness) / total_games
```

Where game_readiness is the minimum across all systems for that game

## 🔄 Task State Transition Rules

```
Task Lifecycle:
1. Open → Can be started (no blocking dependencies)
2. Blocked → Cannot start (dependencies incomplete)
3. In Progress → Currently being executed
4. Complete → Finished and verified
5. Skipped → Not required this game (based on frequency)
6. Failed → Attempted but unsuccessful

Transition Rules:
- Open → In Progress: User clicks "Start Task"
- In Progress → Complete: User submits evidence + clicks "Complete"
- Complete → [triggers]: Check dependent tasks, unblock if all dependencies met
- Blocked → Open: When last dependency completes
- Any → Failed: User reports issue + escalates
```

## 🎓 Training Path by Role

### Blue Hat Training
**Duration**: 2 days  
**Modules**:
1. EFC operations and CBRS scanning (4 hours)
2. IVRS field operations (3 hours)
3. O2O setup and monitoring (2 hours)
4. Dependency awareness (EFC gates) (1 hour)
5. WhatsApp communication protocols (1 hour)
6. UKG time tracking (1 hour)

### Gray Hat Training
**Duration**: 3 days  
**Modules**:
1. FTR network infrastructure (4 hours)
2. WiFi testing and signal validation (3 hours)
3. IR TECH booth setup (4 hours)
4. Hawk-Eye camera systems (6 hours)
5. Cross-system dependencies (2 hours)
6. Vendor coordination (1 hour)

### Purple Hat Training
**Duration**: 2 days  
**Modules**:
1. SVS StillShot systems (4 hours)
2. Multi-location coordination (2 hours)
3. Failover testing procedures (2 hours)
4. Coach interaction protocols (1 hour)
5. DVSport software (3 hours)

### Orange Hat Training  
**Duration**: 1.5 days  
**Modules**:
1. C2P helmet systems (3 hours)
2. Frequency management (2 hours)
3. Equipment manager coordination (1 hour)
4. EFC dependency understanding (1 hour)
5. In-game monitoring (2 hours)

---

**Matrix Version**: 2.0.0  
**Total Playbooks**: 16  
**Total Tasks**: 464  
**Total Critical Tasks**: 260  
**Minimum Staffing**: 16 per game  

**This matrix enables complete Sentrais orchestration across all roles, systems, and locations.**
