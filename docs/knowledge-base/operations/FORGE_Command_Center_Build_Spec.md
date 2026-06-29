# SENTRAIS — FORGE Command Center
## Lovable Build Specification + GCP Backend Architecture

**Classification:** RESTRICTED — Internal Engineering Only
**Version:** 1.0
**Date:** February 8, 2026
**Target Platform:** Lovable → Firebase Hosting (forge.sentrais.com)
**GCP Project:** sentrais-forge-core

---

# 1. PRODUCT VISION

## 1.1 What This Is

The FORGE Command Center is Sentrais' internal operating hub — the system the team lives in every day to plan, execute, track, escalate, and report across every active engagement. Think of it as "our internal EVERGAME" — the same operational discipline we deliver to the NFL, applied to ourselves.

It replaces: scattered Slack threads for status, Google Sheets for tracking, email chains for escalations, manual meeting prep, and disconnected tools that force people to context-switch.

## 1.2 What It Replaces

| Today (Fragmented) | FORGE Command Center |
|---|---|
| Slack for status updates | Structured daily check-ins with evidence |
| Google Sheets for milestone tracking | Live milestone timeline with auto-alerts |
| Email chains for escalations | Formal escalation workflow with SLA timers |
| Manual report preparation | Auto-generated executive briefings from live data |
| Separate calendar for deadlines | Integrated critical path with countdown clocks |
| Ad hoc risk conversations | Signal Library with threshold-based early warning |
| No unified view of portfolio health | Real-time portfolio dashboard with drill-down |
| Meeting notes lost in docs | Structured decision log tied to Evidence Ledger |

## 1.3 Design Principles

1. **Role-relative by default.** Every person sees what matters to their function first.
2. **Milestone-driven, not activity-driven.** The system tracks outcomes and gates, not busy work.
3. **Escalation is a workflow, not a message.** Formal paths with SLAs, not "hey can you look at this."
4. **Evidence-first.** Every status, decision, and claim links to the Evidence Ledger.
5. **Deloitte-grade presentation, startup-grade speed.** Looks like it cost $2M. Moves like it was built yesterday.
6. **Dark mode, Deep Navy.** Sentrais brand identity. No exceptions.

---

# 2. TECHNICAL ARCHITECTURE

## 2.1 Stack

```
┌─────────────────────────────────────────────────────────┐
│  FORGE Command Center (forge.sentrais.com)              │
│  React + TypeScript + Tailwind + shadcn/ui              │
│  Built in Lovable → deployed to Firebase Hosting        │
├─────────────────────────────────────────────────────────┤
│  Firebase Auth (Google Workspace SSO)                   │
│  Firestore (real-time database)                         │
│  Cloud Functions v2 (Node.js 20 — API layer)            │
│  Cloud Storage (file attachments, exports)              │
├─────────────────────────────────────────────────────────┤
│  BigQuery (Evidence Ledger reads, analytics)            │
│  n8n Cloud (automation, notifications, syncs)           │
│  Claude API (AI summaries, risk analysis, drafts)       │
│  Gemini API (data processing, pattern recognition)      │
├─────────────────────────────────────────────────────────┤
│  GCP Project: sentrais-forge-core                       │
│  Hosting: Firebase Hosting + Cloud CDN                  │
│  Security: Cloud Armor WAF + VPC SC                     │
└─────────────────────────────────────────────────────────┘
```

## 2.2 Why Lovable

Lovable generates production React + TypeScript + Tailwind + shadcn/ui. Key advantages for this build:

- Native Supabase integration pattern maps cleanly to Firebase (same React hooks pattern).
- shadcn/ui gives us the component library without building from scratch.
- Tailwind utility classes enforce the Deep Navy design system consistently.
- Lovable handles responsive layout, routing, and state management scaffolding.
- Output is standard React — we own the code, deploy where we want.
- Speed: 80% of the UI can be generated from detailed prompts, then hand-tuned.

## 2.3 Lovable Project Configuration

```
Project Name: forge-command-center
Framework: React + TypeScript + Vite
Styling: Tailwind CSS
Component Library: shadcn/ui
Router: React Router v6
State: React Query (TanStack) + Context
Auth: Firebase Auth (custom hook)
Database: Firestore (firebase/firestore)
```

### Tailwind Theme Override (tailwind.config.ts)

```typescript
// sentrais-forge-core design tokens
const config = {
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          light: '#0F1E36',
          mid: '#142844',
        },
        ocean: {
          DEFAULT: '#1A5276',
          light: '#2471A3',
        },
        teal: {
          DEFAULT: '#148F77',
          light: '#1ABC9C',
        },
        citrus: {
          DEFAULT: '#F39C12',
          light: '#F5B041',
        },
        sentrais: {
          red: '#C0392B',
          green: '#27AE60',
          amber: '#D4AC0D',
          dim: '#8899AA',
          card: 'rgba(15,30,54,0.6)',
          border: 'rgba(26,82,118,0.3)',
        },
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      backgroundImage: {
        'forge-gradient': 'linear-gradient(165deg, #0A1628 0%, #060D18 50%, #0A1225 100%)',
      },
    },
  },
};
```

---

# 3. FIRESTORE DATA MODEL

## 3.1 Collection Architecture

