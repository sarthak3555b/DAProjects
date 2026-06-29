import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-6 text-center">
      <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-60" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" aria-hidden />
      <p className="relative font-display text-[7rem] font-extrabold leading-none gradient-text sm:text-[10rem]">404</p>
      <h1 className="relative mt-2 font-display text-2xl font-bold tracking-tight">This corner of the universe is empty</h1>
      <p className="relative mt-2 max-w-md text-muted-foreground">
        The page you're looking for has drifted out of orbit. Let's get you back on the map.
      </p>
      <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="gradient" asChild>
          <Link href="/dashboard"><Home /> Back to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/roadmap"><Compass /> Open Roadmap</Link>
        </Button>
      </div>
    </main>
  );
}
