import "server-only";

import { db } from "@/server/db";
import type { ReactionKind } from "@/generated/prisma/enums";

export type ReactionToggleResult = {
  active: boolean;
  count: number;
};

export async function toggleReaction(
  postId: number,
  visitorId: string,
  kind: ReactionKind,
): Promise<ReactionToggleResult> {
  const existing = await db.reaction.findUnique({
    where: { postId_kind_visitorId: { postId, kind, visitorId } },
    select: { id: true },
  });

  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
  } else {
    // 并发下唯一约束兜底：撞上即视为已激活
    try {
      await db.reaction.create({ data: { postId, kind, visitorId } });
    } catch {
      // P2002 unique violation — 已存在
    }
  }

  const count = await db.reaction.count({ where: { postId, kind } });
  return { active: !existing, count };
}
