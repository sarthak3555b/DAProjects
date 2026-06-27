import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings-client";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [settings, profile] = await Promise.all([
    prisma.settings.findUnique({ where: { userId: session.user.id } }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
  ]);
  return (
    <SettingsClient
      user={{ name: session.user.name ?? "", email: session.user.email ?? "", role: session.user.role }}
      settings={{
        reducedMotion: settings?.reducedMotion ?? false,
        notifications: settings?.notifications ?? true,
        aiEnabled: settings?.aiEnabled ?? false,
        aiProvider: settings?.aiProvider ?? "local",
        weeklyGoalMin: settings?.weeklyGoalMin ?? 240,
        monthlyGoalMin: settings?.monthlyGoalMin ?? 960,
        yearlyGoalMin: settings?.yearlyGoalMin ?? 11520,
        booksCompleted: settings?.booksCompleted ?? 0,
      }}
      startedAt={profile?.startedAt ? profile.startedAt.toISOString() : null}
    />
  );
}
