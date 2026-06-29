import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import { db } from "@/lib/db/client";
import { sipeEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentRole } from "@/lib/auth/current-user";

export const runtime = "nodejs";
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CLASSIFIER_MODEL = "claude-sonnet-4-6";

const CATEGORIES = ["playbook", "lesson", "pattern", "benchmark"] as const;
const VERTICALS = [
  "general",
  "venue",
  "workforce",
  "government",
  "technology",
  "community",
] as const;

interface Classification {
  category: string;
  vertical: string;
  applicablePhases: string[];
  tags: string[];
  playbookId: string;
  confidenceScore: number;
}

interface FileResult {
  filename: string;
  playbookId: string | null;
  status: "ingested" | "skipped-duplicate" | "skipped-empty" | "unsupported" | "error";
  detail?: string;
}

const SUPPORTED = new Set([".docx", ".txt", ".md"]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function extractText(file: File, ext: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  if (ext === ".docx") {
    const { value } = await mammoth.extractRawText({
      buffer: Buffer.from(arrayBuffer),
    });
    return value;
  }
  // .txt / .md are plain text
  return Buffer.from(arrayBuffer).toString("utf-8");
}

const CLASSIFY_TOOL: Anthropic.Tool = {
  name: "record_sipe_classification",
  description:
    "Record the structured SIPE knowledge classification for a source document.",
  input_schema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: [...CATEGORIES],
        description:
          "playbook = repeatable how-to procedure; lesson = a learned insight or cautionary takeaway; pattern = a recurring structural approach; benchmark = quantified reference data.",
      },
      vertical: {
        type: "string",
        enum: [...VERTICALS],
        description:
          "The industry vertical the content applies to; use 'general' if cross-vertical.",
      },
      applicablePhases: {
        type: "array",
        items: { type: "string" },
        description:
          "Engagement phases this applies to, e.g. discovery, diagnostic, design, implementation, evaluation, closeout.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description:
          "Between 5 and 10 lowercase kebab-case topical tags describing the content.",
      },
      playbookId: {
        type: "string",
        description:
          "A short, descriptive, lowercase kebab-case slug uniquely identifying this knowledge item (e.g. 'venue-throughput-bottleneck').",
      },
      confidenceScore: {
        type: "number",
        description:
          "Your confidence from 0 to 1 that this classification is accurate and the content is high-signal.",
      },
    },
    required: [
      "category",
      "vertical",
      "applicablePhases",
      "tags",
      "playbookId",
      "confidenceScore",
    ],
  },
};

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

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Classifier did not return a tool_use block");
  }

  const raw = toolUse.input as Partial<Classification>;

  const category = CATEGORIES.includes(raw.category as (typeof CATEGORIES)[number])
    ? (raw.category as string)
    : "lesson";
  const vertical = VERTICALS.includes(raw.vertical as (typeof VERTICALS)[number])
    ? (raw.vertical as string)
    : "general";
  const applicablePhases = Array.isArray(raw.applicablePhases)
    ? raw.applicablePhases.map(String)
    : [];
  const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => slugify(String(t))).filter(Boolean) : [];
  const playbookId = slugify(raw.playbookId || filename.replace(/\.[^.]+$/, ""));
  const confidenceScore =
    typeof raw.confidenceScore === "number"
      ? Math.max(0, Math.min(1, raw.confidenceScore))
      : 0.5;

  return { category, vertical, applicablePhases, tags, playbookId, confidenceScore };
}

export async function POST(req: NextRequest) {
  const role = await getCurrentRole();
  if (role !== "sysadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results: FileResult[] = [];
  let ingested = 0;

  for (const file of files) {
    const ext = extOf(file.name);
    if (!SUPPORTED.has(ext)) {
      results.push({ filename: file.name, playbookId: null, status: "unsupported" });
      continue;
    }

    try {
      const text = (await extractText(file, ext)).trim();
      if (!text) {
        results.push({ filename: file.name, playbookId: null, status: "skipped-empty" });
        continue;
      }

      const cls = await classify(file.name, text);

      // Skip duplicates by playbookId
      const [dupe] = await db
        .select({ id: sipeEntries.id })
        .from(sipeEntries)
        .where(eq(sipeEntries.playbookId, cls.playbookId))
        .limit(1);

      if (dupe) {
        results.push({
          filename: file.name,
          playbookId: cls.playbookId,
          status: "skipped-duplicate",
        });
        continue;
      }

      await db.insert(sipeEntries).values({
        category: cls.category,
        content: text,
        tags: cls.tags,
        vertical: cls.vertical,
        applicablePhases: cls.applicablePhases,
        confidenceScore: cls.confidenceScore,
        playbookId: cls.playbookId,
      });

      ingested += 1;
      results.push({
        filename: file.name,
        playbookId: cls.playbookId,
        status: "ingested",
      });
    } catch (error) {
      results.push({
        filename: file.name,
        playbookId: null,
        status: "error",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ ingested, total: files.length, results });
}