```
firestore/
├── users/{uid}
│   ├── displayName: string
│   ├── email: string
│   ├── role: "founder" | "cro" | "pmo" | "cto" | "ciso" | "admin" | "lead" | "delivery"
│   ├── assignedEngagements: string[]     // engagement IDs
│   ├── certificationLevel: "practitioner" | "lead" | "architect"
│   ├── avatarUrl: string
│   ├── preferences: { defaultView, notifications, timezone }
│   └── lastActive: timestamp
│
├── engagements/{engagementId}
│   ├── name: string                      // "NFL EVERGAME Phase II"
│   ├── client: string                    // "NFL"
│   ├── engagementCode: string            // "NFL-EG-001"
│   ├── status: "active" | "on-hold" | "at-risk" | "completed"
│   ├── currentPhase: 1-5                 // NIN phase number
│   ├── phaseName: string                 // "Design"
│   ├── phaseStartDate: timestamp
│   ├── phaseMaxDays: number
│   ├── nextGateDate: timestamp
│   ├── leadUid: string                   // engagement lead user ID
│   ├── teamUids: string[]                // all assigned team members
│   ├── revenue: number                   // total contract value
│   ├── margin: number                    // target margin %
│   ├── resilienceScore: number           // 0-100 (80% gate)
│   ├── resilienceDimensions: {
│   │   governance: number,               // 1-5
│   │   people: number,
│   │   process: number,
│   │   technology: number,
│   │   data: number
│   │ }
│   ├── churnRiskScore: number            // CRS formula output
│   ├── riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
│   ├── healthScore: number               // 0-100 composite
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   │
│   ├── /milestones/{milestoneId}
│   │   ├── title: string
│   │   ├── dueDate: timestamp
│   │   ├── priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
│   │   ├── status: "upcoming" | "on-track" | "at-risk" | "overdue" | "completed"
│   │   ├── ownerUid: string
│   │   ├── phase: number
│   │   ├── completedAt: timestamp | null
│   │   ├── evidence: string[]            // Evidence Ledger entry IDs
│   │   └── dependencies: string[]        // other milestone IDs
│   │
│   ├── /signals/{signalId}
│   │   ├── signalName: string            // "Stakeholder Alignment Index"
│   │   ├── currentValue: number
│   │   ├── threshold: number
│   │   ├── direction: "above" | "below"  // breach when above/below threshold
│   │   ├── weight: number                // 0-1
│   │   ├── status: "HEALTHY" | "WARNING" | "BREACH"
│   │   ├── severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
│   │   ├── lastUpdated: timestamp
│   │   ├── trend: number[]               // last 10 readings
│   │   └── mitigationId: string | null   // linked mitigation strategy
│   │
│   ├── /tasks/{taskId}
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── assigneeUid: string
│   │   ├── status: "backlog" | "in-progress" | "blocked" | "review" | "done"
│   │   ├── priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
│   │   ├── dueDate: timestamp
│   │   ├── milestoneId: string | null    // linked milestone
│   │   ├── blockerReason: string | null
│   │   ├── phase: number
│   │   ├── createdAt: timestamp
│   │   └── completedAt: timestamp | null
│   │
│   ├── /checkins/{checkinId}
│   │   ├── authorUid: string
│   │   ├── date: timestamp
│   │   ├── type: "daily" | "weekly" | "gate-review" | "escalation-update"
│   │   ├── summary: string               // what happened
│   │   ├── blockers: string[]            // free text
│   │   ├── nextSteps: string[]           // free text
│   │   ├── sentiment: "green" | "amber" | "red"
│   │   ├── attachments: string[]         // Cloud Storage paths
│   │   └── aiSummary: string | null      // Claude-generated digest
│   │
│   ├── /decisions/{decisionId}
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── decidedBy: string             // uid
│   │   ├── date: timestamp
│   │   ├── phase: number
│   │   ├── impact: "LOW" | "MEDIUM" | "HIGH"
│   │   ├── rationale: string
│   │   ├── evidence: string[]            // Evidence Ledger entry IDs
│   │   └── stakeholders: string[]        // uids who were consulted
│   │
│   └── /escalations/{escalationId}
│       ├── title: string
│       ├── description: string
│       ├── raisedBy: string              // uid
│       ├── raisedAt: timestamp
│       ├── severity: "P1" | "P2" | "P3" | "P4"
│       ├── status: "open" | "acknowledged" | "in-progress" | "resolved" | "closed"
│       ├── assignedTo: string            // uid — escalation owner
│       ├── slaDeadline: timestamp        // auto-calculated from severity
│       ├── resolution: string | null
│       ├── resolvedAt: timestamp | null
│       ├── relatedSignals: string[]      // signal IDs that triggered this
│       ├── relatedMilestones: string[]   // milestone IDs affected
│       └── timeline: [{                  // activity log
│           action: string,
│           by: string,
│           at: timestamp,
│           note: string
│         }]
│
├── portfolio/summary                     // single doc, updated by Cloud Function
│   ├── totalRevenue: number
│   ├── avgMargin: number
│   ├── activeEngagements: number
│   ├── highRiskCount: number
│   ├── activeSignalBreaches: number
│   ├── portfolioChurnIndex: number       // weighted avg CRS
│   ├── avgResilience: number
│   ├── totalBlockers: number
│   ├── gatePassRate: number
│   ├── teamUtilization: number
│   ├── pipelineValue: number
│   ├── updatedAt: timestamp
│   └── dailySnapshot: [{                // rolling 30-day history
│       date: string,
│       churnIndex: number,
│       resilience: number,
│       risk: number
│     }]
│
├── pipeline/{opportunityId}
│   ├── name: string                      // "NFL Phase III"
│   ├── client: string
│   ├── estimatedValue: number
│   ├── stage: "qualification" | "discovery" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
│   ├── probability: number               // 0-100
│   ├── ownerUid: string
│   ├── nextAction: string
│   ├── nextActionDate: timestamp
│   └── createdAt: timestamp
│
├── weeklyReports/{reportId}
│   ├── weekOf: timestamp                 // Monday of the reporting week
│   ├── generatedAt: timestamp
│   ├── generatedBy: "system" | uid
│   ├── sections: {
│   │   executiveSummary: string,         // Claude-generated
│   │   portfolioHealth: object,
│   │   engagementSummaries: [{
│   │     engagementId: string,
│   │     summary: string,
│   │     riskItems: string[],
│   │     wins: string[],
│   │     nextWeek: string[]
│   │   }],
│   │   escalationSummary: string,
│   │   resourceHighlights: string,
│   │   recommendations: string[]         // Claude-generated action items
│   │ }
│   ├── status: "draft" | "reviewed" | "published"
│   └── reviewedBy: string | null         // uid
│
├── meetings/{meetingId}
│   ├── title: string                     // "Weekly Portfolio Review"
│   ├── type: "standup" | "portfolio-review" | "gate-review" | "escalation" | "planning" | "retro"
│   ├── scheduledAt: timestamp
│   ├── duration: number                  // minutes
│   ├── engagementId: string | null       // null = cross-engagement
│   ├── attendees: string[]               // uids
│   ├── agenda: string[]
│   ├── status: "scheduled" | "in-progress" | "completed" | "cancelled"
│   ├── notes: string | null              // structured meeting notes
│   ├── decisions: string[]               // decision IDs created during meeting
│   ├── actionItems: [{
│   │   task: string,
│   │   assignee: string,                 // uid
│   │   dueDate: timestamp
│   │ }]
│   └── aiPreBrief: string | null         // Claude-generated pre-meeting context
│
└── notifications/{uid}/items/{notificationId}
    ├── type: "signal-breach" | "milestone-due" | "escalation" | "task-assigned" | "gate-review" | "checkin-due" | "meeting-reminder" | "report-ready"
    ├── title: string
    ├── body: string
    ├── link: string                      // in-app route
    ├── read: boolean
    ├── createdAt: timestamp
    └── engagementId: string | null
```

