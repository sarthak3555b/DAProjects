"use client";

import { useMemo } from "react";
import { contributionData } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const levelClass = [
  "bg-white/[0.04]",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/65",
  "bg-primary/90 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
];

const days = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function ContributionHeatmap() {
  const data = useMemo(() => contributionData(), []);
  const total = useMemo(() => data.flat().reduce((a, b) => a + b, 0), [data]);

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        <div className="mr-1 flex shrink-0 flex-col justify-between py-[2px] text-[9px] text-muted-foreground/60">
          {days.map((d, i) => (
            <span key={i} className="h-[14px] leading-[14px]">{d}</span>
          ))}
        </div>
        {data.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((v, di) => (
              <Tooltip key={di}>
                <TooltipTrigger asChild>
                  <div
                    className={`size-[14px] rounded-[3px] transition-transform duration-150 hover:scale-125 ${levelClass[v]}`}
                    role="img"
                    aria-label={`${v} sessions`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {v} {v === 1 ? "session" : "sessions"} · week {wi + 1}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{total} sessions in the last 18 weeks</span>
        <span className="flex items-center gap-1.5">
          Less
          {levelClass.map((c, i) => (
            <span key={i} className={`size-[10px] rounded-[2px] ${c}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
