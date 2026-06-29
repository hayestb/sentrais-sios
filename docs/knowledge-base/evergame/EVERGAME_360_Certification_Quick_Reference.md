# EVERGAME 360 - Certification Management Quick Reference
## For NFL Technology Administrators and GDA Supervisors

---

## 🎯 Overview

The EVERGAME 360 Certification Lifecycle Management system ensures that every GDA deployed to a game has current, valid certification for their assigned systems. This quick reference guide provides step-by-step workflows for the most common administrative tasks.

---

## 📋 Quick Reference: Common Tasks

### 1. Adding a New Task to a Playbook

**When to use**: When operational requirements change and a new task must be added to an existing certified playbook.

**Step-by-Step Workflow**:

```
Step 1: Submit Task Addition Request
├─ Required Information:
│  ├─ System ID (e.g., "IVRS", "C2P", "WiFi")
│  ├─ Playbook ID (e.g., "IVRS_HOME_BOOTH")
│  ├─ Task Description (clear, actionable)
│  ├─ NIN Phase (Discover, Diagnose, Design, Deploy, Debrief)
│  ├─ Milestone (M1-M6)
│  ├─ Severity (Low, Medium, High, Critical)
│  ├─ Justification (why is this task needed?)
│  └─ Evidence Requirements (what must be captured?)
│
├─ Who Can Submit: GDA Supervisor or NFL Technology Lead
└─ Where: EVERGAME 360 Admin Portal → Playbook Management → Add Task

Step 2: AI Automatic Analysis (Happens in <60 seconds)
├─ Claude AI Performs:
│  ├─ Identifies which certification modules are affected
│  ├─ Assesses training gap for currently certified GDAs
│  ├─ Calculates re-certification scope:
│  │  ├─ Delta Training (15-30 min micro-module)
│  │  ├─ Full Recertification (4-8 hours)
│  │  └─ Documentation Only (no training)
│  ├─ Estimates implementation timeline
│  └─ Generates risk assessment
│
└─ Output: Certification Impact Report (auto-generated PDF)

Step 3: Stakeholder Approval
├─ Required Approvers:
│  ├─ NFL Football Technology Director (always required)
│  ├─ System Subject Matter Expert (always required)
│  ├─ Certification Training Manager (always required)
│  └─ Legal/Compliance (if policy-impacting)
│
├─ SLA:
│  ├─ Standard Tasks: 5 business days
│  └─ Urgent Tasks: 2 business days
│
└─ Approval Action: Approve | Request Changes | Reject

Step 4: Certification Update Execution
├─ Three Possible Outcomes:
│
│  Outcome A: New Task Added to Existing Certified Playbook
│  ├─ Impact: DELTA TRAINING REQUIRED
│  ├─ Action: Create 15-30 minute micro-learning module
│  ├─ Deployment: Push notification to all affected GDAs
│  └─ Deadline: Complete before next game assignment
│
│  Outcome B: New Task Modifies Critical System Operation
│  ├─ Impact: FULL RECERTIFICATION REQUIRED
│  ├─ Action: Schedule full 4-8 hour re-certification training
│  ├─ Deployment: Mandatory completion before ANY game
│  └─ Enforcement: System blocks assignment until certified
│
│  Outcome C: New Task is Procedural Enhancement Only
│  ├─ Impact: DOCUMENTATION UPDATE ONLY
│  ├─ Action: Update playbook documentation
│  ├─ Deployment: Email notification with updated playbook
│  └─ Training: None required
│
└─ Playbook Version Increment: MAJOR.MINOR.PATCH

Step 5: Deployment and Validation
├─ Deployment Gates (all must pass):
│  ├─ ✅ All affected GDAs complete required training
│  ├─ ✅ System integration testing passes
│  ├─ ✅ Pilot execution at 1 game with post-game review
│  └─ ✅ NFL Technology Director final approval
│
└─ Go-Live: Task activated in production playbooks
```

---

### 2. Modifying an Existing Task

**When to use**: When an existing task needs to be updated (changed description, severity, evidence requirements, etc.)

**Step-by-Step Workflow**:

