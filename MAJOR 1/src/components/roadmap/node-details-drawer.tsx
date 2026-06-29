"use client";

import { toast } from "sonner";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  FlaskConical,
  GitBranch,
  Globe2,
  PlayCircle,
  Target,
  NotebookPen,
} from "lucide-react";
import type { RoadmapNode } from "@/lib/types";
import { resources as allResources, projects as allProjects } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { sfx } from "@/lib/sound";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h4>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}

export function NodeDetailsDrawer({
  node,
  open,
  onOpenChange,
}: {
  node: RoadmapNode | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!node) return null;

  const nodeResources = allResources.filter((r) => node.resources.includes(r.id));
  const nodeProjects = allProjects.filter((p) => node.projects.includes(p.id));
  const prereqTitles = node.dependencies;

  const primaryAction =
    node.status === "COMPLETED" ? "Review" : node.status === "IN_PROGRESS" ? "Continue" : node.status === "LOCKED" ? "Locked" : "Start";

  const statusVariant = { COMPLETED: "green", IN_PROGRESS: "primary", AVAILABLE: "default", LOCKED: "outline" } as const;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border/50 bg-gradient-to-b from-surface/60 to-transparent">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[node.status]}>{node.status.replace("_", " ").toLowerCase()}</Badge>
            <Badge variant="outline">{node.phase}</Badge>
          </div>
          <SheetTitle className="mt-1 text-xl">{node.title}</SheetTitle>
          <SheetDescription>{node.description}</SheetDescription>
          {(node.status === "IN_PROGRESS" || node.status === "COMPLETED") && (
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Completion</span>
                <span>{node.completion}%</span>
              </div>
              <Progress value={node.completion} indicatorClassName={node.status === "COMPLETED" ? "from-green to-green" : undefined} />
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-6 pb-24">
            <Section icon={<Target className="size-3.5" />} title="Learning Outcomes">
              <ul className="space-y-1.5">
                {node.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon={<GitBranch className="size-3.5" />} title="Prerequisites">
              {prereqTitles.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {prereqTitles.map((id) => (
                    <Badge key={id} variant="default">{id}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">None — you can start anytime.</p>
              )}
            </Section>

            <Section icon={<BookOpen className="size-3.5" />} title="Resources">
              {nodeResources.length ? (
                <ul className="space-y-2">
                  {nodeResources.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <BookOpen className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.author} · {r.type}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No linked resources.</p>
              )}
            </Section>

            <Section icon={<FlaskConical className="size-3.5" />} title="Projects & Assignments">
              {nodeProjects.length ? (
                <ul className="space-y-1.5">
                  {nodeProjects.map((p) => (
                    <li key={p.id} className="flex items-start gap-2">
                      <FlaskConical className="mt-0.5 size-4 shrink-0 text-orange" />
                      <span>{p.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No projects for this module.</p>
              )}
            </Section>

            <Section icon={<Globe2 className="size-3.5" />} title="Real-world Applications">
              <ul className="space-y-1.5">
                {node.realWorld.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Globe2 className="mt-0.5 size-4 shrink-0 text-cyan-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon={<NotebookPen className="size-3.5" />} title="Reflections & Tests">
              <p className="text-muted-foreground">
                Capture reflections in your journal and validate mastery with the linked assessment after completion.
              </p>
            </Section>
          </div>
        </ScrollArea>

        {/* Sticky actions */}
        <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-border/50 bg-card/90 p-4 backdrop-blur-xl">
          <Button
            variant={node.status === "LOCKED" ? "outline" : "gradient"}
            className="flex-1"
            disabled={node.status === "LOCKED"}
            onClick={() => {
              sfx.complete();
              toast.success(`${primaryAction} — ${node.title}`);
            }}
          >
            <PlayCircle /> {primaryAction}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Bookmark module"
            onClick={() => {
              sfx.click();
              toast(`Bookmarked “${node.title}”`);
            }}
          >
            <Bookmark />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
