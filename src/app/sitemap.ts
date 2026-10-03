import type { MetadataRoute } from "next";

import { env } from "@/env";
import { listArchivedPosts } from "@/server/queries/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = env.SITE_URL.replace(/\/+$/, "");
  const posts = await listArchivedPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/archives`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/links`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...posts
      .filter((p) => p.publishedAt)
      .map((p) => ({
        url: `${siteUrl}/posts/${p.slug}`,
        lastModified: p.publishedAt!,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
