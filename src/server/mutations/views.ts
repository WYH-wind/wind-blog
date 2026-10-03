import "server-only";

import { db } from "@/server/db";

/**
 * 浏览量：PostView 是事实来源（postId+visitorId+day 唯一），
 * INSERT ON CONFLICT DO NOTHING 命中（返回行数 > 0）才原子 +1 缓存计数，天然防并发重复。
 */
export async function recordView(postId: number, visitorId: string): Promise<number> {
  return db.$transaction(async (tx) => {
    const inserted = await tx.$executeRaw`
      INSERT INTO "PostView" ("postId", "visitorId", "day")
      VALUES (${postId}, ${visitorId}, CURRENT_DATE)
      ON CONFLICT DO NOTHING
    `;
    if (inserted > 0) {
      await tx.post.update({
        where: { id: postId },
        data: { views: { increment: 1 } },
      });
    }
    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { views: true },
    });
    return post?.views ?? 0;
  });
}