## 3.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check user role
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isLeadership() {
      return userRole() in ['founder', 'cro', 'pmo'];
    }
    function isInternal() {
      return request.auth != null &&
        request.auth.token.email.matches('.*@sentrais\\.com$|.*@novatelabs\\..*$');
    }
    function isAssigned(engId) {
      return request.auth.uid in
        get(/databases/$(database)/documents/engagements/$(engId)).data.teamUids;
    }

    // Users — self-read, admin-write
    match /users/{uid} {
      allow read: if isInternal();
      allow write: if request.auth.uid == uid || userRole() == 'admin';
    }

    // Engagements — role-based
    match /engagements/{engId} {
      allow read: if isInternal();
      allow write: if isLeadership() || userRole() == 'admin';

      // Subcollections — engagement-scoped
      match /{subcollection}/{docId} {
        allow read: if isInternal();
        allow create: if isAssigned(engId) || isLeadership();
        allow update: if isAssigned(engId) || isLeadership();
        allow delete: if isLeadership();
      }
    }

    // Portfolio summary — leadership read, system write
    match /portfolio/{docId} {
      allow read: if isLeadership() || userRole() in ['cto', 'ciso'];
      allow write: if false; // Cloud Functions only
    }

    // Pipeline — CRO/Founder
    match /pipeline/{docId} {
      allow read: if isLeadership();
      allow write: if userRole() in ['founder', 'cro'];
    }

    // Weekly reports — leadership
    match /weeklyReports/{docId} {
      allow read: if isInternal();
      allow write: if isLeadership();
    }

    // Meetings — all internal
    match /meetings/{docId} {
      allow read: if isInternal();
      allow create: if isInternal();
      allow update: if isInternal();
    }

    // Notifications — user-scoped
    match /notifications/{uid}/items/{notifId} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

# 4. CLOUD FUNCTIONS API

## 4.1 Scheduled Functions (cron)

```typescript
// ═══ DAILY PORTFOLIO ROLLUP ═══
// Runs: Every day at 06:00 UTC (01:00 EST)
// Reads all active engagements, computes portfolio-level KPIs,
// writes to portfolio/summary document
export const dailyPortfolioRollup = onSchedule("every day 06:00", async () => {
  // 1. Query all engagements where status == "active"
  // 2. Compute: totalRevenue, avgMargin, highRiskCount, portfolioChurnIndex,
  //    avgResilience, totalBlockers, gatePassRate, teamUtilization
  // 3. Append to dailySnapshot array (keep 90 days rolling)
  // 4. Write to portfolio/summary
  // 5. If any CRS > 60 → trigger signal breach notifications
});

// ═══ SIGNAL EVALUATION ═══
// Runs: Every 4 hours
// Evaluates all signal thresholds across active engagements
export const evaluateSignals = onSchedule("every 4 hours", async () => {
  // 1. For each active engagement, read all signals
  // 2. Compare currentValue against threshold + direction
  // 3. Update status: HEALTHY / WARNING / BREACH
  // 4. If status changed to BREACH → create notification for lead + PMO + founder
  // 5. If BREACH severity is CRITICAL → auto-create escalation
  // 6. Compute CRS from weighted signals, update engagement.churnRiskScore
});

// ═══ MILESTONE OVERDUE CHECK ═══
// Runs: Every day at 07:00 UTC
export const checkMilestones = onSchedule("every day 07:00", async () => {
  // 1. Query milestones where dueDate <= today AND status != "completed"
  // 2. Mark as "overdue"
  // 3. Notify ownerUid + engagement lead
  // 4. If priority == CRITICAL and overdue > 2 days → auto-escalate to PMO
});

// ═══ WEEKLY REPORT GENERATION ═══
// Runs: Every Friday at 16:00 UTC (11:00 EST)
export const generateWeeklyReport = onSchedule("every fri 16:00", async () => {
  // 1. Collect all check-ins, decisions, escalations from the past 7 days
  // 2. Collect signal changes, milestone completions/misses
  // 3. Call Claude API with structured prompt to generate:
  //    - Executive summary (3-4 sentences)
  //    - Per-engagement summaries with risks, wins, next-week items
  //    - Escalation summary
  //    - Resource highlights
  //    - Recommendations (action items)
  // 4. Write to weeklyReports collection with status: "draft"
  // 5. Notify PMO Director for review
});

// ═══ CHECKIN REMINDERS ═══
// Runs: Every weekday at 08:30 UTC (03:30 EST)
export const sendCheckinReminders = onSchedule("every weekday 08:30", async () => {
  // 1. For each active engagement, check if lead submitted today's check-in
  // 2. If not → push notification to lead
  // 3. If yesterday's check-in was also missing → notify PMO Director
});

// ═══ MEETING PRE-BRIEF ═══
// Runs: Every hour
export const generateMeetingPreBriefs = onSchedule("every 1 hours", async () => {
  // 1. Query meetings where scheduledAt is within next 2 hours AND aiPreBrief == null
  // 2. For each meeting, gather context:
  //    - Engagement status, recent check-ins, open escalations, signal status
  //    - Recent decisions, upcoming milestones
  // 3. Call Claude API to generate pre-brief summary
  // 4. Write aiPreBrief to meeting document
  // 5. Notify attendees: "Pre-brief ready for [meeting name]"
});
```

## 4.2 Triggered Functions (Firestore events)

```typescript
// ═══ ON ESCALATION CREATED ═══
export const onEscalationCreated = onDocumentCreated(
  "engagements/{engId}/escalations/{escId}", async (event) => {
    // 1. Calculate SLA deadline based on severity:
    //    P1: 1 hour acknowledgment, 4 hour resolution target
    //    P2: 4 hours ack, 24 hour resolution
    //    P3: 8 hours ack, 72 hour resolution
    //    P4: 24 hours ack, 1 week resolution
    // 2. Auto-assign based on severity:
    //    P1 → Founder (Tye)
    //    P2 → PMO Director
    //    P3 → Engagement Lead
    //    P4 → Engagement Lead
    // 3. Push notification to assignee + engagement team
    // 4. If P1 → also push to CRO and CTO
    // 5. Start SLA timer in escalation timeline
});

// ═══ ON SIGNAL STATUS CHANGE ═══
export const onSignalUpdate = onDocumentUpdated(
  "engagements/{engId}/signals/{sigId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (before.status !== after.status) {
      // 1. Log status change to Evidence Ledger (BigQuery)
      // 2. If changed to BREACH → look up Mitigation Strategy Library
      // 3. Attach recommended mitigation to signal document
      // 4. Notify engagement lead + PMO
      // 5. If severity CRITICAL → auto-create P2 escalation
    }
});

// ═══ ON CHECKIN SUBMITTED ═══
export const onCheckinCreated = onDocumentCreated(
  "engagements/{engId}/checkins/{ciId}", async (event) => {
    const checkin = event.data.data();
    // 1. Call Claude API to generate aiSummary from checkin content
    // 2. If sentiment == "red" → notify PMO Director
    // 3. If blockers array is non-empty → create tasks for each blocker
    // 4. Update engagement.updatedAt
    // 5. Log to Evidence Ledger
});

// ═══ ON MILESTONE COMPLETED ═══
export const onMilestoneCompleted = onDocumentUpdated(
  "engagements/{engId}/milestones/{msId}", async (event) => {
    const after = event.data.after.data();
    if (after.status === "completed" && after.completedAt) {
      // 1. Check if this was a gate milestone → trigger gate review workflow
      // 2. Update engagement phase if gate passed
      // 3. Recalculate engagement health score
      // 4. Notify team: "Milestone completed: [title]"
      // 5. Log to Evidence Ledger
    }
});

// ═══ ON TASK STATUS CHANGE ═══
export const onTaskUpdate = onDocumentUpdated(
  "engagements/{engId}/tasks/{taskId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (after.status === "blocked" && before.status !== "blocked") {
      // 1. Notify engagement lead
      // 2. If task is linked to CRITICAL milestone → escalate to PMO
      // 3. Update engagement blocker count
    }
});
```

