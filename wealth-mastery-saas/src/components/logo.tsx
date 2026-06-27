import { cn } from "@/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-learning to-project font-display text-lg font-extrabold text-white shadow-[0_8px_24px_-8px_hsl(var(--learning)/0.8)]">
        W
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-sm font-bold">Wealth Mastery</div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Operating System</div>
        </div>
      )}
    </div>
  );
}
