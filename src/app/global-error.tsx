"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <div className="text-4xl font-bold text-red-400">!</div>
          <h2 className="text-lg font-semibold">Critical Error</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error.message || "A critical error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="text-[10px] text-muted-foreground/60 font-mono">Digest: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 text-sm rounded border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
