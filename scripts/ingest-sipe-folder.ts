#!/usr/bin/env npx tsx
/**
 * Ingest a local folder of documents into the SIPE knowledge base.
 * Mirrors src/app/api/sipe/ingest/route.ts (mammoth text extraction +
 * Claude classification + dedupe by playbookId + insert), but runs from
 * the CLI so it doesn't need a Clerk session.
 *
 * Supports .docx (mammoth), .txt, .md, .pdf (pdf-parse, with Claude vision
 * fallback for scanned/image PDFs), and images .png/.jpg/.jpeg/.webp/.gif
 * (Claude vision OCR).
 *
 * Reads ANTHROPIC_API_KEY and DATABASE_URL_UNPOOLED / DATABASE_URL from
 * .env.local (so secrets never go on the command line).
 *
 * Usage:
 *   npm run db:ingest-sipe -- --dry-run "<folder>"
 *   npm run db:ingest-sipe --          "<folder>"
 *   npm run db:ingest-sipe -- --ext=pdf,png "<folder>"   # only certain types
 */

import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import sharp from "sharp";
import postgres from "postgres";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, join, extname, basename } from "path";
import { createRequire } from "module";

// pdf-parse is CommonJS; load its lib entry directly to avoid its debug self-test
const requireCjs = createRequire(import.meta.url);
const pdfParse = requireCjs("pdf-parse/lib/pdf-parse.js") as (b: Buffer) => Promise<{ text: string }>;

// ── env ───────────────────────────────────────────────────────────────────────
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0 && !process.env[line.slice(0, idx).trim()]) {
      process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const folder = args.find((a) => !a.startsWith("--"));
const extArg = args.find((a) => a.startsWith("--ext="));
const extFilter = extArg
  ? new Set(extArg.slice("--ext=".length).split(",").map((e) => "." + e.trim().replace(/^\./, "").toLowerCase()))
  : null;

if (!folder) {
  process.stderr.write("Usage: npm run db:ingest-sipe -- [--dry-run] <folder>\n");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  process.stderr.write("ANTHROPIC_API_KEY not set (add it to .env.local)\n");
  process.exit(1);
}

const rawUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!rawUrl && !dryRun) {
  process.stderr.write("DATABASE_URL_UNPOOLED / DATABASE_URL not set (add to .env.local)\n");
  process.exit(1);
}
const DATABASE_URL = (rawUrl ?? "").replace(/[&?]channel_binding=[^&]*/g, "");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CLASSIFIER_MODEL = "claude-sonnet-4-6";
const CATEGORIES = ["playbook", "lesson", "pattern", "benchmark"] as const;
const VERTICALS = ["general", "venue", "workforce", "government", "technology", "community"] as const;
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const SUPPORTED = new Set([".docx", ".txt", ".md", ".pdf", ...IMAGE_EXTS]);
const VISION_MODEL = "claude-sonnet-4-6";
const VISION_PROMPT =
  "Transcribe ALL text in this document verbatim, then describe its structure, sections, tables, and any diagram/flow relationships in detail. Produce a thorough plain-text knowledge-base document. No preamble, no commentary — just the extracted content.";

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

interface Classification {
  category: string;
  vertical: string;
  applicablePhases: string[];
  tags: string[];
  playbookId: string;
  confidenceScore: number;
}

const CLASSIFY_TOOL: Anthropic.Tool = {
  name: "record_sipe_classification",
  description: "Record the structured SIPE knowledge classification for a source document.",
  input_schema: {
    type: "object",
    properties: {
      category: { type: "string", enum: [...CATEGORIES] },
      vertical: { type: "string", enum: [...VERTICALS] },
      applicablePhases: { type: "array", items: { type: "string" } },
      tags: { type: "array", items: { type: "string" } },
      playbookId: { type: "string" },
      confidenceScore: { type: "number" },
    },
    required: ["category", "vertical", "applicablePhases", "tags", "playbookId", "confidenceScore"],
  },
};

// ── vision (OCR) extraction via Claude ────────────────────────────────────────
const IMG_MEDIA: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
};

async function visionExtractImage(file: string): Promise<string> {
  // Normalize to JPEG ≤1568px long edge — keeps every image well under the 5MB API limit
  const jpeg = await sharp(readFileSync(file))
    .resize({ width: 1568, height: 1568, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  const res = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 8192,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpeg.toString("base64") } },
        { type: "text", text: VISION_PROMPT },
      ],
    }],
  });
  return res.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n");
}

async function visionExtractPdf(file: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 8192,
    messages: [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: readFileSync(file).toString("base64") } },
        { type: "text", text: VISION_PROMPT },
      ],
    }],
  });
  return res.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("\n");
}

