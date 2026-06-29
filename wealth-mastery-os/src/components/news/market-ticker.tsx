"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const tickers = [
  { sym: "S&P 500", val: "5,432.18", chg: 0.62 },
  { sym: "NASDAQ", val: "17,210.4", chg: 1.04 },
  { sym: "DOW", val: "39,118.9", chg: -0.18 },
  { sym: "10Y", val: "4.21%", chg: -0.03 },
  { sym: "GOLD", val: "$2,338", chg: 0.41 },
  { sym: "OIL", val: "$81.54", chg: -0.77 },
  { sym: "BTC", val: "$67,420", chg: 2.31 },
  { sym: "EUR/USD", val: "1.0842", chg: 0.12 },
  { sym: "VIX", val: "13.24", chg: -1.9 },
];

export function MarketTicker() {
  const row = [...tickers, ...tickers];
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/40 py-2 backdrop-blur-xl">
      <div className="flex w-max animate-marquee gap-8 px-4 will-change-transform hover:[animation-play-state:paused]">
        {row.map((t, i) => {
          const up = t.chg >= 0;
          return (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm">
              <span className="font-medium text-muted-foreground">{t.sym}</span>
              <span className="font-mono font-semibold">{t.val}</span>
              <span className={cn("flex items-center gap-0.5 font-mono text-xs", up ? "text-green" : "text-red")}>
                {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {Math.abs(t.chg)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
