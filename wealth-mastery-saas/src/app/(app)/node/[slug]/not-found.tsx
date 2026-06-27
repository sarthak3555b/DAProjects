import Link from "next/link";

export default function NodeNotFound() {
  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <div className="text-5xl">🔍</div>
      <h2 className="mt-4 font-display text-2xl font-bold">Node not found</h2>
      <p className="mt-2 text-sm text-muted">This node may have been removed or renamed.</p>
      <Link href="/roadmap" className="btn btn-primary mt-6">Back to Roadmap</Link>
    </div>
  );
}
