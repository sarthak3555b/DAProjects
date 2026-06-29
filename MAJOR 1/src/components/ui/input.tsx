"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-surface/60 px-3.5 py-2 text-sm text-foreground shadow-sm transition-all duration-200",
        "placeholder:text-muted-foreground/70",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:bg-surface",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/** Floating-label field — premium input microinteraction. */
export interface FloatingFieldProps extends InputProps {
  label: string;
  error?: string;
}

const FloatingField = React.forwardRef<HTMLInputElement, FloatingFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const fieldId = id || React.useId();
    return (
      <div className="group relative">
        <input
          id={fieldId}
          ref={ref}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            "peer h-14 w-full rounded-xl border border-input bg-surface/60 px-3.5 pt-5 pb-1.5 text-sm text-foreground transition-all duration-200",
            "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30",
            error && "border-destructive/70 focus-visible:ring-destructive/30",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={fieldId}
          className={cn(
            "pointer-events-none absolute left-3.5 top-4 text-sm text-muted-foreground transition-all duration-200",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
          )}
        >
          {label}
        </label>
        {error && (
          <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-red">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FloatingField.displayName = "FloatingField";

export { Input, FloatingField };
