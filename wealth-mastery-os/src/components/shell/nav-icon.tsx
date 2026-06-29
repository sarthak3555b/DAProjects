import {
  LayoutDashboard,
  Map,
  Share2,
  Globe,
  GraduationCap,
  FolderKanban,
  Library,
  CalendarDays,
  NotebookPen,
  LineChart,
  Sparkles,
  Trophy,
  Settings,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Map,
  Share2,
  Globe,
  GraduationCap,
  FolderKanban,
  Library,
  CalendarDays,
  NotebookPen,
  LineChart,
  Sparkles,
  Trophy,
  Settings,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
