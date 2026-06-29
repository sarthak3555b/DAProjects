"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bookmark, Share2, Clock, ChevronDown } from "lucide-react";
import type { NewsArticle, Impact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { timeAgo, cn } from "@/lib/utils";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";

const impactStyle: Record<Impact, { variant: "red" | "orange" | "default"; label: string }> = {
  HIGH: { variant: "red", label: "High impact" },
  MEDIUM: { variant: "orange", label: "Medium impact" },
  LOW: { variant: "default", label: "Low impact" },
};

const summaryRows = [
  { key: "what", label: "What happened?" },
  { key: "why", label: "Why did it happen?" },
  { key: "matters", label: "Why does it matter?" },
  { key: "wealthEffect", label: "How it affects wealth creation" },
] as const;

export function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
  const [open, setOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(article.isBookmarked);
  const impact = impactStyle[article.impact];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-card/50 backdrop-blur-xl transition-colors hover:border-white/15"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-52">
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent sm:bg-gradient-to-r" />
          <Badge variant={impact.variant} className="absolute left-3 top-3">{impact.label}</Badge>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{article.source}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="size-3" /> {timeAgo(article.publishedAt)}</span>
            <Badge variant="outline" className="ml-auto">{article.category}</Badge>
          </div>

          <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{article.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>

          <div className="mt-auto flex items-center gap-2 pt-4">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              AI Summary
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            <span className="flex-1" />
            <button
              onClick={() => { setBookmarked((v) => !v); sfx.click(); toast(bookmarked ? "Removed bookmark" : "Bookmarked"); }}
              aria-label="Bookmark"
              aria-pressed={bookmarked}
              className={cn("rounded-lg p-2 transition-colors hover:bg-white/5", bookmarked ? "text-primary" : "text-muted-foreground")}
            >
              <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
            </button>
            <button
              onClick={() => { sfx.click(); toast.success("Link copied"); }}
              aria-label="Share"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden border-t border-border/50"
      >
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {summaryRows.map((row) => (
            <div key={row.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs font-semibold text-primary">{row.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{article.aiSummary[row.key]}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.article>
  );
}