## 4.3 Callable Functions (HTTPS — invoked by frontend)

```typescript
// ═══ SUBMIT DAILY CHECK-IN ═══
export const submitCheckin = onCall(async (request) => {
  // Validates auth, creates checkin doc, triggers onCheckinCreated
});

// ═══ CREATE ESCALATION ═══
export const createEscalation = onCall(async (request) => {
  // Validates auth + role, creates escalation, triggers onEscalationCreated
});

// ═══ GENERATE AI REPORT ═══
export const generateReport = onCall(async (request) => {
  // Takes: engagementId, reportType (status / gate-review / risk-assessment)
  // Gathers context from Firestore
  // Calls Claude API with structured prompt
  // Returns formatted report content
  // Optionally saves to weeklyReports or Evidence Ledger
});

// ═══ RUN SCENARIO SIMULATION ═══
export const runSimulation = onCall(async (request) => {
  // Takes: engagementId, scenario parameters
  // Calls Vertex AI Monte Carlo pipeline
  // Returns probability distributions
  // Restricted to: founder, cro, pmo roles
});

// ═══ EXPORT WEEKLY REPORT TO DOCX ═══
export const exportReport = onCall(async (request) => {
  // Takes: reportId
  // Uses docx-js to generate branded Word document
  // Uploads to Cloud Storage
  // Returns download URL
});

// ═══ SEARCH EVIDENCE LEDGER ═══
export const searchEvidence = onCall(async (request) => {
  // Takes: query string, engagementId (optional), dateRange
  // Queries BigQuery Evidence Ledger
  // Returns formatted results
});
```

---

# 5. n8n AUTOMATION WORKFLOWS

## 5.1 Notification Routing

```
Trigger: Firestore notification created
→ Check user preferences (email, Slack, both)
→ If Slack: POST to Sentrais Slack workspace via webhook
   Channel routing:
     #forge-alerts       → P1/P2 escalations, CRITICAL signal breaches
     #forge-status        → daily check-in summaries, milestone completions
     #forge-leadership    → portfolio KPI changes, weekly report published
     DM to individual     → task assignments, check-in reminders
→ If email: send via SendGrid with Sentrais template
→ Log delivery status
```

## 5.2 Weekly Cadence Automation

```
Every Monday 08:00 EST:
  1. Pull portfolio/summary from Firestore
  2. Generate "Week Ahead" brief via Claude API:
     - Key milestones due this week
     - Open escalations requiring attention
     - Signal status summary
     - Resource conflicts
  3. Post to #forge-leadership Slack channel
  4. Send email to all leadership roles
  5. Create scheduled meeting reminders for the week

Every Friday 11:00 EST:
  1. Trigger generateWeeklyReport Cloud Function
  2. Wait for draft status
  3. Notify PMO Director for review
  4. Upon review → publish to team
  5. Export to DOCX via exportReport function
  6. Archive to Evidence Ledger
```

## 5.3 Escalation SLA Monitoring

```
Every 15 minutes:
  1. Query all open escalations
  2. For each: check if SLA deadline is approaching
     - 75% elapsed → "warning" notification to assignee
     - 100% elapsed → "breached" notification to assignee + their manager
     - 150% elapsed → auto-escalate severity by one level (P3→P2, P2→P1)
  3. Update escalation timeline with SLA status
```

## 5.4 Evidence Ledger Sync

```
Trigger: Any significant Firestore write (decisions, gate completions, escalation resolutions)
→ Transform to Evidence Ledger schema
→ Write to BigQuery table: evidence_ledger.entries
→ Fields: timestamp, engagement_id, entry_type, actor_uid, summary,
          evidence_data (JSON), phase, classification
```

---

# 6. PAGE-BY-PAGE UI SPECIFICATION

## 6.0 Global Shell

Every page shares:
- **Top bar:** SENTRAIS wordmark (left), "FORGE COMMAND CENTER" label, current date, authenticated user name + role badge, RESTRICTED classification tag, notification bell with unread count.
- **Sidebar:** Role-aware navigation (see 6.1), system health indicators at bottom, collapsible on mobile.
- **Background:** Deep Navy gradient (forge-gradient).
- **All cards:** `bg-sentrais-card border border-sentrais-border rounded-lg backdrop-blur`.
- **Typography:** DM Sans for UI, Space Grotesk for numbers/data.

### 6.1 Sidebar Navigation (Role-Filtered)

| Page | Route | Founder | CRO | PMO | CTO | CISO | Admin | Lead | Delivery |
|------|-------|---------|-----|-----|-----|------|-------|------|----------|
| Dashboard | / | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Portfolio | /portfolio | ✓ | ✓ | ✓ | — | — | — | — | — |
| Engagements | /engagements | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Engagement Detail | /engagements/:id | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓* | ✓* |
| Milestones | /milestones | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| Escalations | /escalations | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Check-Ins | /checkins | ✓ | — | ✓ | — | — | — | ✓ | ✓ |
| Decisions | /decisions | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| Meetings | /meetings | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Reports | /reports | ✓ | ✓ | ✓ | — | — | — | ✓ | — |
| Pipeline | /pipeline | ✓ | ✓ | — | — | — | — | — | — |
| Team | /team | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — |
| Signals | /signals | ✓ | — | ✓ | ✓ | ✓ | — | ✓ | — |
| Infrastructure | /infrastructure | — | — | — | ✓ | ✓ | ✓ | — | — |
| Settings | /settings | ✓ | — | — | — | — | ✓ | — | — |

*Engagement Lead and Delivery see only their assigned engagements.

---

## 6.2 Dashboard (/) — Role-Relative Daily View

### Founder View
**Top row (5 stat cards):** Portfolio Value, Avg Margin, High Risk Count, Portfolio Churn Index, Pipeline Value.
**Left column (2/3 width):** Portfolio engagement table (all engagements, full columns: phase, resilience, risk, churn, revenue, status). Signal Library active alerts table.
**Right column (1/3 width):** Blueprint360 resilience radar (portfolio average). Critical path milestone countdown (top 5).
**Bottom:** Resource performance table (all team members, utilization bars, task counts, blockers).

### CRO View
**Top row:** Active Revenue, Avg Margin, Expansion Pipeline, Win Rate, Avg Deal Cycle.
**Left column:** Revenue by engagement (horizontal bars with margin %). Churn risk revenue exposure (CRS × revenue = dollars at risk).
**Right column:** Pipeline opportunities (stage, probability, weighted value). Critical milestones (HIGH+ only).

