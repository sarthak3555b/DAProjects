import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { computeProgress } from "@/lib/progress";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let streak = 0;
  try {
    const prog = await computeProgress(session.user.id);
    streak = prog.streak;
  } catch {
    /* DB not seeded yet — shell still renders */
  }

  return (
    <AppShell user={{ name: session.user.name, email: session.user.email, role: session.user.role }} streak={streak}>
      {children}
    </AppShell>
  );
}
