import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  icon,
  action,
  href,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  href?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xl",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-24px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <div>
              {title && <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action ??
            (href && (
              <Link
                href={href}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                View <ArrowUpRight className="size-3.5" />
              </Link>
            ))}
        </header>
      )}
      <div className={cn("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