```
Step 1: Submit Task Modification Request
├─ Required Information:
│  ├─ Task ID (unique identifier of task to modify)
│  ├─ Current Task Definition (what it is now)
│  ├─ Proposed Changes (what you want to change)
│  ├─ Justification (why the change is needed)
│  ├─ Safety Impact Assessment (does this affect safety?)
│  └─ Compliance Impact Assessment (does this affect compliance?)
│
└─ Who Can Submit: GDA Supervisor, System SME, or NFL Technology Lead

Step 2: AI-Powered Change Impact Analysis
├─ Claude AI Performs Differential Analysis:
│  ├─ Compares current vs proposed task definitions
│  ├─ Identifies downstream task dependencies affected
│  ├─ Assesses certification module impacts
│  ├─ Calculates risk delta (safety, compliance, performance)
│  └─ Determines training requirement
│
└─ Output: Change Impact Assessment Report

Step 3: Stakeholder Approval (Risk-Based)
├─ Approval Matrix (who must approve):
│
│  Minor Change (e.g., typo fix, clarification):
│  └─ System SME approval only
│
│  Moderate Change (e.g., add evidence field):
│  ├─ System SME
│  └─ Certification Manager
│
│  Major Change (e.g., change critical procedure):
│  ├─ System SME
│  ├─ Certification Manager
│  └─ NFL Technology Director
│
│  Safety-Impacting Change:
│  ├─ All above +
│  └─ NFL Safety Officer
│
│  Compliance-Impacting Change:
│  ├─ All above +
│  └─ Legal/Compliance
│
└─ SLA: 3-7 business days based on change severity

Step 4: Execute Certification Update
└─ (Same process as "Add New Task" Step 4-5)
```

---

### 3. Deleting an Obsolete Task

**When to use**: When a task is no longer required (equipment retired, process changed, etc.)

**⚠️ IMPORTANT**: Task deletion requires MORE scrutiny than addition due to potential compliance/safety implications.

**Step-by-Step Workflow**:

```
Step 1: Submit Task Deletion Request
├─ Required Information:
│  ├─ Task ID (which task to delete)
│  ├─ Deletion Justification (why no longer needed)
│  ├─ Replacement Task ID (if applicable - what replaces it?)
│  ├─ Compliance Verification (confirm no policy requires this)
│  └─ Safety Verification (confirm no safety requirement needs this)
│
└─ Who Can Submit: NFL Technology Lead or System SME ONLY

Step 2: AI-Powered Dependency and Risk Analysis
├─ Claude AI Analyzes:
│  ├─ Identifies all tasks that depend on this task
│  ├─ Checks for policy/compliance mandates requiring it
│  ├─ Assesses safety implications of removal
│  ├─ Generates risk mitigation recommendations
│  └─ Proposes workflow adjustments for dependent tasks
│
└─ Output: Task Deletion Impact Report with GO/NO-GO recommendation

Step 3: Mandatory Stakeholder Review (STRICT)
├─ Required Approvers (ALL must approve):
│  ├─ System SME
│  ├─ NFL Technology Director
│  ├─ Certification Manager
│  ├─ Legal/Compliance (must verify no policy violation)
│  └─ Safety Officer (if task has any safety components)
│
└─ SLA: 7 business days (deletion requires extra scrutiny)

Step 4: Execute Deletion
├─ Process:
│  ├─ Archive task with full history (never truly delete)
│  ├─ Update certification modules to remove obsolete content
│  ├─ Notify all certified GDAs of playbook change
│  ├─ Update system documentation
│  └─ Increment playbook version (MAJOR if critical, MINOR if routine)
│
└─ Training Impact: Usually DOCUMENTATION_UPDATE_ONLY
                    unless task was core competency
```

---

## 🔐 Certification Status Management

### Checking GDA Certification Status

**Dashboard Location**: IT Operations Center → Certification Control Center

```
View Options:
├─ By GDA (individual certification record)
├─ By System (all GDAs certified for specific system)
├─ By Expiration Date (upcoming expirations)
└─ By Compliance Status (Active | Expiring Soon | Expired)

GDA Certification Record Shows:
├─ GDA Name and ID
├─ All System Certifications (e.g., IVRS, C2P, WiFi)
├─ All Playbook Certifications (e.g., IVRS_HOME_BOOTH)
├─ Certification Date (when earned)
├─ Expiration Date (when expires)
├─ Delta Training Completed (recent micro-modules)
├─ Pending Recertification (what's required)
└─ Certification Status:
   ├─ ✅ ACTIVE - Can be assigned to games
   ├─ ⚠️ EXPIRING SOON - Reminder sent, action needed
   └─ 🔴 EXPIRED - BLOCKED from game assignments
```

---

### Automated Certification Enforcement

**System Rules** (Enforced Automatically):

