# 2025 GDA ORCHESTRATION PLAYBOOK
## Complete System Matrix & Implementation Status

**Last Updated**: November 18, 2025  
**Project**: EVERGAME - NFL 360 Unified Dashboard

---

## 📊 COMPLETE PLAYBOOK MATRIX

### 9 SYSTEMS | 16 PLAYBOOKS | ~650 TASKS

```
SYSTEM 1: C2P (Coach-to-Player Communication)
├── ✅ C2P_HomeSideline_GDA (v4.0) - 65 tasks
│   └── Role: Orange Hat (C2P Tech) | Location: Home Sideline | Critical: 28 tasks
├── ✅ C2P_VisitorSideline_GDA (v4.0) - 65 tasks
│   └── Role: Orange Hat (C2P Tech) | Location: Visitor Sideline | Critical: 28 tasks
└── Dependencies: EFC (frequency clearance), FTR (cart positioning)

SYSTEM 2: SVS (Sideline Viewing System)
├── ✅ SVS_HomeSideline_GDA (v3.5) - 42 tasks
│   └── Role: Purple Hat (SVS Tech) | Location: Home Sideline | Critical: 18 tasks
├── ✅ SVS_VisitorSideline_GDA (v3.5) - 42 tasks
│   └── Role: Purple Hat (SVS Tech) | Location: Visitor Sideline | Critical: 18 tasks
├── ✅ SVS_HomeBooth_GDA (v3.5) - 68 tasks
│   └── Role: Purple Hat (SVS Tech) | Location: Home Booth | Critical: 32 tasks
├── ✅ SVS_VisitorBooth_GDA (v3.5) - 68 tasks
│   └── Role: Purple Hat (SVS Tech) | Location: Visitor Booth | Critical: 32 tasks
└── Dependencies: FTR (network infrastructure), C2C coordination at T-30min

SYSTEM 3: EFC (Event Frequency Coordination)
├── ✅ EFC_Stadium_GDA (v3.5) - 31 tasks
│   └── Role: Blue Hat (EFC) | Location: Stadium-Wide | Critical: 19 tasks
└── Dependencies: NONE (gatekeeper system - must complete first)

SYSTEM 4: HAWK-EYE (Instant Replay)
├── ✅ HawkEye_Stadium_GDA (v3.5) - 30 tasks
│   └── Role: Hawk-Eye Tech | Location: IR Booth + Coaches Booths | Critical: 15 tasks
└── Dependencies: FTR (network), broadcast feeds

SYSTEM 5: IVRS (Injury Video Review System)
├── ✅ IVRS_HomeBooth_GDA (v3.5) - 42 tasks
│   └── Role: Blue Hat (IVRS Tech) | Location: Home Booth | Critical: 20 tasks
├── ✅ IVRS_VisitorBooth_GDA (v3.5) - 42 tasks
│   └── Role: Blue Hat (IVRS Tech) | Location: Visitor Booth | Critical: 20 tasks
└── Dependencies: FTR (video feeds), medical staff coordination

SYSTEM 6: FTR (Field Technology Resources)
├── ✅ FTR_Stadium_GDA (v3.5) - 25 tasks
│   └── Role: Gray Hat (FTR) | Location: Stadium (Both Sidelines) | Critical: 18 tasks
└── Dependencies: FTC (core network), WiFi infrastructure

SYSTEM 7: WiFi (Stadium Network)
├── ✅ WiFi_Stadium_GDA (v3.5) - 15 tasks
│   └── Role: WiFi Tech | Location: Bowl, Sidelines, Locker Rooms | Critical: 10 tasks
└── Dependencies: FTC (uplink connectivity)

SYSTEM 8: C2C (Coach-to-Coach Communication) ⚠️ **TO BE DEVELOPED**
├── 🔴 C2C_HomeSideline_GDA (v4.0) - ~40 tasks (estimated)
│   └── Role: Yellow Hat (C2C Tech) | Location: Home Sideline | Critical: ~18 tasks
├── 🔴 C2C_VisitorSideline_GDA (v4.0) - ~40 tasks (estimated)
│   └── Role: Yellow Hat (C2C Tech) | Location: Visitor Sideline | Critical: ~18 tasks
├── 🔴 C2C_HomeBooth_GDA (v4.0) - ~35 tasks (estimated)
│   └── Role: Yellow Hat (C2C Tech) | Location: Home Booth | Critical: ~15 tasks
├── 🔴 C2C_VisitorBooth_GDA (v4.0) - ~35 tasks (estimated)
│   └── Role: Yellow Hat (C2C Tech) | Location: Visitor Booth | Critical: ~15 tasks
└── Dependencies: FTR (sideline carts), FTC (fiber paths)

SYSTEM 9: FTC (Football Technology Core) ⚠️ **TO BE DEVELOPED**
├── 🔴 FTC_Stadium_GDA (v4.0) - ~35 tasks (estimated)
│   └── Role: FTC Admin | Location: Core Room/Cabinet | Critical: ~20 tasks
└── Dependencies: NONE (foundational infrastructure)
```

