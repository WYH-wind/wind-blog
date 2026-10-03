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

// ============ Phase 3：标签 / 归档 / 搜索 ============

export async function listTagsWithCount() {
  return db.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });
}

export async function getTagBySlug(slug: string) {
  return db.tag.findUnique({ where: { slug } });
}

export async function listPublishedPostsByTag(tagId: number) {
  return db.post.findMany({
    where: { status: "PUBLISHED", tags: { some: { tagId } } },
    orderBy: [{ pinned: "desc" }, { pinOrder: "asc" }, { publishedAt: "desc" }],
    include: POST_TAGS_INCLUDE,
  });
}

export async function listArchivedPosts() {
  return db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, publishedAt: true },
  });
}

export type SearchHit = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  publishedAt: Date | null;
};

/**
 * 全文搜索：pg_trgm + ILIKE（中文子串匹配；q 已在调用侧校验长度）。
 * LIKE 通配符（% _ \）必须转义，防止用户输入改变匹配语义。
 */
export async function searchPublishedPosts(q: string): Promise<SearchHit[]> {
  const escaped = q.replace(/[\\%_]/g, (m) => `\\${m}`);
  const pattern = `%${escaped}%`;
  return db.$queryRaw<SearchHit[]>`
    SELECT p.id, p.slug, p.title, p.summary, p."publishedAt"
    FROM "Post" p
    WHERE p.status = 'PUBLISHED'
      AND (p.title ILIKE ${pattern} ESCAPE '\\' OR p.summary ILIKE ${pattern} ESCAPE '\\')
    ORDER BY p."publishedAt" DESC NULLS LAST
    LIMIT 20
  `;
}

/** 轻量查询：仅取 id（API 路由用） */
export async function getPublishedPostIdBySlug(slug: string) {
  return db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  });
}

/** 旧 slug → 新 slug（仅指向已发布文章；防自环） */
export async function getPublishedRedirectTarget(oldSlug: string): Promise<string | null> {
  const row = await db.postRedirect.findUnique({
    where: { oldSlug },
    select: { post: { select: { slug: true, status: true } } },
  });
  if (!row || row.post.status !== "PUBLISHED" || row.post.slug === oldSlug) return null;
  return row.post.slug;
}
