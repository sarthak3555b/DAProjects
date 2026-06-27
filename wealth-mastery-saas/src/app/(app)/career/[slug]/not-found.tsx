import Link from "next/link";

export default function CareerNotFound() {
  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <div className="text-5xl">🔍</div>
      <h2 className="mt-4 font-display text-2xl font-bold">Career path not found</h2>
      <Link href="/career" className="btn btn-primary mt-6">Back to Career Explorer</Link>
    </div>
  );
}
