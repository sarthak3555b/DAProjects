import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-6xl font-extrabold">404</h1>
      <p className="max-w-md text-muted">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/dashboard" className="btn btn-primary mt-4">Go to Dashboard</Link>
    </div>
  );
}
