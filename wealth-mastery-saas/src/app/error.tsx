"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-5xl">⚠️</div>
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="btn btn-primary mt-4">Try again</button>
    </div>
  );
}
