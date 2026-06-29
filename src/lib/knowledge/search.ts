import { db } from "@/lib/db/client";
import { documents, documentChunks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface KnowledgeChunk {
  chunkId: string;
  documentId: string;
  filename: string;
  category: string;
  content: string;
  tokenCount: number | null;
  similarity: number;
}

export interface KnowledgeSearchOptions {
  topK?: number;
  category?: string;
  minSimilarity?: number;
}

async function embedQuery(query: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY not set");

  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "voyage-3-lite",
      input: [query],
      input_type: "query",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage embed failed: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}

export async function searchKnowledge(
  query: string,
  options: KnowledgeSearchOptions = {}
): Promise<KnowledgeChunk[]> {
  const { topK = 5, minSimilarity = 0.3 } = options;

  const embedding = await embedQuery(query);
  const vectorLiteral = `[${embedding.join(",")}]`;

  // cosine similarity via pgvector — 1 - cosine_distance
  const rows = await db.execute(sql`
    SELECT
      dc.id            AS chunk_id,
      dc.document_id,
      d.filename,
      d.category,
      dc.content,
      dc.token_count,
      1 - (dc.embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'indexed'
    ${options.category ? sql`AND d.category = ${options.category}` : sql``}
    ORDER BY dc.embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `);

  return (rows as unknown[])
    .map((r: unknown) => r as Record<string, unknown>)
    .filter((r) => Number(r.similarity) >= minSimilarity)
    .map((r) => ({
      chunkId: r.chunk_id as string,
      documentId: r.document_id as string,
      filename: r.filename as string,
      category: r.category as string,
      content: r.content as string,
      tokenCount: r.token_count as number | null,
      similarity: Number(r.similarity),
    }));
}
