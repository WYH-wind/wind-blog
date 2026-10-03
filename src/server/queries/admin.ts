import "server-only";

import { db } from "@/server/db";

/** 后台查询：含草稿，仅管理界面使用（读取侧也必须过 requireAdmin 的页面/动作） */
export async function listAllPosts() {
  return db.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      pinned: true,
      views: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

export async function getPostById(id: number) {
  return db.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}
