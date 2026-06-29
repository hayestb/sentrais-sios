-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."doc_category" AS ENUM('sentrais-core', 'nfl', 'evergame', 'spectra-civigrid', 'legal-contracts', 'operations', 'personal', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."doc_status" AS ENUM('pending', 'processing', 'indexed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"original_path" text NOT NULL,
	"category" "doc_category" NOT NULL DEFAULT 'other',
	"mime_type" text NOT NULL,
	"file_size_bytes" integer,
	"status" "doc_status" NOT NULL DEFAULT 'pending',
	"extracted_text" text,
	"page_count" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL REFERENCES "documents"("id") ON DELETE CASCADE,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer,
	"embedding" vector(512),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "doc_category_idx" ON "documents" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doc_status_idx" ON "documents" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "doc_filename_idx" ON "documents" ("filename");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunk_doc_idx" ON "document_chunks" ("document_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chunk_doc_order_idx" ON "document_chunks" ("document_id", "chunk_index");--> statement-breakpoint

-- HNSW index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS "chunk_embedding_hnsw_idx"
  ON "document_chunks"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
