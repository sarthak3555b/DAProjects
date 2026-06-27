import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AffairsClient } from "@/components/affairs-client";

export const metadata = { title: "Current Affairs" };
export const dynamic = "force-dynamic";

export default async function AffairsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [news, states] = await Promise.all([
    prisma.newsItem.findMany({ where: { published: true }, orderBy: { date: "desc" } }),
    prisma.userNewsState.findMany({ where: { userId: session.user.id } }),
  ]);
  const stateMap = Object.fromEntries(states.map((s) => [s.newsId, { read: s.read, bookmarked: s.bookmarked, note: s.note ?? "" }]));
  const items = news.map((n) => ({ ...n, date: n.date.toISOString() }));
  return <AffairsClient items={items as any} initialState={stateMap} isAdmin={session.user.role === "ADMIN"} />;
}
