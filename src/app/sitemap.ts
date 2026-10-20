import type { MetadataRoute } from "next";

import { env } from "@/env";
import { localePath } from "@/messages";
import { listArchivedPosts } from "@/server/queries/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = env.SITE_URL.replace(/\/+$/, "");
  const posts = await listArchivedPosts();

  const staticPaths: Array<{
    path: string;
    changeFrequency: "daily" | "weekly" | "monthly";
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/tags", changeFrequency: "weekly", priority: 0.5 },
    { path: "/archives", changeFrequency: "weekly", priority: 0.5 },
    { path: "/links", changeFrequency: "monthly", priority: 0.3 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  ];

  /** 同一页面的 zh / en 互为 alternates（zh 无前缀为默认） */
  function entry(
    path: string,
    changeFrequency: "daily" | "weekly" | "monthly",
    priority: number,
    lastModified?: Date,
  ): MetadataRoute.Sitemap[number] {
    return {
      url: `${siteUrl}${localePath("zh", path)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          "zh-CN": `${siteUrl}${localePath("zh", path)}`,
          en: `${siteUrl}${localePath("en", path)}`,
          "x-default": `${siteUrl}${localePath("zh", path)}`,
        },
      },
    };
  }

  return [
    ...staticPaths.map(({ path, changeFrequency, priority }) =>
      entry(path, changeFrequency, priority),
    ),
    ...posts
      .filter((p) => p.publishedAt)
      .map((p) => entry(`/posts/${p.slug}`, "monthly", 0.8, p.publishedAt!)),
  ];
}
