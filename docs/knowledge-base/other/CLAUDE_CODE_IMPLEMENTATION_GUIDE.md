# EVERGAME 4.0 MVP Playbook Update Instructions
## For Claude Code Implementation

---

## Quick Start

```bash
# 1. Add these files to your Claude Code session
claude

# 2. In Claude Code, add the specification file
/add EVERGAME_4.0_Playbook_Update_Spec.json

# 3. Then prompt Claude Code:
```

**Prompt to use:**
```
Update the EVERGAME 4.0 MVP playbooks based on the specification in EVERGAME_4.0_Playbook_Update_Spec.json. 

Key updates needed:
1. Integrate Hawk-Eye GD-1 (day-prior) tasks - 81 tasks starting at T-1 Day
2. Implement location-based task filtering for IVRS (4 positions), SVS (4 positions), C2P (2 positions)
3. Add WiFi structured evidence capture (dBm values, channel deviation tracking)
4. Update temporal framework to support T-1 Day for Hawk-Eye
5. Implement dependency chain enforcement (EFC initiates → IVRS/WiFi/SVS blocked until EFC complete)

Start by showing me the current playbook schema and we'll update systematically.
```

---

## Files to Transfer to Claude Code

| File | Purpose | Priority |
|------|---------|----------|
| `EVERGAME_4.0_Playbook_Update_Spec.json` | Complete implementation specification | **REQUIRED** |
| `NFL_GDA_Source_Truth_Analysis_Matrix.xlsx` | Reference data with all mappings | Reference |
| `NFL_GDA_Source_Truth_Analysis_Report.md` | Human-readable analysis | Reference |

---

## Implementation Checklist for Claude Code

### Phase 1: Schema Updates

- [ ] Add `temporal_start` field to playbook schema
  - Default: `T-6h`
  - Hawk-Eye: `T-1_DAY`
  
- [ ] Add `location` field to task assignment
  - IVRS: `Home_Booth`, `Visitor_Booth`, `Home_Field`, `Visitor_Field`
  - SVS: `Home_Sideline`, `Visitor_Sideline`, `Home_Booth`, `Visitor_Booth`
  - C2P: `Home_Sideline`, `Visitor_Sideline`

- [ ] Add WiFi evidence structure
  ```json
  {
    "wifi_results": {
      "dBm_readings": {...},
      "roaming_tests": {...},
      "antenna_angles": {...}
    },
    "channel_deviation_log": [...]
  }
  ```

### Phase 2: Playbook Data Updates

- [ ] Create `PB_HAWKEYE_GD1` playbook with 81 tasks
- [ ] Split IVRS into 4 location-specific playbooks
- [ ] Split SVS into 4 location-specific playbooks
- [ ] Update dependency chains

### Phase 3: Business Logic Updates

- [ ] Hawk-Eye GDA access opens at T-1 Day 9:00 AM local
- [ ] Task filtering by assigned location
- [ ] Dependency gate enforcement (EFC blocks downstream systems)
- [ ] WiFi structured evidence form

### Phase 4: Analytics Updates

- [ ] WiFi channel deviation dashboard
- [ ] Stadium-by-stadium trending
- [ ] Milestone completion KPIs

---

## Key Data Points for Claude Code

### Task Counts by System

