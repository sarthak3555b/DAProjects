import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.AUTH_URL || "https://wealth-mastery-os.vercel.app";
  const nodes = await prisma.node.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  const careers = await prisma.career.findMany({ select: { slug: true } });

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/dashboard`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/roadmap`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/resources`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/career`, changeFrequency: "monthly", priority: 0.7 },
    ...nodes.map((n) => ({ url: `${base}/node/${n.slug}`, lastModified: n.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...careers.map((c) => ({ url: `${base}/career/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