### PMO Director View
**Top row:** Active Engagements, Gate Pass Rate, Avg Resilience, Total Blockers, Team Utilization.
**Left column:** Full engagement table. Signal breaches (filtered to BREACH only).
**Right column:** Complete milestone list (all 8+). Engagement lead allocation.

### CTO View
**Top row:** Agent Uptime %, API Latency (p99), Evidence Entries (today), GCP Spend MTD, Security Events (24h).
**Left column:** Agent health list (23 agents, status + uptime %). Technical signals.
**Middle column:** GCP project health (5 projects, quota usage bars).
**Right column:** Infrastructure milestones. Resilience radar.

### CISO View
**Top row:** Threat Level, Compliance Score, Vulnerabilities, Next Access Review, Encryption Status.
**Left column:** Security posture by GCP project (classification, MFA type, encryption, audit date, score). Zero-trust compliance checklist.
**Right column:** Resilience radar. Upcoming security reviews.

### System Admin View
**Top row:** System Status, Active Users, Agent Runtime, Storage Used, Pending Actions.
**Left column:** Infrastructure health (7 services, usage bars, status). **Right column:** Pending actions queue (provisioning, IAM, config). Active user sessions.

### Engagement Lead View
**Top row:** Current Phase + day count, Resilience %, Churn Risk, Team Size + Blockers, Next Gate countdown.
**Left column:** Phase progress (5-segment bar + time elapsed bar). Engagement-scoped signals. Team task list.
**Right column:** Resilience radar (engagement-specific). Engagement milestones.

### Delivery Team View
**Top row (compact):** My Tasks count, Utilization %, Blocked count, Certification Level.
**Main area:** Task list (title, engagement, due date, priority, status). Sortable, filterable.
**Bottom left:** My engagements (compact rows). **Bottom right:** Upcoming milestones.

---

## 6.3 Engagement Detail (/engagements/:id)

**Hero section:** Engagement name, client, code, current phase. Large resilience score ring. Risk level badge. Health score arc.

**Tabs:**
1. **Overview** — Phase tracker, key metrics, recent activity feed, next 5 milestones.
2. **Milestones** — Gantt-style timeline view. Each milestone shows: title, owner avatar, due date, status badge, linked evidence count. Filter by phase, priority, status.
3. **Signals** — Full signal dashboard for this engagement. Trend sparklines (10-reading history). Threshold lines. Mitigation recommendations. CRS calculation breakdown.
4. **Tasks** — Kanban board (backlog → in-progress → blocked → review → done). Drag-and-drop. Filter by assignee, priority. Link to milestones.
5. **Check-Ins** — Chronological feed of daily check-ins. Each shows: author, date, summary, sentiment badge, blockers, AI digest. "Submit Check-In" button at top.
6. **Escalations** — Active and resolved escalations. Each shows: severity badge, SLA timer, assignee, timeline of actions. "Raise Escalation" button.
7. **Decisions** — Decision log with search. Each shows: title, decided by, date, impact level, rationale, linked evidence.
8. **Resilience** — Full Blueprint360 radar for this engagement. Per-dimension breakdown with scores, trend arrows, and remediation notes. 80% gate status indicator.
9. **Documents** — File library (Cloud Storage). Upload + categorize. Auto-links to Evidence Ledger.
10. **Financials** — (Leadership only) Revenue, margin, burn rate, invoicing status, P&L summary.

---

## 6.4 Check-In Flow (/checkins or Engagement → Check-Ins tab)

### Submit Check-In Form

```
┌─────────────────────────────────────────────────┐
│  DAILY CHECK-IN · NFL EVERGAME Phase II          │
│  February 8, 2026                                │
├─────────────────────────────────────────────────┤
│                                                  │
│  Overall Sentiment:  [🟢 Green] [🟡 Amber] [🔴 Red] │
│                                                  │
│  What happened today?                            │
│  ┌────────────────────────────────────────────┐  │
│  │ (textarea — structured summary)            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Blockers (if any):                              │
│  [+ Add blocker]                                 │
│  • Awaiting client data for stadium mapping      │
│  • CTO review needed on architecture doc         │
│                                                  │
│  Next steps (tomorrow):                          │
│  [+ Add next step]                               │
│  • Complete stakeholder interview schedule        │
│  • Submit risk register draft for PMO review     │
│                                                  │
│  Attachments: [📎 Upload]                        │
│                                                  │
│  [Submit Check-In]                               │
│                                                  │
│  ── AI will generate a summary after submission. │
└─────────────────────────────────────────────────┘
```

After submission: Cloud Function generates AI summary, creates tasks from blockers, updates engagement activity feed. If sentiment is red → PMO gets notified immediately.

---

## 6.5 Escalation Flow (/escalations)

### Raise Escalation Form

Engagement selector → Severity (P1-P4 with SLA descriptions) → Title → Description → Related signals (auto-populated from active breaches) → Related milestones (auto-populated from at-risk items) → Submit.

### Escalation Detail View

**Header:** Title, severity badge, SLA countdown timer (prominent — shows hours:minutes remaining). Status badge.

**Body:**
- Description
- Related signals (linked cards)
- Related milestones (linked cards)
- Assigned to (avatar + name)
- Activity timeline (chronological):
  - "Escalation raised by Marcus Webb" — timestamp
  - "Auto-assigned to PMO Director" — timestamp
  - "Acknowledged by PMO Director" — timestamp
  - "Action taken: Scheduled emergency stakeholder call" — timestamp
  - "Resolution: Client provided missing data, unblocked" — timestamp
- Resolution field (text input, only when resolving)
- Status transitions: Open → Acknowledged → In Progress → Resolved → Closed

SLA timer visual: green when > 50% remaining, amber when 25-50%, red when < 25%, flashing red when breached.

---

## 6.6 Meetings (/meetings)

### Meeting Calendar View

Week view with time slots. Each meeting shows: title, type badge (color-coded), engagement name, attendee count. Click to open detail.

### Meeting Detail

**Before meeting:**
- AI Pre-Brief panel (auto-generated 2 hours before):
  - Engagement status since last meeting
  - Open escalations requiring discussion
  - Signal changes
  - Decisions pending
  - Recommended agenda items
- Editable agenda
- Attendee list with confirmation status

**During meeting:**
- Live notes editor (collaborative — Firestore real-time)
- Quick-action buttons: "Log Decision," "Create Action Item," "Raise Escalation"
- Timer showing meeting duration

**After meeting:**
- Structured notes with decisions, action items
- Action items auto-create tasks in relevant engagements
- AI meeting summary generated and posted to check-in feed

### Meeting Types & Cadences

