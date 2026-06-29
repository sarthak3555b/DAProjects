"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_8px_30px_-8px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(59,130,246,0.8)] hover:-translate-y-0.5",
        secondary:
          "glass text-foreground hover:bg-white/[0.06] hover:-translate-y-0.5",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-white/[0.04] hover:border-white/20",
        ghost: "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_8px_30px_-8px_rgba(239,68,68,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(239,68,68,0.8)] hover:-translate-y-0.5",
        gradient:
          "bg-gradient-to-r from-primary via-purple to-primary bg-[length:200%_auto] text-white shadow-glow hover:bg-[position:100%_0] hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, type, onClick, onMouseEnter, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      sfx.click();
      if (ripple && !asChild) {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 600);
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "overflow-hidden")}
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        onClick={handleClick}
        onMouseEnter={(e) => {
          sfx.hover();
          onMouseEnter?.(e);
        }}
        {...props}
      >
        {children}
        {ripple &&
          !asChild &&
          ripples.map((r) => (
            <span
              key={r.id}
              className="pointer-events-none absolute size-0 -translate-x-1/2 -translate-y-1/2 animate-[ripple_0.6s_ease-out] rounded-full bg-white/30"
              style={{ left: r.x, top: r.y }}
            />
          ))}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
