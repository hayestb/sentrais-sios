# EVERGAME Multi-Role GDA System - User Guide

## 🎯 System Overview

The EVERGAME Multi-Role GDA System is a comprehensive game day operations platform that serves three distinct user types:

1. **NFL Lead** - Executive management, user administration, system certification
2. **GDA (Game Day Administrator)** - Field-level system operators with assigned tasks
3. **WiFi Technician** - Network testing specialists who record signal measurements

## ✨ Key Features by Role

### NFL Lead Dashboard
- **Overview Tab**: Real-time game readiness across all systems
- **Users Tab**: Add, edit, and manage GDAs and technicians
- **Assignments Tab**: Assign users to specific systems and positions for each game
- **Tasks Tab**: View and manage the master task list
- **Certification Tab**: Certify systems as ready for kickoff

### GDA Dashboard
- **My Assignments**: View assigned systems and positions
- **My Tasks**: See only tasks relevant to your assignments
- **Completion Tracking**: Mark tasks complete and track progress
- **Dependency Resolution**: Tasks automatically unblock when dependencies complete

### WiFi Technician Dashboard
- **Signal Testing Interface**: Record dBm measurements for each field location
- **Quality Indicators**: Visual feedback on signal strength (good/marginal/poor)
- **Test Results Documentation**: Compliance-ready test result records
- **Task Auto-Completion**: Tasks complete automatically when test results are acceptable

## 🚀 Quick Start Guide

### 1. Open the Application
Simply double-click `evergame-multirole-system.html` or open it in your browser.

### 2. Select Your Role
On the login screen, click on your user profile to access your dashboard.

**Available Demo Users:**
- John Smith (NFL Lead)
- Sarah Johnson (GDA - Blue Hat)
- Mike Chen (GDA - Blue Hat)
- David Rodriguez (Vendor Admin - Gray Hat)
- Emily Watson (WiFi Technician - Gray Hat)

## 📋 Detailed Walkthrough

### For NFL Leads

#### **Overview Tab**
The overview provides executive-level visibility:
- **Overall Readiness Percentage**: Aggregate completion across all systems
- **Time to Kickoff**: Live countdown synchronized to game clock
- **System Status Grid**: Individual system completion percentages with visual health indicators
- **Quick Stats**: Active assignments, GDA count, critical systems ready