| Meeting | Frequency | Attendees | Auto-Content |
|---------|-----------|-----------|-------------|
| Daily Standup | Weekdays 09:00 | Lead + Delivery (per engagement) | Yesterday's check-ins, today's blockers, task burndown |
| Weekly Portfolio Review | Monday 10:00 | Founder + CRO + PMO + Leads | Portfolio summary, per-engagement status, escalation queue, resource conflicts |
| Gate Review | Per milestone | Engagement team + PMO + Sponsor | Evidence Ledger for gate criteria, resilience score, risk register, Go/No-Go recommendation |
| Escalation Huddle | On-demand (P1/P2) | Assigned team + PMO + CTO (if technical) | Escalation context, related signals, timeline, mitigation options |
| Sprint Planning | Biweekly | Lead + Delivery (per engagement) | Backlog priority, capacity, milestone alignment, dependency check |
| Monthly Retro | Monthly | All internal | Win/loss analysis, signal accuracy review, process improvements, cross-engagement learnings |

---

## 6.7 Reports (/reports)

### Weekly Report View

Auto-generated every Friday. Shows:
- Executive summary (Claude-generated, 3-4 sentences)
- Portfolio health snapshot (stat cards)
- Per-engagement summaries (expandable accordion):
  - Status, phase, key metrics
  - This week: wins, risks, decisions
  - Next week: priorities, milestones due, resource needs
- Escalation summary
- Resource highlights (utilization, conflicts, certifications)
- AI recommendations (action items)
- "Export to DOCX" button → branded Sentrais document with cover page

### Gate Review Report

Triggered when engagement approaches a phase gate. Auto-assembled from Evidence Ledger:
- Phase summary
- Exit criteria checklist (each linked to evidence)
- Resilience score with dimension breakdown
- Risk register snapshot
- Stakeholder alignment assessment
- Go / Conditional Go / No-Go recommendation with rationale
- Presentation archetype applied (from FORGE v3.1 Design Agent)

---

## 6.8 Milestones (/milestones)

### Timeline View (Default)

Horizontal Gantt-style timeline. Rows = engagements. Diamonds = milestones positioned by date. Color = priority (red/amber/blue). Size = weight. Completed milestones show checkmark.

Interactive: hover for detail tooltip, click for full milestone panel.

### List View (Toggle)

Sortable table: Title, Engagement, Due Date, Days Out, Priority, Owner, Status, Evidence Count. Filter by engagement, priority, status, date range.

### Critical Path Panel (Sidebar)

Always-visible countdown of next 5 milestones with days remaining in large type. Matches the "Critical Path" widget from the dashboard.

---

## 6.9 Signals (/signals)

### Signal Health Matrix

Grid view: rows = signals, columns = engagements. Cell color = status (green/amber/red). Click cell for detail.

### Signal Detail Panel

- Signal name, description, threshold definition
- Current value with trend sparkline (30-day)
- Breach history (dates when status changed)
- Linked mitigations (from Mitigation Strategy Library)
- Linked escalations (auto-created from breaches)
- CRS contribution weight

---

## 6.10 Pipeline (/pipeline)

### Pipeline Kanban

Columns = stages (Qualification → Discovery → Proposal → Negotiation → Closed Won / Lost). Cards = opportunities. Card shows: name, client, value, probability, owner, next action date.

### Pipeline Summary

- Total weighted pipeline value
- Stage distribution
- Win rate trend
- Average deal cycle
- Revenue forecast (next 90/180/365 days)

---

## 6.11 Team (/team)

### Resource Allocation View

Table: Name, Role, Assigned Engagements, Utilization (bar), Active Tasks, Blocked, Certification Level. Sort by any column.

### Utilization Heatmap

Calendar-style view. Rows = team members. Cells = days. Color intensity = utilization %. Hover for detail.

### Capacity Planning

Bar chart: engagement demand vs. available capacity by week. Highlights over-allocation in red.

---

# 7. TEAM WORKFLOW PATTERNS

## 7.1 Daily Rhythm

```
08:30  Check-in reminders pushed to Engagement Leads
09:00  Each lead opens FORGE → submits daily check-in
       → AI summary generated
       → Blockers auto-create tasks
       → Red sentiment triggers PMO notification
09:00  Delivery team opens FORGE → sees task list for today
       → Updates task status (drag on kanban)
       → Reviews blockers, flags new ones
09:30  Daily standup (per engagement)
       → AI pre-brief loaded automatically
       → Meeting notes captured in FORGE
       → Action items auto-create tasks
       → Decisions logged to Evidence Ledger
Throughout day:
       → Signals evaluated every 4 hours
       → Milestone overdue checks at 07:00
       → Escalation SLA monitored every 15 minutes
       → Real-time Firestore updates across all dashboards
```

## 7.2 Weekly Rhythm

```
Monday 08:00   Week Ahead brief auto-generated → Slack + email
Monday 10:00   Portfolio Review meeting
               → AI pre-brief with portfolio summary
               → Per-engagement status from last week's check-ins
               → Open escalation queue
               → Resource conflict alerts
               → Decisions made → logged to Evidence Ledger
Friday 11:00   Weekly Report auto-generated (draft)
Friday 14:00   PMO Director reviews → publishes
Friday 15:00   Retro items captured for monthly meeting
```

## 7.3 Gate Review Workflow

```
Trigger: Milestone marked as gate review AND dueDate within 7 days.

1. FORGE auto-generates Gate Review Report from Evidence Ledger
2. Notifies engagement team + PMO + executive sponsor
3. Meeting auto-scheduled with AI pre-brief
4. During meeting: checklist walked through in FORGE
   → Each exit criterion marked as Pass/Conditional/Fail
   → Evidence linked for each criterion
5. Gate decision captured: Go / Conditional Go / No-Go
   → If Go: engagement phase auto-advances
   → If Conditional: conditions logged as tasks with deadlines
   → If No-Go: escalation auto-created, root cause documented
6. Full gate review archived to Evidence Ledger
7. If Design phase gate (80% Resilience Gate):
   → Resilience score validated against dimensions
   → No dimension below Level 3 enforced
   → Gate override requires Founder authorization
```

## 7.4 Escalation Workflow

```
1. RAISE: Team member clicks "Raise Escalation"
   → Selects severity (P1-P4), provides context
   → Links related signals and milestones
   → Submits → Cloud Function triggers

2. ROUTE: Auto-assignment based on severity
   → P1: Founder + CTO + CRO notified immediately (Slack + push)
   → P2: PMO Director + Engagement Lead
   → P3/P4: Engagement Lead
   → SLA timer starts

3. ACKNOWLEDGE: Assignee opens escalation in FORGE
   → Clicks "Acknowledge" → SLA clock switches to resolution timer
   → Adds initial assessment to timeline

4. WORK: Resolution in progress
   → Updates logged to timeline
   → Related tasks created as needed
   → If SLA at 75% → warning notification
   → If SLA breached → auto-escalate severity

5. RESOLVE: Assignee provides resolution
   → Links evidence of fix
   → Root cause documented
   → Stakeholders notified

6. CLOSE: PMO or Lead reviews resolution
   → Confirms fix is holding
   → Closes escalation
   → Lessons learned logged to Evidence Ledger
   → Learning Agent updates Mitigation Strategy Library
```

