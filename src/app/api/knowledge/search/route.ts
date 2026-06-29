import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { searchKnowledge } from "@/lib/knowledge/search";

const SearchSchema = z.object({
  query: z.string().min(1).max(1000),
  topK: z.number().int().min(1).max(20).optional().default(5),
  category: z.enum([
    "sentrais-core", "nfl", "evergame", "spectra-civigrid",
    "legal-contracts", "operations", "personal", "other",
  ]).optional(),
  minSimilarity: z.number().min(0).max(1).optional().default(0.3),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { query, topK, category, minSimilarity } = parsed.data;

  const chunks = await searchKnowledge(query, { topK, category, minSimilarity });

  return NextResponse.json({ query, results: chunks, count: chunks.length });
}
