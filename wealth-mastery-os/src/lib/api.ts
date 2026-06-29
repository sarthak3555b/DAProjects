import { sleep } from "./utils";
import {
  achievements,
  activityFeed,
  assessments,
  conceptNodes,
  currentUser,
  goals,
  journalEntries,
  newsArticles,
  notifications,
  projects,
  resources,
  roadmapEdges,
  roadmapNodes,
} from "./mock-data";

/**
 * Simulated data layer. Mimics network latency so loading / skeleton states
 * are exercised, and supports a forced-error mode for testing error + retry UI.
 */

const LATENCY = 700;

function maybeFail(key: string) {
  if (typeof window === "undefined") return;
  const forced = window.localStorage?.getItem("wm.forceError");
  if (forced === "all" || forced === key) {
    throw new Error(`Failed to load ${key}. The connection was interrupted.`);
  }
}

async function resolve<T>(key: string, data: T, latency = LATENCY): Promise<T> {
  await sleep(latency);
  maybeFail(key);
  return data;
}

export const api = {
  user: () => resolve("user", currentUser, 400),
  roadmap: () => resolve("roadmap", { nodes: roadmapNodes, edges: roadmapEdges }),
  concepts: () => resolve("concepts", conceptNodes),
  news: (category?: string) =>
    resolve(
      "news",
      category && category !== "All"
        ? newsArticles.filter((n) => n.category === category)
        : newsArticles,
    ),
  assessments: () => resolve("assessments", assessments),
  projects: () => resolve("projects", projects),
  resources: () => resolve("resources", resources),
  achievements: () => resolve("achievements", achievements),
  activity: () => resolve("activity", activityFeed, 500),
  notifications: () => resolve("notifications", notifications, 350),
  journal: () => resolve("journal", journalEntries),
  goals: () => resolve("goals", goals, 450),
};

export const queryKeys = {
  user: ["user"] as const,
  roadmap: ["roadmap"] as const,
  concepts: ["concepts"] as const,
  news: (c?: string) => ["news", c ?? "All"] as const,
  assessments: ["assessments"] as const,
  projects: ["projects"] as const,
  resources: ["resources"] as const,
  achievements: ["achievements"] as const,
  activity: ["activity"] as const,
  notifications: ["notifications"] as const,
  journal: ["journal"] as const,
  goals: ["goals"] as const,
};