---

# 8. LOVABLE BUILD SEQUENCE

## Phase 1: Foundation (Week 1)

### Prompt 1: Project Setup + Auth
```
Create a React + TypeScript + Tailwind project called "forge-command-center."
Use shadcn/ui component library. Dark theme with these custom colors:
[paste tailwind theme from Section 2.3]

Set up Firebase Auth with Google SSO. Create a useAuth hook that:
- Manages login/logout state
- Fetches user profile from Firestore users collection
- Exposes: user, role, isLeadership, isAssigned(engagementId)
- Redirects to login page if unauthenticated

Create the app shell with:
- Top bar: "SENTRAIS" wordmark (text, DM Sans 800, tracking-widest),
  pipe separator, "FORGE COMMAND CENTER" in ocean blue,
  user name + role badge, RESTRICTED tag, notification bell
- Collapsible sidebar with navigation items filtered by role
  (see navigation matrix)
- Main content area with React Router outlet
- Background: linear-gradient(165deg, #0A1628 0%, #060D18 50%, #0A1225 100%)
```

### Prompt 2: Firestore Setup + Data Layer
```
Create a Firebase configuration file and Firestore service layer.
Collections: users, engagements (with subcollections: milestones,
signals, tasks, checkins, decisions, escalations), portfolio,
pipeline, weeklyReports, meetings, notifications.

Create React Query hooks for each collection:
- useEngagements() — real-time listener on active engagements
- useEngagement(id) — single engagement with all subcollections
- usePortfolio() — portfolio summary document
- useMyTasks(uid) — tasks assigned to user across all engagements
- useMilestones(engagementId?) — all milestones, optionally filtered
- useSignals(engagementId?) — all signals, optionally filtered
- useEscalations(filters) — escalations with status/severity filters
- useMeetings(dateRange) — meetings within date range
- useNotifications(uid) — real-time notification listener

Use onSnapshot for real-time updates on: engagements, signals,
escalations, notifications. Use getDocs for: meetings, reports,
pipeline (less frequent changes).
```

### Prompt 3: Shared Components
```
Create these reusable components with the Sentrais design system:

StatCard — label, value, subtitle, color, optional glow effect,
  optional trend indicator (up/down). Uses Space Grotesk for value.
MiniBar — value, max, color, height, optional label. Animated width.
SectionTitle — text, accent color bar on left.
PhaseTrack — 5-segment bar showing NIN phase progress.
StatusBadge — status text with color-coded dot.
PriorityBadge — CRITICAL/HIGH/MEDIUM/LOW with background tint.
RiskBadge — risk level with glow.
SLATimer — countdown display, color changes at 75%/100%.
ResilienceRadar — SVG radar chart for 5 Blueprint360 dimensions.
EngagementRow — table row for engagement list.
MilestoneItem — timeline item with countdown, priority, engagement.
SignalRow — signal name, engagement, value, threshold, status.
TeamMemberRow — name, role, engagements, utilization bar, tasks, blockers.
NotificationBell — bell icon with unread count, dropdown panel.
```

## Phase 2: Core Pages (Week 2)

### Prompt 4: Dashboard
```
Build the Dashboard page at route "/".
It reads the current user's role from useAuth() and renders
a different layout for each role.

[Paste the complete role-specific dashboard specs from Section 6.2]

All data comes from the Firestore hooks created in Prompt 2.
```

### Prompt 5: Engagement List + Detail
```
Build the Engagements page at "/engagements" and
Engagement Detail at "/engagements/:id".

List page: table of all engagements (filtered to assigned for
lead/delivery roles). Columns: name, client, phase, resilience,
risk, churn, revenue, status. Click to navigate to detail.

Detail page with tab navigation:
[Paste the 10-tab specification from Section 6.3]
```

### Prompt 6: Check-In + Escalation Flows
```
Build the Check-In submission flow and Escalation workflow.

Check-In form: [paste spec from Section 6.4]
Escalation form: [paste spec from Section 6.5]
Escalation detail with SLA timer and activity timeline.

Both write to Firestore subcollections under the selected engagement.
After check-in submit, show AI summary loading state
(will be populated by Cloud Function).
```

## Phase 3: Collaboration Pages (Week 3)

### Prompt 7: Meetings
```
Build Meetings page with calendar view and detail view.
[Paste spec from Section 6.6]
Include AI pre-brief panel, live notes editor, and
quick-action buttons for decisions and action items.
```

### Prompt 8: Milestones + Signals
```
Build Milestones page with timeline and list views.
[Paste spec from Section 6.8]

Build Signals page with health matrix.
[Paste spec from Section 6.9]
```

### Prompt 9: Reports + Pipeline + Team
```
Build Reports page with weekly report view and gate review.
[Paste spec from Section 6.7]

Build Pipeline kanban with stages.
[Paste spec from Section 6.10]

Build Team page with resource allocation and utilization.
[Paste spec from Section 6.11]
```

## Phase 4: Backend + Automation (Week 4)

### Step 10: Cloud Functions Deployment
```bash
cd functions/
npm init
npm install firebase-admin firebase-functions @google-cloud/bigquery
# Deploy each function from Section 4
firebase deploy --only functions
```

### Step 11: n8n Workflow Configuration
- Create n8n workflows from Section 5
- Configure Slack webhook integration
- Configure SendGrid email templates
- Configure Firestore trigger nodes
- Test end-to-end: checkin → notification → Slack

### Step 12: Firebase Hosting Deployment
```bash
# In Lovable: export project
# Local:
npm run build
firebase init hosting
# Set public directory to dist/
# Configure rewrites: /** → /index.html (SPA)
firebase deploy --only hosting
# Custom domain: forge.sentrais.com
```

---

# 9. SEED DATA FOR INITIAL DEPLOYMENT

## 9.1 Users (Firestore: users/)

```json
[
  { "uid": "tye-hayes", "displayName": "Tye Hayes", "email": "tye@sentrais.com", "role": "founder", "certificationLevel": "architect", "assignedEngagements": ["ALL"] },
  { "uid": "knox-phillips", "displayName": "Knox Phillips", "email": "knox@sentrais.com", "role": "cro", "certificationLevel": "lead", "assignedEngagements": ["NFL-EG-001", "LN-POC-001"] },
  { "uid": "pmo-director", "displayName": "PMO Director", "email": "pmo@sentrais.com", "role": "pmo", "certificationLevel": "lead", "assignedEngagements": ["ALL"] },
  { "uid": "ryan-harrelson", "displayName": "Ryan Harrelson", "email": "ryan@sentrais.com", "role": "cto", "certificationLevel": "architect", "assignedEngagements": ["ALL"] },
  { "uid": "kirby-winters", "displayName": "Kirby Winters", "email": "kirby@sentrais.com", "role": "ciso", "certificationLevel": "architect", "assignedEngagements": ["ALL"] },
  { "uid": "tionna", "displayName": "Tionna", "email": "tionna@sentrais.com", "role": "admin", "certificationLevel": "architect", "assignedEngagements": ["INTERNAL"] }
]
```

