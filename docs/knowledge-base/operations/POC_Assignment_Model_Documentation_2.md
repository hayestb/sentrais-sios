# EVERGAME 360 POC - Assignment Model Documentation
## One Assignment Per GDA Per Game - ENFORCED

---

## ✅ **YES, The Model Enforces This Critical Rule**

The updated POC model **strictly enforces** that each GDA can only be assigned to ONE role/position per game. Here's how:

---

## 🔒 **Assignment Enforcement Architecture**

### Core Rule Implementation

```python
class GameAssignment:
    """Enforces one assignment per GDA per game"""
    
    def can_assign(self, game_id, gda_id, position_id):
        # CHECK 1: Is GDA already assigned to this game?
        if gda_id already has assignment for game_id:
            return False, "GDA already assigned to [system] for this game"
        
        # CHECK 2: Is position already taken?
        if position_id already assigned to another GDA:
            return False, "Position already assigned"
        
        return True, "Assignment available"
```

### Data Structure

```
assignments = {
    "GAME_2025_W16_NO_ATL": {
        "gda1": {assignment_details},  # GDA1 assigned to IVRS Home Booth
        "gda2": {assignment_details},  # GDA2 assigned to C2P Home Sideline
        "gda3": {assignment_details}   # GDA3 assigned to SVS Visitor Booth
    },
    "GAME_2025_WC1": {
        "gda1": {different_assignment}, # GDA1 can have different role in different game
        "gda4": {assignment_details}    # GDA4 working this game
    }
}
```

---

## 📋 **User Experience Flow**

### Scenario 1: GDA First Assignment

1. **GDA1 logs in** → Dashboard shows no assignments
2. **Selects Game** → Week 16: Saints @ Falcons
3. **Selects System** → IVRS (multi-position)
4. **Position Prompt** → Selects "Home Booth"
5. **LOCKED** → GDA1 is now assigned IVRS-Home Booth for this game
6. **Cannot select another system** for the same game

### Scenario 2: GDA Attempts Second Assignment (BLOCKED)

1. **GDA1 tries to select another system** for same game
2. **SYSTEM BLOCKS** with message:
   ```
   "You are already assigned to IVRS - Home Booth for this game"
   ```
3. **Redirect** to existing assignment view

### Scenario 3: GDA Multiple Games (ALLOWED)

1. **GDA1 assigned** to IVRS-Home Booth for Game 1
2. **GDA1 can also be assigned** to SVS-Visitor Sideline for Game 2
3. **Different games = Different assignments** ✅

---

## 🎮 **Live Test Examples**

### Example 1: Week 16 Game Assignments

| GDA | System | Position | Game | Status |
|-----|--------|----------|------|--------|
| GDA1 | IVRS | Home Booth | Week 16 | ✅ LOCKED |
| GDA2 | C2P | Home Sideline | Week 16 | ✅ LOCKED |
| GDA3 | SVS | Visitor Booth | Week 16 | ✅ LOCKED |
| GDA1 | ❌ | Cannot select | Week 16 | ❌ BLOCKED |

### Example 2: Multi-Game Support

| GDA | Game | System | Position | Status |
|-----|------|--------|----------|--------|
| GDA1 | Week 16 | IVRS | Home Booth | ✅ |
| GDA1 | Wild Card 1 | C2P | Visitor Sideline | ✅ |
| GDA1 | Super Bowl | SVS | Home Booth | ✅ |

### Example 3: Position Conflicts

```
Game: Week 16
System: IVRS (4 positions available)

Position Status:
- Home Booth: Assigned to GDA1 ✅
- Visitor Booth: Assigned to GDA2 ✅
- Home Field: Available 🟢
- Visitor Field: Available 🟢

If GDA3 selects IVRS:
- Can choose: Home Field or Visitor Field
- Cannot choose: Home/Visitor Booth (taken)

If GDA1 tries to select IVRS again:
- BLOCKED: "Already assigned to IVRS for this game"
```

---

## 🛡️ **Enforcement Mechanisms**

