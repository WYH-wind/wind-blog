import "server-only";

import { db } from "@/server/db";

const POST_TAGS_INCLUDE = { tags: { include: { tag: true } } } as const;

export async function listPublishedPosts(limit: number, offset = 0) {
  return db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ pinned: "desc" }, { pinOrder: "asc" }, { publishedAt: "desc" }],
    skip: offset,
    take: limit,
    include: POST_TAGS_INCLUDE,
  });
}

export async function countPublishedPosts() {
  return db.post.count({ where: { status: "PUBLISHED" } });
}

export async function getPublishedPostBySlug(slug: string) {
  return db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: POST_TAGS_INCLUDE,
  });
}

/**
 * 相邻文章：prev = 更早一篇，next = 更新一篇
 */
export async function getPostNeighbors(publishedAt: Date) {
  const [prev, next] = await Promise.all([
    db.post.findFirst({
      where: { status: "PUBLISHED", publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    db.post.findFirst({
      where: { status: "PUBLISHED", publishedAt: { gt: publishedAt } },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);
  return { prev, next };
}