## 9.2 Engagements (Firestore: engagements/)

```json
[
  {
    "id": "NFL-EG-001",
    "name": "NFL EVERGAME Phase II",
    "client": "NFL",
    "engagementCode": "NFL-EG-001",
    "status": "active",
    "currentPhase": 3,
    "phaseName": "Design",
    "revenue": 1500000,
    "margin": 42,
    "resilienceScore": 72,
    "churnRiskScore": 28,
    "riskLevel": "MEDIUM",
    "healthScore": 78,
    "nextGateDate": "2026-03-31"
  },
  {
    "id": "LN-POC-001",
    "name": "Live Nation POC",
    "client": "Live Nation",
    "engagementCode": "LN-POC-001",
    "status": "active",
    "currentPhase": 1,
    "phaseName": "Discover",
    "revenue": 350000,
    "margin": 55,
    "resilienceScore": 0,
    "churnRiskScore": 12,
    "riskLevel": "LOW",
    "healthScore": 92,
    "nextGateDate": "2026-03-01"
  },
  {
    "id": "CG-CA-001",
    "name": "CiviGrid California",
    "client": "State of CA",
    "engagementCode": "CG-CA-001",
    "status": "active",
    "currentPhase": 2,
    "phaseName": "Diagnose",
    "revenue": 2200000,
    "margin": 38,
    "resilienceScore": 45,
    "churnRiskScore": 58,
    "riskLevel": "HIGH",
    "healthScore": 54,
    "nextGateDate": "2026-03-15"
  },
  {
    "id": "NFL-SC-001",
    "name": "NFL Stadium Cert",
    "client": "NFL",
    "engagementCode": "NFL-SC-001",
    "status": "active",
    "currentPhase": 3,
    "phaseName": "Design",
    "revenue": 800000,
    "margin": 44,
    "resilienceScore": 68,
    "churnRiskScore": 35,
    "riskLevel": "MEDIUM",
    "healthScore": 71,
    "nextGateDate": "2026-03-31"
  }
]
```

## 9.3 Initial Signal Library (per engagement)

Each active engagement gets seeded with these 10 signals:

```json
[
  { "signalName": "Requirements Ambiguity Score", "threshold": 20, "direction": "above", "weight": 0.30 },
  { "signalName": "Stakeholder Alignment Index", "threshold": 85, "direction": "below", "weight": 0.25 },
  { "signalName": "Technical Feasibility Confidence", "threshold": 80, "direction": "below", "weight": 0.25 },
  { "signalName": "Resource Availability Variance", "threshold": 20, "direction": "above", "weight": 0.20 },
  { "signalName": "Timeline Compression", "threshold": 20, "direction": "above", "weight": 0.15 },
  { "signalName": "Client Engagement Frequency", "threshold": 70, "direction": "below", "weight": 0.20 },
  { "signalName": "Scope Change Magnitude", "threshold": 3, "direction": "above", "weight": 0.25 },
  { "signalName": "Decision Velocity (hrs)", "threshold": 48, "direction": "above", "weight": 0.15 },
  { "signalName": "Budget Burn Rate (%)", "threshold": 115, "direction": "above", "weight": 0.20 },
  { "signalName": "Resilience Score Regression (%)", "threshold": 5, "direction": "above", "weight": 0.30 }
]
```

---

# 10. DEPLOYMENT CHECKLIST

```
PRE-BUILD
□ GCP project sentrais-forge-core provisioned
□ Firebase project created within GCP project
□ Firebase Auth configured with Google Workspace SSO (sentrais.com + novatelabs domains)
□ Firestore database created (production mode, nam5 region)
□ Firestore security rules deployed (Section 3.2)
□ Cloud Storage bucket created for attachments
□ Cloud Functions v2 runtime enabled
□ n8n Cloud account provisioned with Slack + SendGrid integrations
□ Custom domain forge.sentrais.com DNS configured

BUILD
□ Lovable project created with configuration from Section 2.3
□ Phase 1 prompts executed (shell, auth, data layer, components)
□ Phase 2 prompts executed (dashboard, engagements, checkins, escalations)
□ Phase 3 prompts executed (meetings, milestones, signals, reports, pipeline, team)
□ All Firestore hooks tested with seed data
□ Responsive layout verified (desktop 1440px, laptop 1280px, tablet 768px)

BACKEND
□ Cloud Functions deployed (Section 4)
□ Scheduled functions verified on cron
□ Triggered functions tested with Firestore writes
□ n8n workflows deployed (Section 5)
□ Slack integration tested (all channels created)
□ Weekly report generation tested end-to-end
□ BigQuery Evidence Ledger sync verified

SECURITY
□ Firebase Auth enforcing Sentrais/NOVATELabs domain restriction
□ Firestore rules tested for each role combination
□ Cloud Armor WAF configured on Firebase Hosting
□ HTTPS enforced on forge.sentrais.com
□ Tionna confirmed no access to Strategy Engine data
□ Pipeline collection restricted to founder + CRO
□ All API keys stored in Secret Manager (not code)

DEPLOYMENT
□ Lovable project exported
□ Production build generated (npm run build)
□ Firebase Hosting configured (SPA rewrites)
□ Deployed to forge.sentrais.com
□ SSL certificate verified
□ Seed data loaded (users, engagements, signals, milestones)
□ All team members can log in and see role-appropriate views

ACTIVATION
□ Team onboarding session completed
□ First daily check-ins submitted
□ First weekly portfolio review conducted in FORGE
□ Escalation workflow tested with P3 test case
□ Weekly report generated and exported to DOCX
□ n8n Slack notifications flowing correctly
□ Evidence Ledger BigQuery sync confirmed
```

---

# 11. COST ESTIMATE

| Component | Monthly Cost |
|---|---|
| Firebase Hosting (CDN, SSL) | Free tier (< 10GB transfer) |
| Firestore (reads/writes/storage) | $25-$80 (10-15 active users) |
| Cloud Functions v2 | $15-$40 (scheduled + triggered) |
| Cloud Storage (attachments) | $5-$15 |
| BigQuery (Evidence Ledger reads) | $10-$30 |
| Claude API (AI summaries, reports) | $50-$150 |
| n8n Cloud (Pro plan) | $50 |
| Lovable (Pro plan, ongoing edits) | $20 |
| Custom domain (forge.sentrais.com) | Included in DNS |
| **TOTAL** | **$175-$385/mo** |

At scale (20-30 users, 10+ engagements): $400-$800/mo.

---

*SENTRAIS — Antifragile. Sole-Source. Inevitable.*