---

## 📈 IMPLEMENTATION STATUS

### ✅ COMPLETE (12 Playbooks)
- **C2P**: 2/2 playbooks (Home/Visitor Sideline)
- **SVS**: 4/4 playbooks (Sidelines + Booths)
- **EFC**: 1/1 playbook (Stadium-Wide)
- **Hawk-Eye**: 1/1 playbook (IR + Coaches)
- **IVRS**: 2/2 playbooks (Home/Visitor Booth)
- **FTR**: 1/1 playbook (Stadium Network)
- **WiFi**: 1/1 playbook (Stadium-Wide)

**Total**: 12 playbooks | ~470 tasks | 100% ready for deployment

---

### 🔴 TO BE DEVELOPED (4 Playbooks)

#### **C2C (Coach-to-Coach Communication)** - 4 Playbooks
**Priority**: HIGH (critical for competitive communications)

**C2C_HomeSideline_GDA** (~40 tasks)
- Setup sideline technology cart at 50-yard line (bench area)
- Test wireless GreenGo beltpacks (max 20 bench area)
- Validate booth-to-sideline communication (wireless + wired)
- Equity enforcement protocol validation
- In-game monitoring and troubleshooting

**C2C_VisitorSideline_GDA** (~40 tasks)
- Mirror of Home Sideline tasks
- Coordinate with Home technician for system tests
- Visitor-specific beltpack configuration

**C2C_HomeBooth_GDA** (~35 tasks)
- Wired GreenGo system setup in coaches booth
- Fiber path validation (24 strands booth-to-IR, 12 strands booth-to-sideline)
- Booth equipment configuration per coaching staff requirements
- Audio quality testing

**C2C_VisitorBooth_GDA** (~35 tasks)
- Mirror of Home Booth tasks
- Coordinate with Home booth for system-wide validation at T-2h

**Development Estimate**: 40 hours (10 hours per playbook)

---

#### **FTC (Football Technology Core)** - 1 Playbook
**Priority**: MEDIUM (foundational infrastructure, less dynamic than field systems)

**FTC_Stadium_GDA** (~35 tasks)
- Pre-arrival rack health verification (power, cooling, security camera)
- Network connectivity validation (MPLS uplink, all fiber paths)
- Server status checks (C2C, SVS, IR, IVRS backend systems)
- Environmental monitoring (temperature, humidity, BTU load)
- Security access validation (key card, approved GDA list)
- Backup power testing (UPS, generator tie-in)
- Post-game system health report

**Development Estimate**: 8 hours

---

### 📋 TOTAL PROJECT STATUS

| Status | Playbooks | Tasks | % Complete |
|--------|-----------|-------|------------|
| ✅ **Complete** | 12 | ~470 | **75%** |
| 🔴 **To Be Developed** | 5 | ~185 | **25%** |
| 📊 **TOTAL** | **17** | **~655** | **Target: 100% by June 2025** |

---

## 🎯 DEVELOPMENT PRIORITY SEQUENCE

### **Phase 1: C2C Playbooks** (CRITICAL PATH)
**Deadline**: April 2025 (before preseason training camp)

