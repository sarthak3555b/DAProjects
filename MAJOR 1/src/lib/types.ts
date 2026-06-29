/* ------------------------------------------------------------------ */
/* Core domain models for Wealth Mastery OS                            */
/* ------------------------------------------------------------------ */

export type ID = string;

export interface UserProfile {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  currentPhase: string;
  completionPercentage: number;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
}

export type NodeStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface RoadmapNode {
  id: ID;
  title: string;
  phase: string;
  description: string;
  status: NodeStatus;
  type: "CORE" | "ELECTIVE";
  difficulty: Difficulty;
  estimatedHours: number;
  completion: number; // 0-100
  dependencies: ID[];
  outcomes: string[];
  resources: ID[];
  projects: ID[];
  realWorld: string[];
  // layout hint (column / row within phase) — ELK refines this
  col: number;
  row: number;
}

export interface RoadmapEdge {
  id: ID;
  source: ID;
  target: ID;
}

export type Domain =
  | "Money"
  | "Economics"
  | "Business"
  | "Investing"
  | "Technology"
  | "Capital Allocation"
  | "Wealth Creation";

export interface ConceptNode {
  id: ID;
  label: string;
  domain: Domain;
  definition: string;
  mastery: number; // 0-100
  connections: ID[];
}

export type NewsCategory =
  | "Economy"
  | "Business"
  | "Markets"
  | "Technology"
  | "Geopolitics"
  | "International"
  | "National";

export type Impact = "HIGH" | "MEDIUM" | "LOW";

export interface NewsArticle {
  id: ID;
  title: string;
  source: string;
  imageUrl: string;
  publishedAt: string;
  category: NewsCategory;
  impact: Impact;
  summary: string;
  aiSummary: {
    what: string;
    why: string;
    matters: string;
    wealthEffect: string;
  };
  isBookmarked: boolean;
}

export type AssessmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "PASSED" | "FAILED";

export interface QuizOption {
  id: ID;
  label: string;
}

export interface QuizQuestion {
  id: ID;
  prompt: string;
  options: QuizOption[];
  correctOptionId: ID;
  explanation: string;
}

export interface Assessment {
  id: ID;
  title: string;
  description: string;
  difficulty: Difficulty;
  totalQuestions: number;
  timeLimitMinutes: number;
  status: AssessmentStatus;
  score?: number;
  questions: QuizQuestion[];
}

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";

export interface Project {
  id: ID;
  title: string;
  description: string;
  status: ProjectStatus;
  difficulty: Difficulty;
  hours: number;
  deliverables: string[];
  resources: ID[];
  tags: string[];
}

export type ResourceType = "Book" | "Course" | "Video" | "Article" | "Podcast" | "Paper";

export interface Resource {
  id: ID;
  title: string;
  author: string;
  type: ResourceType;
  domain: Domain;
  coverUrl?: string;
  durationLabel: string;
  rating: number; // 0-5
  progress: number; // 0-100
  bookmarked: boolean;
  description: string;
}

export type AchievementTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Legendary";

export interface Achievement {
  id: ID;
  title: string;
  description: string;
  tier: AchievementTier;
  xp: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
}

export interface ActivityItem {
  id: ID;
  kind: "completed" | "started" | "assessment" | "achievement" | "note" | "bookmark";
  title: string;
  detail: string;
  timestamp: string;
}

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning" | "achievement";
}

export interface JournalEntry {
  id: ID;
  title: string;
  date: string;
  preview: string;
  tags: string[];
}

export interface Goal {
  id: ID;
  label: string;
  period: "Weekly" | "Monthly" | "Yearly";
  current: number;
  target: number;
  unit: string;
}

export interface ChatMessage {
  id: ID;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name resolved in component
  badge?: number;
}