| System | Playbook ID | Location | Task Count |
|--------|-------------|----------|------------|
| Hawk-Eye | PB_HAWKEYE_GD1 | Stadium_Wide | 81 |
| Hawk-Eye | PB_HAWKEYE_GD | Stadium_Wide | 69 |
| IVRS | PB_IVRS_HOME_BOOTH | Home_Booth | 11 |
| IVRS | PB_IVRS_VISITOR_BOOTH | Visitor_Booth | 11 |
| IVRS | PB_IVRS_HOME_FIELD | Home_Field | 20 |
| IVRS | PB_IVRS_VISITOR_FIELD | Visitor_Field | 20 |
| SVS | PB_SVS_HOME_SIDELINE | Home_Sideline | 43 |
| SVS | PB_SVS_VISITOR_SIDELINE | Visitor_Sideline | 43 |
| SVS | PB_SVS_HOME_BOOTH | Home_Booth | 69 |
| SVS | PB_SVS_VISITOR_BOOTH | Visitor_Booth | 69 |
| FTR | PB_FTR | Home_Visitor_Sideline | 63 |
| WiFi | PB_WIFI | Home_Visitor_Sideline | 38 |
| C2P | PB_C2P_HOME | Home_Sideline | 66 |
| C2P | PB_C2P_VISITOR | Visitor_Sideline | 66 |
| EFC | PB_EFC | Stadium_Wide | 32 |
| IR_Tech | PB_IR_TECH | Booth_Stadium_Wide | 39 |
| O2O | PB_O2O | Field | 18 |

### HAT → System Mapping

| HAT Color | Systems | Positions |
|-----------|---------|-----------|
| Blue | IVRS | 4 |
| Gray | FTR, IR_Tech, WiFi | 3 |
| Orange-NFL | C2P | 2 |
| Orange-EFC | EFC | 1 |
| Purple | SVS | 4 |
| VENDOR | Hawk-Eye | 1 |

### Dependency Chain

```
EFC (initiates)
  ├── IVRS (blocked until EFC 2.1-2.5)
  ├── WiFi (blocked until EFC 2.1-2.5)
  └── SVS (blocked until EFC 2.1-2.5)

FTR (network)
  ├── SVS (blocked until FTR 1.4-1.8)
  └── IVRS (blocked until FTR 1.4-1.8)

Hawk-Eye GD-1 (day prior)
  └── Hawk-Eye GD (blocked until GD-1 complete)
```

---

## Sample Claude Code Prompts

### For Schema Update
```
Looking at the EVERGAME_4.0_Playbook_Update_Spec.json, update the playbook 
database schema to add:
1. temporal_start field (string, default "T-6h")
2. location field (string, nullable)
3. wifi_evidence JSONB field for structured WiFi data capture

Show me the migration SQL and the updated model definition.
```

### For Hawk-Eye GD-1 Integration
```
Create the PB_HAWKEYE_GD1 playbook with all 81 tasks from section 
"system_playbook_updates.Hawk_Eye.playbooks[0]" in the spec. 

Include:
- Sequential dependencies between sections
- Evidence capture requirements
- Equity-critical task flags
- Conditional tasks for A-Games only
```

### For WiFi Evidence Structure
```
Implement the WiFi structured evidence capture from the spec including:
1. dBm reading form with 11 yardline points
2. Roaming test handoff yardline capture
3. Channel deviation log with timestamp and reason
4. Antenna angle recording

The evidence should validate dBm values (alert if below -80) and track 
deviation count for service analysis.
```

---

## Validation Checklist

After implementation, verify:

- [ ] Hawk-Eye GDA sees tasks at T-1 Day 9:00 AM local
- [ ] IVRS GDA assigned to "Home Booth" only sees Home Booth tasks
- [ ] SVS GDA assigned to "Visitor Sideline" only sees Visitor Sideline tasks
- [ ] WiFi task evidence form captures dBm in structured format
- [ ] WiFi channel deviation is logged with timestamp
- [ ] EFC completion unblocks IVRS/WiFi/SVS tasks
- [ ] FTR network tasks unblock SVS/IVRS
- [ ] Milestone M1 shows Hawk-Eye GD-1 tasks only
- [ ] Dashboard task count matches 509 (unique) + location instances

---

## Support

If Claude Code needs clarification on any specification details, reference:
- `EVERGAME_4.0_Playbook_Update_Spec.json` for complete data structures
- `NFL_GDA_Source_Truth_Analysis_Report.md` for business context
- `NFL_GDA_Source_Truth_Analysis_Matrix.xlsx` for cross-reference data