1. **Week 1-2**: C2C_HomeSideline_GDA + C2C_VisitorSideline_GDA
   - Highest priority (field operations, equity enforcement)
   - Reference: 2024 Game Operations Manual Section C (pages A27-A30)
   - Key workflows: Cart setup, beltpack distribution, wireless testing, equity validation

2. **Week 3**: C2C_HomeBooth_GDA + C2C_VisitorBooth_GDA
   - Booth-specific workflows (wired systems, fiber validation)
   - Coordination with sideline systems for end-to-end testing

**Deliverable**: 4 C2C playbooks ready for certification training (May 2025)

---

### **Phase 2: FTC Playbook** (FOUNDATION)
**Deadline**: May 2025

3. **Week 4**: FTC_Stadium_GDA
   - Infrastructure focus (less time-sensitive than field systems)
   - Can be developed in parallel with C2C certification training
   - Reference: 2024 Game Operations Manual Section A (pages A26-A27)

**Deliverable**: FTC playbook ready for venue audits (June 2025)

---

## 🔧 TECHNICAL SPECIFICATIONS

### Playbook JSON Schema (v4.0)
All new playbooks must follow the standardized NIN-structured format:

```json
{
  "playbook_id": "C2C_HomeSideline_GDA",
  "version": "4.0",
  "system": "C2C",
  "role": "Yellow Hat (C2C Tech)",
  "location": "Home Sideline",
  "temporal_frame": ["M1", "M2", "M3", "M4", "M5", "M6"],
  "nin_phases": ["Discover", "Diagnose", "Design", "Deploy", "Debrief"],
  "tasks": [
    {
      "task_id": "C2C_HS_1.1",
      "sequence": 1,
      "description": "Set up Sideline Technology cart at 50-yard line within bench area",
      "nin_phase": "Design",
      "milestone": "M3",
      "time_relative": "4h_before_kickoff",
      "dependencies": [],
      "severity": "high",
      "required": true,
      "telemetry_required": false,
      "state_machine": {
        "initial": "Open",
        "allowed_transitions": ["In Progress", "Complete", "Fail"]
      },
      "evidence_fields": ["timestamp_completed", "photo_url", "notes"]
    }
    // ... additional tasks
  ],
  "integration_points": [
    "UKG (time tracking)",
    "GMS.NFL.NET (post-game reporting)",
    "WhatsApp (status updates)",
    "EVERGAME (task execution tracking)"
  ],
  "certification_requirements": {
    "level_1": "Complete C2C training module, pass written exam (80%+)",
    "level_2": "Level 1 + 3 supervised games + simulation validation",
    "level_3": "Level 2 + 10+ certified games + advanced troubleshooting",
    "level_4": "Level 3 in 3+ systems + cross-system integration validation"
  }
}
```

---

### Evidence Capture Requirements (ALL NEW PLAYBOOKS)

#### **Required Evidence Types**:
1. **Timestamp**: ALL tasks (auto-captured on completion)
2. **Photo**: All physical setup tasks (cart placement, equipment configuration)
3. **Notes**: Optional free-form text for anomalies or clarifications
4. **API Telemetry**: Where available (GreenGo system health, fiber link status)
5. **WhatsApp Confirmation**: Check-in posts, critical milestones

#### **AI-Validated Evidence** (C2C Specific):
- Cart positioning (50-yard line, within bench area, not obstructed)
- Antenna placement (4 Verizon antennas protected from damage)
- Cable dress (fiber paths properly secured, not pinched)

---

## 📚 REFERENCE MATERIALS FOR DEVELOPMENT

### Primary Source Documents
1. **2024 Game Operations Manual** (pages A26-A30)
   - Section C: Coach-to-Coach (C2C) System
   - Section A: Football Technology Core (FTC)
   - Infrastructure requirements, fiber paths, power specs

2. **Existing Playbook Examples**
   - `C2P_HomeSideline_GDA.json` (similar cart-based system)
   - `FTR_Stadium_GDA` (infrastructure validation workflows)
   - `SVS_HomeBooth_GDA.json` (booth-based operations)