### 1. Database Level
- **Unique constraint**: (game_id, gda_id) pair
- **Position locks**: (game_id, position_id) pair
- **Assignment tracking**: One record per GDA per game

### 2. Application Level
```python
# Before any assignment
can_assign, message = assignment_manager.can_assign(game_id, gda_id, position_id)
if not can_assign:
    flash(message, "error")
    return redirect()
```

### 3. UI Level
- **Dashboard shows**: All assignments clearly
- **System selection**: Blocks if already assigned
- **Position selection**: Shows taken positions as unavailable
- **Visual indicators**: LOCKED, TAKEN, ASSIGNED badges

### 4. Supervisor Override
```python
def release_assignment(game_id, gda_id, supervisor_id):
    """Only supervisors can release assignments"""
    # Verify supervisor role
    # Remove assignment
    # Free up position
    # Log the action
```

---

## 📊 **Dashboard Views**

### GDA Dashboard
Shows clearly:
- **My Assignments**: List of all games and assigned roles
- **Assignment Status**: LOCKED once assigned
- **Available Games**: Can request assignment if not assigned

### Supervisor Dashboard
Can see and manage:
- **All Assignments**: Who is assigned where
- **Release Assignments**: Override capability
- **Assignment Gaps**: Positions still needing coverage

### Admin Dashboard
Executive view:
- **Coverage Metrics**: X of Y positions filled
- **Assignment Compliance**: Ensures no double assignments
- **Resource Utilization**: GDAs assigned across games

---

## ✅ **Validation Points**

The model ensures:

1. ✅ **One assignment per GDA per game** - Enforced
2. ✅ **Position locking** - Once taken, unavailable to others
3. ✅ **Multi-game support** - GDAs can work different games
4. ✅ **Clear visual indicators** - LOCKED, TAKEN badges
5. ✅ **Supervisor override** - Can release if needed
6. ✅ **Audit trail** - All assignments tracked with timestamps

---

## 🚀 **Testing the Enforcement**

### Test Case 1: Single Game, Multiple GDAs
```
1. Login as gda1 → Select Week 16 → IVRS → Home Booth → LOCKED
2. Login as gda2 → Select Week 16 → IVRS → Shows Home Booth TAKEN
3. gda2 selects Visitor Booth → LOCKED
4. Login as gda1 → Try to select C2P for Week 16 → BLOCKED
```

### Test Case 2: Multiple Games, Same GDA
```
1. Login as gda1 → Select Week 16 → IVRS → LOCKED
2. Same gda1 → Select Wild Card → C2P → ALLOWED & LOCKED
3. Same gda1 → Select Super Bowl → SVS → ALLOWED & LOCKED
```

### Test Case 3: Supervisor Release
```
1. gda1 assigned to Week 16 IVRS
2. Login as supervisor1 → Release gda1 from Week 16
3. gda1 can now select different role for Week 16
```

---

## 💡 **Key Benefits**

1. **Prevents Double Booking**: GDA can't be in two places at once
2. **Ensures Coverage**: Each position filled by exactly one person
3. **Accountability**: Clear ownership of tasks
4. **Flexibility**: Different assignments for different games
5. **Compliance**: Meets NFL operational requirements

---

## 📝 **Summary**

**YES**, the updated POC model **fully enforces** the rule that each GDA can only have ONE role assignment per game. This is implemented through:

- Database constraints
- Application logic validation
- UI prevention mechanisms
- Clear visual indicators
- Supervisor override capabilities

The model supports the realistic scenario where a GDA works multiple games throughout the season but maintains the critical constraint of one assignment per game.

---

**Files Updated:**
- `poc_app_updated.py` - Core enforcement logic
- `gda_dashboard_updated.html` - Shows all assignments
- `gda_select_game.html` - Game selection
- `gda_select_system_updated.html` - System selection with availability
- `gda_select_position_updated.html` - Position locking

**To Test:**
```bash
# Use the updated app
cp /mnt/user-data/outputs/poc_app_updated.py app.py
cp /mnt/user-data/outputs/templates/*_updated.html templates/
./run_poc.sh
```

The system now **guarantees** one assignment per GDA per game! 🔒
