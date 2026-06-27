import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey(d: Date = new Date()) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function fmtHours(h: number) {
  if (h == null) return "0h";
  if (h < 1) return Math.round(h * 60) + "m";
  return (Math.round(h * 10) / 10).toLocaleString("en-IN") + "h";
}

export function fmtInr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
  MASTER: "Master",
};

export const DIFFICULTY_LEVEL: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
  MASTER: 5,
};

export function relativeTime(date: Date | string | null) {
  if (!date) return "never";
  const dt = new Date(date);
  const diff = Date.now() - dt.getTime();
  const day = 86400000;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < day) return Math.floor(diff / 3600000) + "h ago";
  if (diff < day * 2) return "yesterday";
  if (diff < day * 30) return Math.floor(diff / day) + "d ago";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