3. **Vendor Documentation**
   - Novalume (GreenGo system specs)
   - Bexel (FTR equipment integration)
   - NFL IT (fiber path documentation, FTC specifications)

---

## 🎓 CERTIFICATION FRAMEWORK ALIGNMENT

### C2C Certification Levels

**Level 1 - System Familiar**:
- Complete C2C training module (equipment overview, equity rules, fiber paths)
- Pass written exam (80%+)
- Can execute tasks under L3 supervision

**Level 2 - System Certified**:
- Level 1 + 3 supervised game deployments
- Pass digital simulation (cart setup, beltpack distribution, equity enforcement)
- Independent task execution authorized

**Level 3 - System Expert**:
- Level 2 + 10+ certified games
- Advanced troubleshooting validation (wireless interference, fiber path failures)
- Can train L1 GDAs, approve minor task modifications

**Level 4 - Multi-System Lead**:
- Level 3 in C2C + 2 additional systems (typically C2P, FTR)
- Cross-system coordination exercises (C2C + C2P + FTR dependencies)
- Can author playbook modifications, incident command authority

---

## 🚀 DEPLOYMENT TIMELINE

```
APRIL 2025
├── Week 1: C2C_HomeSideline_GDA development
├── Week 2: C2C_VisitorSideline_GDA development
├── Week 3: C2C_HomeBooth_GDA + C2C_VisitorBooth_GDA development
└── Week 4: FTC_Stadium_GDA development

MAY 2025
├── Week 1-2: Internal validation (NFL IT review)
├── Week 3: Certification training module development
└── Week 4: GDA Level 1 certification pilot (20 GDAs)

JUNE 2025
├── Week 1-2: Digital simulation environment launch
└── Week 3-4: Level 2 supervised game deployments (Preseason Week 1 pilot)

JULY-AUGUST 2025
└── Full GDA workforce certification (all 238 GDAs across 32 venues)

SEPTEMBER 2025
└── Regular Season Week 1 - Full deployment, all 16 playbooks operational
```

---

## ✅ ACCEPTANCE CRITERIA

### New Playbooks Must:
1. **[ ] Follow NIN 5-phase structure** (Discover, Diagnose, Design, Deploy, Debrief)
2. **[ ] Align with M1-M6 temporal framework** (Pre-arrival → Postgame)
3. **[ ] Include dependency mapping** (e.g., C2C depends on FTR cart setup)
4. **[ ] Specify evidence requirements** (timestamp, photo, API, AI-validation)
5. **[ ] Define severity levels** (Low, Medium, High for risk scoring)
6. **[ ] Include certification requirements** (Level 1-4 per system)
7. **[ ] Integrate with existing tools** (UKG, GMS.NFL.NET, WhatsApp, EVERGAME)
8. **[ ] Pass NFL IT validation review** (technical accuracy, completeness)
9. **[ ] Complete pilot deployment** (3 venues, Preseason Week 1)
10. **[ ] Achieve 95%+ task completion rate** (pilot success threshold)

---

## 📞 PROJECT CONTACTS

**Playbook Development**:
- EVERGAME Project Team
- NFL IT Operations Leadership

**Subject Matter Experts**:
- C2C System: Yellow Hat Coordinators (32 venues)
- FTC Infrastructure: NFL IT Venue Coordinators

**Certification Training**:
- NFL Football Technology Department
- Sentrais Training & Development

---

## 🔚 NEXT ACTIONS

1. **[ ] Approve development of 5 missing playbooks** (C2C × 4, FTC × 1)
2. **[ ] Assign development resources** (technical writers, SMEs, NFL IT reviewers)
3. **[ ] Set development timeline** (April-May 2025 target)
4. **[ ] Schedule pilot deployment** (3 venues, Preseason Week 1)
5. **[ ] Launch certification training development** (May 2025)

---

**Document Status**: ✅ **READY FOR PROJECT KICKOFF**  
**Version**: 4.0 System Matrix  
**Last Updated**: November 18, 2025

---

🏈 **"16 Playbooks, 9 Systems, 1 Unified Dashboard"** ⚡