```
Rule 1: Assignment Blocking
├─ A GDA CANNOT be assigned to a game unless:
│  ├─ They have ACTIVE certification for ALL required systems
│  └─ All certifications are current (not expired)
│
└─ Enforcement: Scheduling system auto-blocks assignment

Rule 2: Expiration Reminders (Automated)
├─ Email GDA at:
│  ├─ 30 days before expiration
│  ├─ 14 days before expiration
│  └─ 7 days before expiration
│
└─ Supervisor Alert: If GDA assigned to game has expiring cert

Rule 3: Post-Expiration Actions
├─ GDA status changes to EXPIRED
├─ System auto-removes GDA from future game assignments
├─ Supervisor receives alert to schedule recertification
└─ GDA blocked from assignments until recertified
```

---

## 📊 Executive Visibility

### Where Certification Data Appears in Executive Dashboards

**NFL Executive Command Center**:
```
Widget: Resource Optimization Analytics
└─ Shows: GDA certification compliance rate league-wide
   ├─ Target: 100% compliance
   ├─ Current: 98.9% (example)
   └─ Drill-Down: Click to see which GDAs need attention
```

**IT Operations Center**:
```
Display 3 → Panel 3: Certification Control Center
└─ Shows: Real-time certification tracking
   ├─ Active Certifications: 1,847
   ├─ Expiring in 30 Days: 23 ⚠️
   ├─ Expiring in 14 Days: 8 🔴
   ├─ Expired (Last 7 Days): 2 🚫
   └─ Training In Progress: 14
   
Actions Available:
├─ [Send Reminder] to specific GDA
├─ [Schedule Training] via training portal
├─ [Suspend GDA] from assignments temporarily
└─ [View Training History] for audit purposes
```

---

## 🚨 Emergency Scenarios

### Scenario 1: Game Day - Discover GDA Has Expired Certification

**Problem**: GDA shows up to game, system flags expired certification

**Immediate Actions**:
```
Step 1: System Blocks GDA Clock-In
├─ Display Error: "Certification expired. Cannot proceed."
└─ Alert: Supervisor receives immediate notification

Step 2: Supervisor Options:
Option A: Deploy Backup GDA
├─ Reassign to certified backup GDA
└─ Original GDA sent home, scheduled for recertification

Option B: Emergency Override (RARE - requires CTO approval)
├─ Supervisor requests emergency override
├─ CTO receives push notification with context
├─ If approved: Temporary 1-game waiver issued
├─ Post-game: Mandatory recertification required
└─ Audit log: Override recorded with full justification

Step 3: Root Cause Analysis
├─ Why did this GDA get assigned despite expired cert?
├─ System review: Was there a scheduling bypass?
└─ Process improvement: Prevent recurrence
```

---

### Scenario 2: Mass Recertification After Major System Change

**Problem**: Major equipment upgrade requires all GDAs to be recertified

**Management Process**:
```
Step 1: Identify Affected GDAs
├─ Run report: All GDAs certified on System X
├─ Result: 234 GDAs require recertification
└─ Timeline: Must complete before Week 1 of season

Step 2: Bulk Training Deployment
├─ Create recertification course (4-8 hours)
├─ Schedule multiple training sessions:
│  ├─ In-person sessions at NFL facilities
│  ├─ Virtual sessions for remote GDAs
│  └─ Self-paced online modules (with proctored exam)
│
└─ Push notifications to all 234 GDAs with deadlines

Step 3: Track Completion in Real-Time
├─ Dashboard shows:
│  ├─ Completed: 187/234 (80%)
│  ├─ In Progress: 32/234 (14%)
│  ├─ Not Started: 15/234 (6%) ⚠️
│  └─ Deadline: 12 days remaining
│
└─ Auto-escalate: GDAs with <7 days and not started

Step 4: Enforcement
├─ Deadline passes:
│  ├─ Completed GDAs: Status → ACTIVE (can be assigned)
│  └─ Incomplete GDAs: Status → SUSPENDED (blocked from games)
│
└─ Supervisor actions: Schedule makeup sessions for suspended GDAs
```

---

## 📞 Support Contacts

**For Certification Questions**:
- Certification Training Manager
- Phone: [Contact Number]
- Email: certification@nfl.com

**For Technical System Issues**:
- NFL IT Operations Center
- Phone: [NOC Number]
- Email: itops@nfl.com

**For Emergency Override Requests**:
- NFL CTO Office
- Phone: [Emergency Number]
- Email: cto@nfl.com

---

## 📚 Additional Resources

**Training Portal**: https://training.nfl.com/evergame360
**Documentation Library**: https://docs.nfl.com/evergame360
**System Status Page**: https://status.nfl.com/evergame360
**Submit Support Ticket**: https://support.nfl.com/evergame360

---

*Last Updated: 2025-01-17*
*Version: 1.0*
*System: EVERGAME 360 Enhanced Playbook v5.0*
