import "server-only";

import { db } from "@/server/db";
import type { ReactionKind } from "@/generated/prisma/enums";

export type ReactionCounts = Record<ReactionKind, number>;
export type MyReactions = Record<ReactionKind, boolean>;

export async function getReactionCounts(postId: number): Promise<ReactionCounts> {
  const rows = await db.reaction.groupBy({
    by: ["kind"],
    where: { postId },
    _count: { kind: true },
  });
  return {
    LIKE: rows.find((r) => r.kind === "LIKE")?._count.kind ?? 0,
    FAVORITE: rows.find((r) => r.kind === "FAVORITE")?._count.kind ?? 0,
  };
}

export async function getVisitorReactions(postId: number, visitorId: string): Promise<MyReactions> {
  const rows = await db.reaction.findMany({
    where: { postId, visitorId },
    select: { kind: true },
  });
  return {
    LIKE: rows.some((r) => r.kind === "LIKE"),
    FAVORITE: rows.some((r) => r.kind === "FAVORITE"),
  };
}
