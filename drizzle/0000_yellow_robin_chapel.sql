CREATE TYPE IF NOT EXISTS "public"."agent_name" AS ENUM('governance', 'discovery', 'intake', 'assessment', 'architecture', 'design', 'delivery', 'qa', 'financial', 'transition', 'learning', 'communications', 'portfolio', 'client_success', 'legal', 'sipe', 'risk', 'compliance', 'knowledge', 'escalation', 'reporting', 'integration');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."calendar_provider" AS ENUM('google', 'outlook');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."crm_stage" AS ENUM('prospect', 'discovery', 'proposal', 'scoping', 'negotiation', 'closed_won', 'closed_lost', 'live');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."engagement_status" AS ENUM('active', 'paused', 'completed', 'blocked');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."gate_outcome" AS ENUM('commit', 'conditional_go', 'hold', 'clear', 'ceo_override');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."gate_status" AS ENUM('locked', 'active', 'passed', 'failed', 'blocked');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."innovation_phase" AS ENUM('i1_capture', 'i2_feasibility', 'i3_lab', 'i4_prototype', 'i5_validation', 'i6_scale');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."innovation_status" AS ENUM('active', 'paused', 'validated', 'archived', 'promoted');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."invoice_status" AS ENUM('pending', 'sent', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."notification_type" AS ENUM('gate_change', 'hard_block', 'invoice_due', 'sprint_event', 'remediation_assigned', 'agent_escalation', 'vendor_expiry', 'system');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."phase" AS ENUM('discover', 'diagnose', 'design', 'deploy', 'debrief');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."raci_role" AS ENUM('responsible', 'accountable', 'consulted', 'informed');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."remediation_status" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."sprint_event" AS ENUM('huddle', 'tech_sync', 'qa_review', 'retrospective', 'execution');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."task_status" AS ENUM('queued', 'running', 'completed', 'failed', 'escalated');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."user_role" AS ENUM('sysadmin', 'admin', 'consultant', 'client_executive', 'analyst');--> statement-breakpoint
CREATE TYPE IF NOT EXISTS "public"."vendor_status" AS ENUM('active', 'inactive', 'under_review', 'offboarded');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid,
	"agent_name" "agent_name" NOT NULL,
	"title" text,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tokens_total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid,
	"agent_name" "agent_name" NOT NULL,
	"task_type" text NOT NULL,
	"status" "task_status" DEFAULT 'queued' NOT NULL,
	"input" jsonb NOT NULL,
	"output" jsonb,
	"tokens_used" integer,
	"duration_ms" integer,
	"error_message" text,
	"escalated_to" text,
	"sprint_day" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_clerk_id" text,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budget_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"label" text NOT NULL,
	"amount" real NOT NULL,
	"spent_to_date" real DEFAULT 0 NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"gate_number" integer,
	"alert_threshold" real DEFAULT 0.85 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calendar_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"provider" "calendar_provider" NOT NULL,
	"access_token_enc" text NOT NULL,
	"refresh_token_enc" text,
	"expires_at" timestamp,
	"calendar_id" text,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"stage" "crm_stage" DEFAULT 'prospect' NOT NULL,
	"vertical" text,
	"estimated_value" real,
	"probability" integer DEFAULT 10 NOT NULL,
	"expected_close_date" timestamp,
	"assigned_to" text,
	"assigned_to_profile_id" uuid,
	"notes" text,
	"converted_to_engagement_id" uuid,
	"converted_at" timestamp,
	"hubspot_deal_id" text,
	"licensing_sector" text,
	"monday_item_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "crm_deals_hubspot_deal_id_unique" UNIQUE("hubspot_deal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "engagement_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "engagement_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"author_id" uuid,
	"author_name" text NOT NULL,
	"content" text NOT NULL,
	"event_type" text DEFAULT 'comment' NOT NULL,
	"linked_entity_id" text,
	"linked_entity_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"vertical" text NOT NULL,
	"contract_value" real NOT NULL,
	"status" "engagement_status" DEFAULT 'active' NOT NULL,
	"current_phase" "phase" DEFAULT 'discover' NOT NULL,
	"current_gate" integer DEFAULT 0 NOT NULL,
	"entry_point" text,
	"governance_standard" text DEFAULT 'SIOS Agentic Framework',
	"sprint_number" integer DEFAULT 1 NOT NULL,
	"primary_consultant_id" uuid,
	"config" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid,
	"entry_type" text NOT NULL,
	"subject" text NOT NULL,
	"payload" jsonb NOT NULL,
	"sha256_hash" text NOT NULL,
	"chain_hash" text,
	"author_agent" "agent_name",
	"author_human" text,
	"gate_number" integer,
	"nin_tag" text,
	"immutable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_entries_sha256_hash_unique" UNIQUE("sha256_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gate_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"gate_number" integer NOT NULL,
	"status" "gate_status" DEFAULT 'locked' NOT NULL,
	"outcome" "gate_outcome",
	"resilience_score" real,
	"harness_score" real,
	"thresholds_passed" jsonb DEFAULT '{}'::jsonb,
	"hard_block_active" boolean DEFAULT false NOT NULL,
	"approved_by" text,
	"evidence_hash" text,
	"conditions_notes" text,
	"passed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gate_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gate_record_id" uuid NOT NULL,
	"engagement_id" uuid NOT NULL,
	"gate_number" integer NOT NULL,
	"outcome" "gate_outcome" NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reviewed_by" text NOT NULL,
	"notes" text,
	"conditions_list" jsonb DEFAULT '[]'::jsonb,
	"evidence_hash" text,
	"reviewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "innovation_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"phase" "innovation_phase" DEFAULT 'i1_capture' NOT NULL,
	"status" "innovation_status" DEFAULT 'active' NOT NULL,
	"submitted_by" text,
	"vertical" text,
	"nin_tag" text,
	"feasibility_score" real,
	"impact_score" real,
	"effort_score" real,
	"lab_zone" text,
	"prototype_url" text,
	"validation_data" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"promoted_to_engagement_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"trigger_gate" integer NOT NULL,
	"invoice_type" text NOT NULL,
	"amount_due" real NOT NULL,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"evidence_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kpi_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"kpi_key" text NOT NULL,
	"kpi_label" text NOT NULL,
	"value" real NOT NULL,
	"unit" text,
	"target" real,
	"trend" text,
	"vertical" text,
	"sprint_number" integer,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"engagement_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"read" boolean DEFAULT false NOT NULL,
	"action_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'analyst' NOT NULL,
	"avatar_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "raci_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"role_id" text NOT NULL,
	"display_name" text NOT NULL,
	"email" text,
	"raci_role" "raci_role" NOT NULL,
	"phase" "phase",
	"decision_authority" text,
	"boundary" text,
	"ai_counterpart" "agent_name",
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "remediation_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"gate_review_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "remediation_status" DEFAULT 'todo' NOT NULL,
	"assigned_to" text,
	"assigned_to_profile_id" uuid,
	"due_date" timestamp,
	"completed_at" timestamp,
	"priority" text DEFAULT 'medium' NOT NULL,
	"gate_number" integer,
	"nin_tag" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sipe_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid,
	"sprint_id" uuid,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"vertical" text,
	"applicable_phases" jsonb DEFAULT '[]'::jsonb,
	"confidence_score" real,
	"nin_tag" text,
	"playbook_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sprint_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"sprint_number" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"huddle" timestamp,
	"tech_sync" timestamp,
	"qa_review" timestamp,
	"retrospective" timestamp,
	"raci_snapshot" jsonb DEFAULT '{}'::jsonb,
	"sprint_buckets" jsonb DEFAULT '[]'::jsonb,
	"sipe_updated" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"engagement_id" uuid,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"url" text,
	"sha256_hash" text,
	"expires_at" timestamp,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"status" "vendor_status" DEFAULT 'active' NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contract_value" real,
	"contract_start" timestamp,
	"contract_end" timestamp,
	"compliance_score" real,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_milestones" ADD CONSTRAINT "budget_milestones_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_tokens" ADD CONSTRAINT "calendar_tokens_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_assigned_to_profile_id_profiles_id_fk" FOREIGN KEY ("assigned_to_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_converted_to_engagement_id_engagements_id_fk" FOREIGN KEY ("converted_to_engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_assignments" ADD CONSTRAINT "engagement_assignments_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_assignments" ADD CONSTRAINT "engagement_assignments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_comments" ADD CONSTRAINT "engagement_comments_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_comments" ADD CONSTRAINT "engagement_comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_primary_consultant_id_profiles_id_fk" FOREIGN KEY ("primary_consultant_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_entries" ADD CONSTRAINT "evidence_entries_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_records" ADD CONSTRAINT "gate_records_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_reviews" ADD CONSTRAINT "gate_reviews_gate_record_id_gate_records_id_fk" FOREIGN KEY ("gate_record_id") REFERENCES "public"."gate_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_reviews" ADD CONSTRAINT "gate_reviews_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innovation_ideas" ADD CONSTRAINT "innovation_ideas_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innovation_ideas" ADD CONSTRAINT "innovation_ideas_promoted_to_engagement_id_engagements_id_fk" FOREIGN KEY ("promoted_to_engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_snapshots" ADD CONSTRAINT "kpi_snapshots_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raci_assignments" ADD CONSTRAINT "raci_assignments_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_actions" ADD CONSTRAINT "remediation_actions_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_actions" ADD CONSTRAINT "remediation_actions_gate_review_id_gate_reviews_id_fk" FOREIGN KEY ("gate_review_id") REFERENCES "public"."gate_reviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_actions" ADD CONSTRAINT "remediation_actions_assigned_to_profile_id_profiles_id_fk" FOREIGN KEY ("assigned_to_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sipe_entries" ADD CONSTRAINT "sipe_entries_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sipe_entries" ADD CONSTRAINT "sipe_entries_sprint_id_sprint_cycles_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprint_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprint_cycles" ADD CONSTRAINT "sprint_cycles_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_documents" ADD CONSTRAINT "vendor_documents_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conv_engagement_idx" ON "agent_conversations" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "conv_agent_idx" ON "agent_conversations" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "agent_tasks_agent_idx" ON "agent_tasks" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "agent_tasks_status_idx" ON "agent_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agent_tasks_engagement_idx" ON "agent_tasks" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "budget_engagement_idx" ON "budget_milestones" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "cal_tokens_profile_idx" ON "calendar_tokens" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "cal_tokens_provider_idx" ON "calendar_tokens" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "crm_stage_idx" ON "crm_deals" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "crm_assigned_idx" ON "crm_deals" USING btree ("assigned_to_profile_id");--> statement-breakpoint
CREATE INDEX "ea_engagement_idx" ON "engagement_assignments" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "ea_profile_idx" ON "engagement_assignments" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "comments_engagement_idx" ON "engagement_comments" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "comments_created_idx" ON "engagement_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "engagements_status_idx" ON "engagements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "engagements_phase_idx" ON "engagements" USING btree ("current_phase");--> statement-breakpoint
CREATE INDEX "evidence_engagement_idx" ON "evidence_entries" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "evidence_type_idx" ON "evidence_entries" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "evidence_hash_idx" ON "evidence_entries" USING btree ("sha256_hash");--> statement-breakpoint
CREATE INDEX "evidence_created_idx" ON "evidence_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "gate_records_engagement_idx" ON "gate_records" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "gate_records_status_idx" ON "gate_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gate_reviews_engagement_idx" ON "gate_reviews" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "gate_reviews_gate_idx" ON "gate_reviews" USING btree ("gate_number");--> statement-breakpoint
CREATE INDEX "ideas_phase_idx" ON "innovation_ideas" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "ideas_status_idx" ON "innovation_ideas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ideas_engagement_idx" ON "innovation_ideas" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "invoices_engagement_idx" ON "invoices" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kpi_engagement_idx" ON "kpi_snapshots" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "kpi_key_idx" ON "kpi_snapshots" USING btree ("kpi_key");--> statement-breakpoint
CREATE INDEX "notif_profile_idx" ON "notifications" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "notif_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "profiles_clerk_id_idx" ON "profiles" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "raci_engagement_idx" ON "raci_assignments" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "remediation_engagement_idx" ON "remediation_actions" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "remediation_status_idx" ON "remediation_actions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sipe_category_idx" ON "sipe_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sipe_vertical_idx" ON "sipe_entries" USING btree ("vertical");--> statement-breakpoint
CREATE INDEX "sprint_engagement_idx" ON "sprint_cycles" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "sprint_number_idx" ON "sprint_cycles" USING btree ("sprint_number");--> statement-breakpoint
CREATE INDEX "vendor_docs_vendor_idx" ON "vendor_documents" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "vendors_engagement_idx" ON "vendors" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "vendors_status_idx" ON "vendors" USING btree ("status");