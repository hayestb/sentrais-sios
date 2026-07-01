CREATE TABLE "spoke_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"base_url" text,
	"health_url" text,
	"vertical" text,
	"stack" text,
	"oidc_client_id" text,
	"api_key_hash" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_event_at" timestamp,
	"last_health_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spoke_registry_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "spoke_slug_idx" ON "spoke_registry" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "spoke_status_idx" ON "spoke_registry" USING btree ("status");
