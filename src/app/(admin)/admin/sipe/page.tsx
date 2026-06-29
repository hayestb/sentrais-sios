"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, FileText, CheckCircle2, AlertCircle, SkipForward } from "lucide-react";

interface FileResult {
  filename: string;
  playbookId: string | null;
  status: "ingested" | "skipped-duplicate" | "skipped-empty" | "unsupported" | "error";
  detail?: string;
}

interface IngestResponse {
  ingested: number;
  total: number;
  results: FileResult[];
}

const ACCEPT = ".docx,.txt,.md";
const ACCEPTED_EXT = [".docx", ".txt", ".md"];

const STATUS_META: Record<
  FileResult["status"],
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  ingested: { label: "Ingested", className: "text-[#00D4AA]", Icon: CheckCircle2 },
  "skipped-duplicate": { label: "Duplicate", className: "text-amber-400", Icon: SkipForward },
  "skipped-empty": { label: "Empty", className: "text-muted-foreground", Icon: SkipForward },
  unsupported: { label: "Unsupported", className: "text-muted-foreground", Icon: AlertCircle },
  error: { label: "Error", className: "text-red-400", Icon: AlertCircle },
};

export default function SipeIngestPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (files: File[]) => {
    const valid = files.filter((f) =>
      ACCEPTED_EXT.some((ext) => f.name.toLowerCase().endsWith(ext))
    );
    if (valid.length === 0) {
      setError("No supported files (.docx, .txt, .md) selected.");
      return;
    }

    setError(null);
    setResult(null);
    setUploading(true);
    try {
      const formData = new FormData();
      valid.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/sipe/ingest", { method: "POST", body: formData });
      const data = (await res.json()) as IngestResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Upload failed (${res.status})`);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (uploading) return;
      upload(Array.from(e.dataTransfer.files));
    },
    [upload, uploading]
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">SIPE Knowledge Ingestion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload .docx, .txt, or .md documents — each is classified by Claude and added to the SIPE knowledge base.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div
            role="button"
            tabIndex={0}
            onClick={() => !uploading && inputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !uploading) inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors cursor-pointer ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? (
              <>
                <Loader2 size={28} className="text-primary animate-spin" />
                <p className="text-sm text-foreground">Classifying and ingesting…</p>
                <p className="text-xs text-muted-foreground">This may take a moment per file.</p>
              </>
            ) : (
              <>
                <Upload size={28} className="text-primary" />
                <p className="text-sm text-foreground">
                  Drag &amp; drop files here, or <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">Accepts .docx, .txt, and .md</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) upload(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/5 px-3 py-2 text-xs text-red-400">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {result && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={13} className="text-primary" /> Ingestion Results
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {result.ingested} of {result.total} file{result.total === 1 ? "" : "s"} ingested
              {result.total - result.ingested > 0 ? ` · ${result.total - result.ingested} skipped` : ""}.
            </p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Filename</th>
                  <th className="pb-2 font-medium">Playbook ID</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => {
                  const meta = STATUS_META[r.status];
                  const Icon = meta.Icon;
                  return (
                    <tr key={`${r.filename}-${i}`} className="border-b border-border/50 last:border-0">
                      <td className="py-2 text-foreground truncate max-w-[16rem]">{r.filename}</td>
                      <td className="py-2 font-mono text-muted-foreground">
                        {r.playbookId ?? "—"}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant="outline"
                          className={`text-[9px] h-4 px-1.5 gap-1 ${meta.className}`}
                          title={r.detail}
                        >
                          <Icon size={10} /> {meta.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
