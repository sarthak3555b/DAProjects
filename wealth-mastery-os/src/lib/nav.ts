import type { NavItem } from "./types";

/** Primary application navigation. Icon names map to lucide-react components. */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Roadmap", href: "/roadmap", icon: "Map" },
  { label: "Knowledge Graph", href: "/knowledge-graph", icon: "Share2" },
  { label: "Current Affairs", href: "/current-affairs", icon: "Globe" },
  { label: "Assessments", href: "/assessments", icon: "GraduationCap" },
  { label: "Projects", href: "/projects", icon: "FolderKanban" },
  { label: "Resources", href: "/resources", icon: "Library" },
  { label: "Study Planner", href: "/study-planner", icon: "CalendarDays" },
  { label: "Journal", href: "/journal", icon: "NotebookPen" },
  { label: "Analytics", href: "/analytics", icon: "LineChart" },
  { label: "AI Mentor", href: "/ai-mentor", icon: "Sparkles" },
  { label: "Achievements", href: "/achievements", icon: "Trophy" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Learn",
    items: navItems.filter((i) =>
      ["/dashboard", "/roadmap", "/knowledge-graph", "/assessments"].includes(i.href),
    ),
  },
  {
    label: "Explore",
    items: navItems.filter((i) =>
      ["/current-affairs", "/resources", "/projects"].includes(i.href),
    ),
  },
  {
    label: "Reflect",
    items: navItems.filter((i) =>
      ["/study-planner", "/journal", "/analytics", "/ai-mentor"].includes(i.href),
    ),
  },
  {
    label: "You",
    items: navItems.filter((i) => ["/achievements", "/settings"].includes(i.href)),
  },
];

export const breadcrumbLabels: Record<string, string> = Object.fromEntries(
  navItems.map((i) => [i.href.replace("/", ""), i.label]),
);