async function extractText(file: string): Promise<string> {
  const ext = extname(file).toLowerCase();
  if (ext === ".docx") {
    const { value } = await mammoth.extractRawText({ buffer: readFileSync(file) });
    return value;
  }
  if (IMAGE_EXTS.has(ext)) {
    return visionExtractImage(file); // images are always OCR'd via Claude vision
  }
  if (ext === ".pdf") {
    const { text } = await pdfParse(readFileSync(file));
    // Scanned/image PDFs have no text layer → fall back to Claude's PDF vision
    if (text.trim().split(/\s+/).filter(Boolean).length >= 20) return text;
    process.stdout.write(`   (no text layer — using vision OCR)\n`);
    return visionExtractPdf(file);
  }
  return readFileSync(file, "utf-8");
}

async function classify(filename: string, text: string): Promise<Classification> {
  const response = await anthropic.messages.create({
    model: CLASSIFIER_MODEL,
    max_tokens: 1024,
    tools: [CLASSIFY_TOOL],
    tool_choice: { type: "tool", name: CLASSIFY_TOOL.name },
    messages: [
      {
        role: "user",
        content: `Classify the following SIPE knowledge document for a consulting knowledge base. Source filename: "${filename}".\n\n<document>\n${text.slice(0, 24000)}\n</document>`,
      },
    ],
  });
  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Classifier did not return a tool_use block");
  const raw = toolUse.input as Partial<Classification>;
  return {
    category: CATEGORIES.includes(raw.category as (typeof CATEGORIES)[number]) ? (raw.category as string) : "lesson",
    vertical: VERTICALS.includes(raw.vertical as (typeof VERTICALS)[number]) ? (raw.vertical as string) : "general",
    applicablePhases: Array.isArray(raw.applicablePhases) ? raw.applicablePhases.map(String) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => slugify(String(t))).filter(Boolean) : [],
    playbookId: slugify(raw.playbookId || filename.replace(/\.[^.]+$/, "")),
    confidenceScore: typeof raw.confidenceScore === "number" ? Math.max(0, Math.min(1, raw.confidenceScore)) : 0.5,
  };
}

async function main() {
  const dir = resolve(folder!);
  const matches = (f: string) => {
    const e = extname(f).toLowerCase();
    return SUPPORTED.has(e) && (!extFilter || extFilter.has(e));
  };
  const files = readdirSync(dir)
    .map((f) => join(dir, f))
    .filter((f) => statSync(f).isFile() && matches(f));

  const skipped = readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile() && !matches(join(dir, f)));
  process.stdout.write(`${files.length} ingestable file(s); ${skipped.length} unsupported (skipped): ${skipped.map((f) => extname(f)).filter((e, i, a) => a.indexOf(e) === i).join(", ")}\n\n`);

  const sql = dryRun ? null : postgres(DATABASE_URL, { max: 1, ssl: DATABASE_URL.includes("neon.tech") ? "require" : undefined });

  let ingested = 0, dupes = 0, errors = 0;
  try {
    for (const file of files) {
      const name = basename(file);
      try {
        const text = (await extractText(file)).trim();
        if (!text) { process.stdout.write(`⏭️  ${name} — empty\n`); continue; }
        const c = await classify(name, text);

        if (sql) {
          const [dupe] = await sql`SELECT id FROM sipe_entries WHERE playbook_id = ${c.playbookId} LIMIT 1`;
          if (dupe) { dupes++; process.stdout.write(`⏭️  ${name} → ${c.playbookId} (duplicate)\n`); continue; }
          await sql`INSERT INTO sipe_entries (category, content, tags, vertical, applicable_phases, confidence_score, playbook_id)
            VALUES (${c.category}, ${text}, ${JSON.stringify(c.tags)}::jsonb, ${c.vertical}, ${JSON.stringify(c.applicablePhases)}::jsonb, ${c.confidenceScore}, ${c.playbookId})`;
        }
        ingested++;
        process.stdout.write(`${dryRun ? "📝" : "✅"} ${name} → ${c.category}/${c.vertical} · ${c.playbookId} · [${c.tags.slice(0, 4).join(", ")}…] conf ${c.confidenceScore}\n`);
      } catch (e) {
        errors++;
        process.stdout.write(`❌ ${name} — ${e instanceof Error ? e.message : String(e)}\n`);
      }
    }
  } finally {
    if (sql) await sql.end();
  }

  process.stdout.write(`\n${dryRun ? "[dry-run] would ingest" : "ingested"}: ${ingested} · duplicates: ${dupes} · errors: ${errors}\n`);
}

main().catch((e) => {
  process.stderr.write(`ingest failed: ${e instanceof Error ? e.stack || e.message : String(e)}\n`);
  process.exit(1);
});
