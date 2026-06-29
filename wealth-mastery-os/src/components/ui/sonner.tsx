"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group glass-strong !rounded-2xl !border-white/10 !text-foreground !shadow-glow",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground !rounded-lg",
          cancelButton: "!bg-white/5 !text-muted-foreground !rounded-lg",
          success: "!text-green",
          error: "!text-red",
        },
      }}
      {...props}
    />
  );
}
