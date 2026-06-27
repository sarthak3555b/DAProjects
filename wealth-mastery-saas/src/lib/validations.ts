import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotSchema = z.object({ email: z.string().email() });

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const progressSchema = z.object({
  nodeId: z.string().min(1),
  status: z.enum(["AVAILABLE", "IN_PROGRESS", "COMPLETED"]).optional(),
  quizPassed: z.boolean().optional(),
  checklist: z.record(z.boolean()).optional(),
});

export const sessionLogSchema = z.object({
  minutes: z.number().int().min(1).max(1440),
  note: z.string().max(200).optional(),
  nodeId: z.string().optional(),
});

export const journalSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  learned: z.string().max(8000).optional(),
  confused: z.string().max(8000).optional(),
  built: z.string().max(8000).optional(),
  observed: z.string().max(8000).optional(),
  apply: z.string().max(8000).optional(),
  questions: z.string().max(8000).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  minutes: z.number().int().min(0).max(1440).optional(),
});

export const goalSchema = z.object({
  weeklyGoalMin: z.number().int().min(0).max(100000).optional(),
  monthlyGoalMin: z.number().int().min(0).max(1000000).optional(),
  yearlyGoalMin: z.number().int().min(0).max(10000000).optional(),
  booksCompleted: z.number().int().min(0).max(100000).optional(),
});

export const noteSchema = z.object({ nodeId: z.string(), body: z.string().max(20000) });
export const bookmarkSchema = z.object({ nodeId: z.string(), favorite: z.boolean().optional() });

export const newsSchema = z.object({
  id: z.string().optional(),
  category: z.enum(["Economy", "Business", "Markets", "Technology", "Geopolitics"]),
  title: z.string().min(1).max(200),
  what: z.string().max(4000).optional(),
  why: z.string().max(4000).optional(),
  matters: z.string().max(4000).optional(),
  wealth: z.string().max(4000).optional(),
  tags: z.array(z.string()).optional(),
});

export const nodeAdminSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  moduleId: z.string().min(1),
  description: z.string().max(8000).optional(),
  purpose: z.string().max(8000).optional(),
  whyItMatters: z.string().max(8000).optional(),
  hours: z.number().min(0).max(200),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"]),
  outcomes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export const resourceAdminSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  source: z.string().optional(),
  type: z.string().min(1),
  phaseCode: z.string().optional(),
  url: z.string().url(),
  note: z.string().optional(),
});

export const mentorSchema = z.object({ text: z.string().min(1).max(4000) });
