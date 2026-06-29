"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, SlidersHorizontal, Bookmark } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import type { NewsCategory, Impact } from "@/lib/types";
import { PageHeader } from "@/components/shell/page-header";
import { MarketTicker } from "@/components/news/market-ticker";
import { NewsCard } from "@/components/news/news-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/lib/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories: ("All" | NewsCategory)[] = [
  "All", "Economy", "Business", "Markets", "Technology", "Geopolitics", "International", "National",
];

export default function CurrentAffairsPage() {
  const online = useOnlineStatus();
  const { data, status, refetch } = useQuery({ queryKey: queryKeys.news(), queryFn: () => api.news() });

  const [category, setCategory] = useState<"All" | NewsCategory>("All");
  const [impacts, setImpacts] = useState<Set<Impact>>(new Set(["HIGH", "MEDIUM", "LOW"]));
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.filter((a) => (category === "All" ? true : a.category === category));
    list = list.filter((a) => impacts.has(a.impact));
    if (bookmarkedOnly) list = list.filter((a) => a.isBookmarked);
    list = [...list].sort((a, b) =>
      sortNewest
        ? +new Date(b.publishedAt) - +new Date(a.publishedAt)
        : +new Date(a.publishedAt) - +new Date(b.publishedAt),
    );
    return list;
  }, [data, category, impacts, bookmarkedOnly, sortNewest]);

  const toggleImpact = (i: Impact) =>
    setImpacts((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Current Affairs"
        title="The world, decoded for wealth"
        description="Markets, economics, and geopolitics — with AI summaries on what it means for your capital."
      />

      <MarketTicker />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={category} onValueChange={(v) => setCategory(v as "All" | NewsCategory)}>
          <TabsList className="flex-wrap">
            {categories.map((c) => (
              <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant={bookmarkedOnly ? "primary" : "secondary"} size="sm" onClick={() => setBookmarkedOnly((v) => !v)}>
            <Bookmark className="size-4" /> Saved
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm"><SlidersHorizontal className="size-4" /> Filters</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Impact level</DropdownMenuLabel>
              {(["HIGH", "MEDIUM", "LOW"] as Impact[]).map((i) => (
                <DropdownMenuCheckboxItem key={i} checked={impacts.has(i)} onCheckedChange={() => toggleImpact(i)}>
                  {i.charAt(0) + i.slice(1).toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by date</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={sortNewest} onCheckedChange={() => setSortNewest(true)}>Newest first</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={!sortNewest} onCheckedChange={() => setSortNewest(false)}>Oldest first</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* States */}
      {!online && status !== "success" ? (
        <OfflineState />
      ) : status === "pending" ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/50 p-0 sm:flex-row">
              <Skeleton className="h-44 w-full rounded-2xl sm:w-52" />
              <div className="flex-1 space-y-3 p-5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : status === "error" ? (
        <ErrorState title="Couldn't load the news feed" onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No stories match your filters"
          description="Try a different category or reset your filters."
          action={<Button variant="secondary" onClick={() => { setCategory("All"); setImpacts(new Set(["HIGH", "MEDIUM", "LOW"])); setBookmarkedOnly(false); }}>Reset filters</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((a, i) => (
            <NewsCard key={a.id} article={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