#### **Managing Users**
1. Navigate to **Users** tab
2. Click **+ Add User** to create new accounts
3. Specify:
   - Name and email
   - Role (GDA, Vendor Admin, WiFi Tech, etc.)
   - Hat Color (Blue for NFL systems, Gray for vendor systems)
   - Certified Systems (which systems they're qualified to operate)
4. Edit or deactivate users as needed

#### **Creating Assignments**
1. Navigate to **Assignments** tab
2. Select the game from the dropdown
3. Click **+ Create Assignment**
4. Choose:
   - User (from certified GDAs/technicians)
   - System (IVRS, WiFi, EFC, etc.)
   - Position (Booth, Home Field, Visitor Field, etc.)
5. System automatically filters tasks to show only relevant items for that user

#### **Task Management**
1. Navigate to **Tasks** tab
2. View the complete master task list
3. Filter by system to focus on specific areas
4. Tasks are organized by:
   - System assignment
   - Milestone (M1-M4)
   - Temporal phase (T-5h, T-4h, etc.)
   - Dependencies

#### **System Certification**
1. Navigate to **Certification** tab
2. Review each system's readiness:
   - Completion percentage
   - Tasks completed/total
   - Blocked tasks count
3. When a system reaches 100% completion, click **Certify System**
4. Certification creates an audit trail for compliance

### For GDAs

#### **Viewing Your Assignments**
Your dashboard shows only the systems and positions assigned to you for the current game.

**Example**: If you're assigned to IVRS - Booth position, you'll see:
- IVRS Booth tasks only
- Completion percentage for your specific assignment
- Visual progress indicator

#### **Completing Tasks**
1. Review your task list (automatically filtered to your assignments)
2. Each task shows:
   - Task ID (e.g., IVRS_1.1)
   - Description
   - Status badge (Open, In Progress, Complete, Blocked)
   - Timing phase (T-4h, T-3h, etc.)
   - Milestone (M1, M2, M3, M4)
3. Click **Mark Complete ✓** when task is finished

#### **Understanding Task Dependencies**
Tasks may be blocked by dependencies:
- **Blocked Badge**: Red status indicator
- **Dependency Warning**: Shows which tasks must complete first
- **Auto-Unblocking**: When blocking tasks complete, dependent tasks automatically become available

**Example Dependency Chain**:
```
EFC_1.1 → EFC_1.2 → EFC_1.5
         ↓
      IVRS_1.1 → IVRS_1.2 → IVRS_1.3
```

When EFC_1.5 completes, IVRS_1.1 automatically unblocks!

#### **Monitoring Progress**
- **System Completion Cards**: Shows percentage complete for each assigned system
- **Overall Progress Bar**: Visual indicator of readiness
- **Color Coding**:
  - Green (≥90%): On track
  - Yellow (70-90%): Attention needed
  - Red (<70%): Behind schedule

### For WiFi Technicians

#### **Signal Testing Workflow**
1. Review the test protocol instructions (displayed at top of dashboard)
2. Navigate to **Signal Test Results Entry** section
3. For each test location:
   - Enter the dBm value from your measurement device
   - Add optional notes if needed
   - Click **Submit Result**

#### **Signal Quality Standards**
- **Green (Good)**: ≥ -80 dBm - Meets requirements
- **Yellow (Marginal)**: -82 to -80 dBm - Borderline, monitor
- **Red (Poor)**: < -82 dBm - Fails requirements, investigation needed

#### **Test Result Cards**
Each test location shows:
- Task description (e.g., "Home 6ft Border signal test")
- Position (Home/Visitor)
- Timing phase
- Input field for dBm value
- Real-time quality indicator
- Submit button

#### **Auto-Completion**
When you submit a test result ≥ -80 dBm:
- Task automatically marks as Complete
- Timestamp and value are recorded for compliance
- Result appears in green confirmation box
- Dependent tasks (if any) unblock

#### **Viewing All Tasks**
The "All My Tasks" section shows both:
- Test tasks (require dBm entry)
- Non-test tasks (standard checklist items)

## 🎮 Demonstration Scenarios

### Scenario 1: NFL Lead Certifying a Game

1. Login as **John Smith (NFL Lead)**
2. Select game: **Week 8: Falcons vs Saints**
3. Navigate to **Overview** tab
   - Observe overall readiness at ~35% (EFC partially complete)
   - Note blocked systems (IVRS, WiFi, SVS, IR TECH)
4. Navigate to **Certification** tab
   - See EFC at 80% (4/5 tasks complete)
   - Other systems blocked waiting for EFC
5. Switch to Mike Chen (GDA) to complete EFC tasks
6. Return to John Smith view
7. Watch systems unblock in real-time
8. When systems hit 100%, certify them

### Scenario 2: GDA Completing System Tasks

1. Login as **Mike Chen (GDA - EFC assignment)**
2. View your assignment card:
   - EFC - Main position
   - 80% complete
3. Review task list - see EFC_1.5 "In Progress"
4. Click **Mark Complete ✓** on EFC_1.5
5. Observe cascade effect:
   - Other EFC tasks unblock (EFC_2.1, EFC_2.2)
   - Systems dependent on EFC also unblock
6. Complete remaining EFC tasks in sequence
7. Watch overall completion percentage rise

### Scenario 3: WiFi Testing Protocol

1. Login as **Emily Watson (WiFi Technician)**
2. Read the signal testing protocol at the top
3. Locate first test: **WiFi_1.2 - Home 6ft Border**
4. Enter test result: `-78` dBm
5. See green "Good Signal" indicator
6. Click **Submit Result**
7. Task automatically completes and shows timestamp
8. Repeat for other test locations:
   - Home Bench
   - Visitor 6ft Border
   - Visitor Bench
9. View completed tests in "All My Tasks" section

## 🔄 Temporal Orchestration (Sentrais Framework)

### Game Clock Synchronization
All tasks are synchronized to the kickoff time:

**Milestone Phases:**
- **M1 (T-5h)**: Pre-Game Preparation - EFC scans, initial setup
- **M2 (T-4h)**: System Confirmation - Most systems activate
- **M3 (T-3h)**: Tech Check - Inspections and validations
- **M4 (T-1h)**: Final Readiness - Broadcast and technician readiness

### Time-Gated Activation
Tasks automatically become available based on their timing phase:
- Tasks marked "T-5h" activate 5 hours before kickoff
- Tasks marked "T-4h" activate 4 hours before kickoff
- And so on...

### Countdown Timers
The dashboard displays live countdown timers:
- **Header**: Time until kickoff
- **Milestone Cards** (NFL Lead view): Time until each phase

## 🎨 Design System

### Hat Color Coding
- **Blue Hat**: NFL-owned systems (IVRS, O2O, SVS, C2P, EFC)
- **Gray Hat**: Vendor-owned systems (FTR, IR TECH, WiFi)

### Status Badges
- 🟢 **Complete**: Task finished
- 🟡 **In Progress**: Currently being worked on
- 🔵 **Open**: Available to start
- 🔴 **Blocked**: Dependencies not met
- 🟣 **Needs Test**: Requires WiFi test result entry

### Progress Indicators
- **Green** (≥90%): On track, excellent progress
- **Yellow** (70-90%): Attention needed, monitor closely
- **Red** (<70%): Behind schedule, intervention required

## 📊 System Architecture

### Data Structure
The prototype uses realistic data modeled after your actual spreadsheets:

**Systems** (8 total):
- IVRS (4 positions)
- FTR (1 position)
- IR TECH (1 position)
- O2O (2 positions)
- WiFi (2 positions)
- C2P (2 positions)
- SVS (2 positions)
- EFC (1 position)

**Users** (5 demo users):
- 1 NFL Lead
- 2 GDAs (Blue Hat)
- 1 Vendor Admin (Gray Hat)
- 1 WiFi Technician (Gray Hat)

**Tasks** (~40 tasks across all systems):
- Organized by system and position
- Linked by dependencies
- Synchronized to temporal phases

**Assignments**:
- User → System → Position mapping
- Game-specific assignments
- Multiple assignments per user possible

### Dependency Resolution Engine
When a task is marked complete:
1. System checks all tasks that list this task as a dependency
2. For each dependent task, verify if ALL dependencies are now complete
3. If yes, change status from "Blocked" to "Open"
4. Update UI in real-time
5. Recalculate system completion percentages

**Example**:
```
Task: IVRS_1.1
Dependencies: [EFC_1.1, EFC_1.2, EFC_1.3, EFC_1.4, EFC_1.5]

When EFC_1.5 completes (last dependency):
→ Check all EFC tasks complete: ✓
→ Change IVRS_1.1 from "Blocked" to "Open"
→ GDA can now work on IVRS_1.1
```

## 🔧 Technical Notes

### Browser Compatibility
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+
- ❌ Internet Explorer (not supported)

### No Installation Required
This is a standalone HTML file:
- No backend server needed for demo
- All logic runs in the browser
- Data resets when page refreshes
- Perfect for demonstrations and prototyping

### Production Deployment
For production use, you'll need:
- **Backend API**: FastAPI or similar (see TECHNICAL_SPEC.md)
- **Database**: PostgreSQL for relational data, Neo4j for dependencies
- **Authentication**: Okta SSO integration
- **Real-time Updates**: WebSocket connections
- **Mobile Apps**: Native iOS/Android apps

## 📈 Key Metrics & Reporting

### For NFL Leads
Monitor these key metrics:
- **Overall Readiness Percentage**: Target 100% by T-1h
- **Systems Certified**: Track which systems are game-ready
- **Blocked Tasks**: Identify bottlenecks
- **Critical Systems Status**: IVRS, EFC, C2P, WiFi must be green

### For GDAs
Track your performance:
- **Task Completion Rate**: Your percentage complete
- **On-Time Performance**: Tasks completed within timing windows
- **Dependency Impact**: How many tasks you've unblocked for others

### For WiFi Technicians
Quality metrics:
- **Signal Strength Averages**: Mean dBm across all test locations
- **Test Coverage**: Percentage of locations tested
- **Failure Rate**: How many locations failed initial test

## 🆘 Troubleshooting

### "I don't see my tasks"
**Check**:
- Are you logged in as the correct user?
- Do you have assignments for the selected game?
- Is your system/position assigned in the Assignments tab?

### "Tasks won't unblock"
**Check**:
- Are ALL dependency tasks complete?
- Look at the "Blocked by" message - which tasks are still pending?
- Have those tasks been assigned to someone?

### "Can't certify a system"
**Requirements**:
- System must be 100% complete
- All tasks must show "Complete" status
- No blocked tasks can remain

### "Test results won't submit"
**Check**:
- Did you enter a numeric dBm value?
- Is the value in valid range (typically -100 to -40)?
- Click the "Submit Result" button (task doesn't auto-complete)

## 🎓 Best Practices

### For NFL Leads
1. **Pre-Game Setup**:
   - Verify all assignments are created 24h before game
   - Confirm all GDAs are certified for their assigned systems
   - Review critical dependency chains (EFC gates everything)

2. **During Game Day**:
   - Monitor overall readiness percentage
   - Watch for blocked tasks accumulating
   - Intervene if systems fall below 70% at T-4h
   - Certify systems progressively (don't wait until T-1h)

3. **Post-Game**:
   - Review completion times vs. target times
   - Identify which tasks consistently cause delays
   - Update task list or dependencies as needed

### For GDAs
1. **Start of Shift**:
   - Review all assigned tasks
   - Note timing phases (when tasks activate)
   - Identify critical dependencies
   - Plan your workflow to minimize blocking others

2. **During Execution**:
   - Mark tasks complete promptly
   - If a task is delayed, notify NFL Lead
   - Monitor for tasks that unblock when you complete yours
   - Work tasks in dependency order (don't skip ahead)

3. **Communication**:
   - Use WhatsApp groups for real-time coordination
   - Post photos/evidence as required by tasks
   - Report issues that prevent task completion

### For WiFi Technicians
1. **Test Preparation**:
   - Calibrate equipment before starting
   - Follow the standard Anritsu settings (see EFC_1.2 notes)
   - Plan route through field to test efficiently

2. **Recording Results**:
   - Enter exact dBm value measured (don't round)
   - Add notes for marginal readings (-82 to -80)
   - If test fails, retest after troubleshooting

3. **Quality Assurance**:
   - All readings should be ≥ -80 dBm
   - If multiple locations fail, escalate to NFL Lead
   - Document environmental factors (weather, crowd, etc.)

## 🔮 Future Enhancements

This prototype demonstrates core functionality. Production version will include:

### Advanced Features
- [ ] Photo/video evidence upload for task completion
- [ ] Automated WhatsApp notifications
- [ ] Predictive analytics (ML models for delay prediction)
- [ ] Voice commands for hands-free operation
- [ ] Offline mode with sync when connectivity returns

### Integration Points
- [ ] Okta SSO for enterprise authentication
- [ ] NFL venue systems APIs (IVRS, C2P, etc.)
- [ ] UKG time tracking integration
- [ ] Calendar integration for game schedules
- [ ] Slack commands for task management

### Mobile Experience
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Push notifications for task assignments
- [ ] QR code scanning for equipment verification

### Reporting & Analytics
- [ ] After-action report generation
- [ ] Benchmarking across stadiums
- [ ] GDA performance dashboards
- [ ] Compliance audit trails
- [ ] Export to Excel/PDF

## 📞 Support & Feedback

### Questions?
- **Framework**: Review EVERGAME NFL Unified Playbook
- **Technical Details**: See Technical Specification document
- **Data Structure**: Reference MVPv2 Core Schema PDF

### Feedback Welcome
This prototype is designed for demonstration and requirements validation. Your feedback helps refine:
- Missing features or task types
- UI/UX improvements
- Role-specific needs
- Integration requirements
- Mobile workflow considerations

---

## 🎉 Ready to Demo!

**Quick Demo Checklist:**
- [ ] Open `evergame-multirole-system.html` in browser
- [ ] Login as NFL Lead (John Smith) - explore overview
- [ ] Switch to GDA (Mike Chen) - complete EFC_1.5
- [ ] Watch dependency cascade unblock systems
- [ ] Switch to WiFi Tech (Emily Watson) - submit test results
- [ ] Return to NFL Lead - certify a system

**Demonstration Goals:**
✓ Show role-based access control  
✓ Demonstrate temporal orchestration  
✓ Prove dependency resolution works  
✓ Highlight compliance/certification workflow  
✓ Validate realistic data structure  
✓ Confirm user management capabilities  

---

**Built with EVERGAME Sentrais Framework**  
Transforming NFL game day operations through intelligent orchestration

© 2025 NOVATELabs - Operational Intelligence Systems
