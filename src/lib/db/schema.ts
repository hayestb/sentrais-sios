import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  pgEnum,
  uuid,
  index,
  customType,
} from "drizzle-orm/pg-core";

// pgvector support — stored as vector(512) for Voyage AI voyage-3-lite
const vector = customType<{ data: number[]; driverData: string }>({
  dataType(config) {
    return `vector(${(config as { dimensions?: number })?.dimensions ?? 1536})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value.slice(1, -1).split(",").map(Number);
  },
});
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const engagementStatusEnum = pgEnum("engagement_status", [
  "active", "paused", "completed", "blocked",
]);

export const phaseEnum = pgEnum("phase", [
  "discover", "diagnose", "design", "deploy", "debrief",
]);

export const gateStatusEnum = pgEnum("gate_status", [
  "locked", "active", "passed", "failed", "blocked",
]);

export const gateOutcomeEnum = pgEnum("gate_outcome", [
  "commit", "conditional_go", "hold", "clear", "ceo_override",
]);

export const agentNameEnum = pgEnum("agent_name", [
  "governance", "discovery", "intake", "assessment", "architecture",
  "design", "delivery", "qa", "financial", "transition", "learning",
  "communications", "portfolio", "client_success", "legal", "sipe",
  "risk", "compliance", "knowledge", "escalation", "reporting", "integration",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "queued", "running", "completed", "failed", "escalated",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending", "sent", "paid", "overdue",
]);

export const raciRoleEnum = pgEnum("raci_role", [
  "responsible", "accountable", "consulted", "informed",
]);

export const sprintEventEnum = pgEnum("sprint_event", [
  "huddle", "tech_sync", "qa_review", "retrospective", "execution",
]);

export const userRoleEnum = pgEnum("user_role", [
  "sysadmin", "admin", "consultant", "client_executive", "analyst",
]);

export const remediationStatusEnum = pgEnum("remediation_status", [
  "todo", "in_progress", "done",
]);

export const innovationPhaseEnum = pgEnum("innovation_phase", [
  "i1_capture", "i2_feasibility", "i3_lab", "i4_prototype", "i5_validation", "i6_scale",
]);

export const innovationStatusEnum = pgEnum("innovation_status", [
  "active", "paused", "validated", "archived", "promoted",
]);

export const crmStageEnum = pgEnum("crm_stage", [
  "prospect", "discovery", "proposal", "scoping", "negotiation",
  "closed_won", "closed_lost", "live",
]);

export const vendorStatusEnum = pgEnum("vendor_status", [
  "active", "inactive", "under_review", "offboarded",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "gate_change", "hard_block", "invoice_due", "sprint_event",
  "remediation_assigned", "agent_escalation", "vendor_expiry", "system",
]);

// ─── Profiles (User Auth) ─────────────────────────────────────────────────────

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique(),
    email: text("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull().default("analyst"),
    avatarUrl: text("avatar_url"),
    active: boolean("active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("profiles_email_idx").on(t.email),
    index("profiles_role_idx").on(t.role),
    index("profiles_clerk_id_idx").on(t.clerkId),
  ]
);

// ─── Engagements ──────────────────────────────────────────────────────────────

export const engagements = pgTable(
  "engagements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientName: text("client_name").notNull(),
    vertical: text("vertical").notNull(),
    contractValue: real("contract_value").notNull(),
    status: engagementStatusEnum("status").notNull().default("active"),
    currentPhase: phaseEnum("current_phase").notNull().default("discover"),
    currentGate: integer("current_gate").notNull().default(0),
    entryPoint: text("entry_point"),
    governanceStandard: text("governance_standard").default("SIOS Agentic Framework"),
    sprintNumber: integer("sprint_number").notNull().default(1),
    primaryConsultantId: uuid("primary_consultant_id").references(() => profiles.id),
    // Blueprint Configuration Layer
    config: jsonb("config").$type<{
      kpiFramework?: string[];
      complianceFramework?: string;
      zoneTaxonomy?: string[];
      agentPromptOverrides?: Record<string, string>;
      gateThresholds?: Record<string, number>;
      primaryColor?: string;
      logo?: string;
    }>().default({}),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("engagements_status_idx").on(t.status),
    index("engagements_phase_idx").on(t.currentPhase),
  ]
);

// ─── Engagement → User Assignments ───────────────────────────────────────────

export const engagementAssignments = pgTable(
  "engagement_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ea_engagement_idx").on(t.engagementId), index("ea_profile_idx").on(t.profileId)]
);

// ─── Gate Records ─────────────────────────────────────────────────────────────

export const gateRecords = pgTable(
  "gate_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    gateNumber: integer("gate_number").notNull(),
    status: gateStatusEnum("status").notNull().default("locked"),
    outcome: gateOutcomeEnum("outcome"),
    resilienceScore: real("resilience_score"),
    harnessScore: real("harness_score"),
    thresholdsPassed: jsonb("thresholds_passed").$type<Record<string, boolean>>().default({}),
    hardBlockActive: boolean("hard_block_active").notNull().default(false),
    approvedBy: text("approved_by"),
    evidenceHash: text("evidence_hash"),
    conditionsNotes: text("conditions_notes"),
    passedAt: timestamp("passed_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("gate_records_engagement_idx").on(t.engagementId),
    index("gate_records_status_idx").on(t.status),
  ]
);

// ─── Gate Reviews (formal review records per gate decision) ──────────────────

export const gateReviews = pgTable(
  "gate_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gateRecordId: uuid("gate_record_id").notNull().references(() => gateRecords.id, { onDelete: "cascade" }),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    gateNumber: integer("gate_number").notNull(),
    outcome: gateOutcomeEnum("outcome").notNull(),
    scores: jsonb("scores").$type<Record<string, number>>().notNull().default({}),
    reviewedBy: text("reviewed_by").notNull(),
    notes: text("notes"),
    conditionsList: jsonb("conditions_list").$type<string[]>().default([]),
    evidenceHash: text("evidence_hash"),
    reviewedAt: timestamp("reviewed_at").notNull().defaultNow(),
  },
  (t) => [
    index("gate_reviews_engagement_idx").on(t.engagementId),
    index("gate_reviews_gate_idx").on(t.gateNumber),
  ]
);

// ─── Remediation Actions ──────────────────────────────────────────────────────

export const remediationActions = pgTable(
  "remediation_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    gateReviewId: uuid("gate_review_id").references(() => gateReviews.id),
    title: text("title").notNull(),
    description: text("description"),
    status: remediationStatusEnum("status").notNull().default("todo"),
    assignedTo: text("assigned_to"),
    assignedToProfileId: uuid("assigned_to_profile_id").references(() => profiles.id),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    priority: text("priority").notNull().default("medium"),
    gateNumber: integer("gate_number"),
    ninTag: text("nin_tag"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("remediation_engagement_idx").on(t.engagementId),
    index("remediation_status_idx").on(t.status),
  ]
);

// ─── Evidence Ledger (Zone 1 — Immutable) ────────────────────────────────────

export const evidenceEntries = pgTable(
  "evidence_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    entryType: text("entry_type").notNull(),
    subject: text("subject").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    sha256Hash: text("sha256_hash").notNull().unique(),
    chainHash: text("chain_hash"),
    authorAgent: agentNameEnum("author_agent"),
    authorHuman: text("author_human"),
    gateNumber: integer("gate_number"),
    ninTag: text("nin_tag"),
    immutable: boolean("immutable").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("evidence_engagement_idx").on(t.engagementId),
    index("evidence_type_idx").on(t.entryType),
    index("evidence_hash_idx").on(t.sha256Hash),
    index("evidence_created_idx").on(t.createdAt),
  ]
);

// ─── Agent Tasks ──────────────────────────────────────────────────────────────

export const agentTasks = pgTable(
  "agent_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    agentName: agentNameEnum("agent_name").notNull(),
    taskType: text("task_type").notNull(),
    status: taskStatusEnum("status").notNull().default("queued"),
    input: jsonb("input").$type<Record<string, unknown>>().notNull(),
    output: jsonb("output").$type<Record<string, unknown>>(),
    tokensUsed: integer("tokens_used"),
    durationMs: integer("duration_ms"),
    errorMessage: text("error_message"),
    escalatedTo: text("escalated_to"),
    sprintDay: integer("sprint_day"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("agent_tasks_agent_idx").on(t.agentName),
    index("agent_tasks_status_idx").on(t.status),
    index("agent_tasks_engagement_idx").on(t.engagementId),
  ]
);

// ─── Agent Conversations ──────────────────────────────────────────────────────

export const agentConversations = pgTable(
  "agent_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    agentName: agentNameEnum("agent_name").notNull(),
    title: text("title"),
    messages: jsonb("messages").$type<{ role: "user" | "assistant"; content: string; ts: string }[]>().notNull().default([]),
    tokensTotal: integer("tokens_total").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("conv_engagement_idx").on(t.engagementId),
    index("conv_agent_idx").on(t.agentName),
  ]
);

// ─── Sprint Cycles ────────────────────────────────────────────────────────────

export const sprintCycles = pgTable(
  "sprint_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    sprintNumber: integer("sprint_number").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    huddle: timestamp("huddle"),
    techSync: timestamp("tech_sync"),
    qaReview: timestamp("qa_review"),
    retrospective: timestamp("retrospective"),
    raciSnapshot: jsonb("raci_snapshot").$type<Record<string, string[]>>().default({}),
    sprintBuckets: jsonb("sprint_buckets").$type<string[]>().default([]),
    sipeUpdated: boolean("sipe_updated").notNull().default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("sprint_engagement_idx").on(t.engagementId),
    index("sprint_number_idx").on(t.sprintNumber),
  ]
);

// ─── RACI Assignments ─────────────────────────────────────────────────────────

export const raciAssignments = pgTable(
  "raci_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    raciRole: raciRoleEnum("raci_role").notNull(),
    phase: phaseEnum("phase"),
    decisionAuthority: text("decision_authority"),
    boundary: text("boundary"),
    aiCounterpart: agentNameEnum("ai_counterpart"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("raci_engagement_idx").on(t.engagementId)]
);

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id),
    invoiceNumber: text("invoice_number").notNull().unique(),
    triggerGate: integer("trigger_gate").notNull(),
    invoiceType: text("invoice_type").notNull(),
    amountDue: real("amount_due").notNull(),
    status: invoiceStatusEnum("status").notNull().default("pending"),
    sentAt: timestamp("sent_at"),
    paidAt: timestamp("paid_at"),
    evidenceHash: text("evidence_hash"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("invoices_engagement_idx").on(t.engagementId),
    index("invoices_status_idx").on(t.status),
  ]
);

// ─── SIPE Engine ──────────────────────────────────────────────────────────────

export const sipeEntries = pgTable(
  "sipe_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    sprintId: uuid("sprint_id").references(() => sprintCycles.id),
    category: text("category").notNull(),
    content: text("content").notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    vertical: text("vertical"),
    applicablePhases: jsonb("applicable_phases").$type<string[]>().default([]),
    confidenceScore: real("confidence_score"),
    ninTag: text("nin_tag"),
    playbookId: text("playbook_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("sipe_category_idx").on(t.category),
    index("sipe_vertical_idx").on(t.vertical),
  ]
);

// ─── Spoke Registry ───────────────────────────────────────────────────────────
// Sentrais 360 OS hub-and-spoke: registry of connected apps (evergame, atl-360,
// nfl-ims, sentrais-forge, …) that federate identity and publish events to the hub.

export const spokeRegistry = pgTable(
  "spoke_registry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    baseUrl: text("base_url"),
    healthUrl: text("health_url"),
    vertical: text("vertical"),
    stack: text("stack"), // e.g. "supabase", "firebase", "neon"
    oidcClientId: text("oidc_client_id"),
    apiKeyHash: text("api_key_hash"), // sha256 of the spoke's service API key
    status: text("status").notNull().default("active"), // active | paused | inactive
    lastEventAt: timestamp("last_event_at"),
    lastHealthAt: timestamp("last_health_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("spoke_slug_idx").on(t.slug),
    index("spoke_status_idx").on(t.status),
  ]
);

// ─── KPI Snapshots ────────────────────────────────────────────────────────────

export const kpiSnapshots = pgTable(
  "kpi_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    kpiKey: text("kpi_key").notNull(),
    kpiLabel: text("kpi_label").notNull(),
    value: real("value").notNull(),
    unit: text("unit"),
    target: real("target"),
    trend: text("trend"),
    vertical: text("vertical"),
    sprintNumber: integer("sprint_number"),
    capturedAt: timestamp("captured_at").notNull().defaultNow(),
  },
  (t) => [
    index("kpi_engagement_idx").on(t.engagementId),
    index("kpi_key_idx").on(t.kpiKey),
  ]
);

// ─── Budget Milestones ────────────────────────────────────────────────────────

export const budgetMilestones = pgTable(
  "budget_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    amount: real("amount").notNull(),
    spentToDate: real("spent_to_date").notNull().default(0),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    gateNumber: integer("gate_number"),
    alertThreshold: real("alert_threshold").notNull().default(0.85),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("budget_engagement_idx").on(t.engagementId)]
);

// ─── Engagement Comments / Activity Feed ─────────────────────────────────────

export const engagementComments = pgTable(
  "engagement_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").notNull().references(() => engagements.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => profiles.id),
    authorName: text("author_name").notNull(),
    content: text("content").notNull(),
    eventType: text("event_type").notNull().default("comment"),
    linkedEntityId: text("linked_entity_id"),
    linkedEntityType: text("linked_entity_type"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("comments_engagement_idx").on(t.engagementId),
    index("comments_created_idx").on(t.createdAt),
  ]
);

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    read: boolean("read").notNull().default(false),
    actionUrl: text("action_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("notif_profile_idx").on(t.profileId),
    index("notif_read_idx").on(t.read),
  ]
);

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    name: text("name").notNull(),
    category: text("category").notNull(),
    status: vendorStatusEnum("status").notNull().default("active"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contractValue: real("contract_value"),
    contractStart: timestamp("contract_start"),
    contractEnd: timestamp("contract_end"),
    complianceScore: real("compliance_score"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("vendors_engagement_idx").on(t.engagementId),
    index("vendors_status_idx").on(t.status),
  ]
);

// ─── Vendor Documents ─────────────────────────────────────────────────────────

export const vendorDocuments = pgTable(
  "vendor_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    documentType: text("document_type").notNull(),
    fileName: text("file_name").notNull(),
    url: text("url"),
    sha256Hash: text("sha256_hash"),
    expiresAt: timestamp("expires_at"),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (t) => [index("vendor_docs_vendor_idx").on(t.vendorId)]
);

// ─── Innovation Ideas (I1–I6 Lifecycle) ──────────────────────────────────────

export const innovationIdeas = pgTable(
  "innovation_ideas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementId: uuid("engagement_id").references(() => engagements.id),
    title: text("title").notNull(),
    description: text("description"),
    phase: innovationPhaseEnum("phase").notNull().default("i1_capture"),
    status: innovationStatusEnum("status").notNull().default("active"),
    submittedBy: text("submitted_by"),
    vertical: text("vertical"),
    ninTag: text("nin_tag"),
    feasibilityScore: real("feasibility_score"),
    impactScore: real("impact_score"),
    effortScore: real("effort_score"),
    labZone: text("lab_zone"),
    prototypeUrl: text("prototype_url"),
    validationData: jsonb("validation_data").$type<Record<string, unknown>>().default({}),
    tags: jsonb("tags").$type<string[]>().default([]),
    promotedToEngagementId: uuid("promoted_to_engagement_id").references(() => engagements.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("ideas_phase_idx").on(t.phase),
    index("ideas_status_idx").on(t.status),
    index("ideas_engagement_idx").on(t.engagementId),
  ]
);

// ─── CRM Deals ────────────────────────────────────────────────────────────────

export const crmDeals = pgTable(
  "crm_deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    stage: crmStageEnum("stage").notNull().default("prospect"),
    vertical: text("vertical"),
    estimatedValue: real("estimated_value"),
    probability: integer("probability").notNull().default(10),
    expectedCloseDate: timestamp("expected_close_date"),
    assignedTo: text("assigned_to"),
    assignedToProfileId: uuid("assigned_to_profile_id").references(() => profiles.id),
    notes: text("notes"),
    convertedToEngagementId: uuid("converted_to_engagement_id").references(() => engagements.id),
    convertedAt: timestamp("converted_at"),
    // Integration fields — populated when deal originates from / syncs to external platforms
    hubspotDealId: text("hubspot_deal_id").unique(),
    licensingSector: text("licensing_sector").$type<"COMMERCIAL" | "NONPROFIT">(),
    mondayItemId: text("monday_item_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("crm_stage_idx").on(t.stage),
    index("crm_assigned_idx").on(t.assignedToProfileId),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  assignments: many(engagementAssignments),
  notifications: many(notifications),
}));

export const engagementsRelations = relations(engagements, ({ one, many }) => ({
  primaryConsultant: one(profiles, { fields: [engagements.primaryConsultantId], references: [profiles.id] }),
  gates: many(gateRecords),
  gateReviews: many(gateReviews),
  evidence: many(evidenceEntries),
  tasks: many(agentTasks),
  conversations: many(agentConversations),
  sprints: many(sprintCycles),
  raci: many(raciAssignments),
  invoices: many(invoices),
  sipe: many(sipeEntries),
  kpiSnapshots: many(kpiSnapshots),
  budgetMilestones: many(budgetMilestones),
  comments: many(engagementComments),
  assignments: many(engagementAssignments),
  remediationActions: many(remediationActions),
  vendors: many(vendors),
  innovationIdeas: many(innovationIdeas),
}));

export const gateRecordsRelations = relations(gateRecords, ({ one, many }) => ({
  engagement: one(engagements, { fields: [gateRecords.engagementId], references: [engagements.id] }),
  reviews: many(gateReviews),
}));

export const gateReviewsRelations = relations(gateReviews, ({ one, many }) => ({
  gateRecord: one(gateRecords, { fields: [gateReviews.gateRecordId], references: [gateRecords.id] }),
  engagement: one(engagements, { fields: [gateReviews.engagementId], references: [engagements.id] }),
  remediationActions: many(remediationActions),
}));

export const remediationActionsRelations = relations(remediationActions, ({ one }) => ({
  engagement: one(engagements, { fields: [remediationActions.engagementId], references: [engagements.id] }),
  gateReview: one(gateReviews, { fields: [remediationActions.gateReviewId], references: [gateReviews.id] }),
  assignedProfile: one(profiles, { fields: [remediationActions.assignedToProfileId], references: [profiles.id] }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  engagement: one(engagements, { fields: [vendors.engagementId], references: [engagements.id] }),
  documents: many(vendorDocuments),
}));

export const vendorDocumentsRelations = relations(vendorDocuments, ({ one }) => ({
  vendor: one(vendors, { fields: [vendorDocuments.vendorId], references: [vendors.id] }),
}));

export const innovationIdeasRelations = relations(innovationIdeas, ({ one }) => ({
  engagement: one(engagements, { fields: [innovationIdeas.engagementId], references: [engagements.id] }),
}));

export const crmDealsRelations = relations(crmDeals, ({ one }) => ({
  assignedProfile: one(profiles, { fields: [crmDeals.assignedToProfileId], references: [profiles.id] }),
  convertedEngagement: one(engagements, { fields: [crmDeals.convertedToEngagementId], references: [engagements.id] }),
}));

export const agentConversationsRelations = relations(agentConversations, ({ one }) => ({
  engagement: one(engagements, { fields: [agentConversations.engagementId], references: [engagements.id] }),
}));

export const sprintCyclesRelations = relations(sprintCycles, ({ one, many }) => ({
  engagement: one(engagements, { fields: [sprintCycles.engagementId], references: [engagements.id] }),
  sipe: many(sipeEntries),
}));

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type Engagement = typeof engagements.$inferSelect;
export type NewEngagement = typeof engagements.$inferInsert;
export type GateRecord = typeof gateRecords.$inferSelect;
export type GateReview = typeof gateReviews.$inferSelect;
export type NewGateReview = typeof gateReviews.$inferInsert;
export type RemediationAction = typeof remediationActions.$inferSelect;
export type NewRemediationAction = typeof remediationActions.$inferInsert;
export type EvidenceEntry = typeof evidenceEntries.$inferSelect;
export type NewEvidenceEntry = typeof evidenceEntries.$inferInsert;
export type AgentTask = typeof agentTasks.$inferSelect;
export type AgentConversation = typeof agentConversations.$inferSelect;
export type SprintCycle = typeof sprintCycles.$inferSelect;
export type NewSprintCycle = typeof sprintCycles.$inferInsert;
export type RaciAssignment = typeof raciAssignments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type SipeEntry = typeof sipeEntries.$inferSelect;
export type SpokeRegistryEntry = typeof spokeRegistry.$inferSelect;
export type NewSpokeRegistryEntry = typeof spokeRegistry.$inferInsert;
export type KpiSnapshot = typeof kpiSnapshots.$inferSelect;
export type BudgetMilestone = typeof budgetMilestones.$inferSelect;
export type EngagementComment = typeof engagementComments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type VendorDocument = typeof vendorDocuments.$inferSelect;
export type InnovationIdea = typeof innovationIdeas.$inferSelect;
export type CrmDeal = typeof crmDeals.$inferSelect;
export type Profile = typeof profiles.$inferSelect;

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => profiles.id),
    actorClerkId: text("actor_clerk_id"),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_action_idx").on(t.action),
    index("audit_created_idx").on(t.createdAt),
  ]
);

// ─── Calendar Tokens ──────────────────────────────────────────────────────────

export const calendarProviderEnum = pgEnum("calendar_provider", ["google", "outlook"]);

export const calendarTokens = pgTable(
  "calendar_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    provider: calendarProviderEnum("provider").notNull(),
    accessTokenEnc: text("access_token_enc").notNull(),
    refreshTokenEnc: text("refresh_token_enc"),
    expiresAt: timestamp("expires_at"),
    calendarId: text("calendar_id"),
    syncEnabled: boolean("sync_enabled").notNull().default(true),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("cal_tokens_profile_idx").on(t.profileId),
    index("cal_tokens_provider_idx").on(t.provider),
  ]
);

export type AuditLog = typeof auditLog.$inferSelect;
export type CalendarToken = typeof calendarTokens.$inferSelect;

// ─── Document Knowledge Base ──────────────────────────────────────────────────

export const docCategoryEnum = pgEnum("doc_category", [
  "sentrais-core",
  "nfl",
  "evergame",
  "spectra-civigrid",
  "legal-contracts",
  "operations",
  "personal",
  "other",
]);

export const docStatusEnum = pgEnum("doc_status", [
  "pending",
  "processing",
  "indexed",
  "failed",
]);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: text("filename").notNull(),
    originalPath: text("original_path").notNull(),
    category: docCategoryEnum("category").notNull().default("other"),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    status: docStatusEnum("status").notNull().default("pending"),
    extractedText: text("extracted_text"),
    pageCount: integer("page_count"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("doc_category_idx").on(t.category),
    index("doc_status_idx").on(t.status),
    index("doc_filename_idx").on(t.filename),
  ]
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count"),
    embedding: vector("embedding", { dimensions: 512 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("chunk_doc_idx").on(t.documentId),
    index("chunk_doc_order_idx").on(t.documentId, t.chunkIndex),
  ]
);

export const documentsRelations = relations(documents, ({ many }) => ({
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, { fields: [documentChunks.documentId], references: [documents.id] }),
}));

export type Document = typeof documents.$inferSelect;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;
