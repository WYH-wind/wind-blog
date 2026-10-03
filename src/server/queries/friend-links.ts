import "server-only";

import { db } from "@/server/db";

export async function listVisibleFriendLinks() {
  return db.friendLink.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** 后台用：包含隐藏项 */
export async function listAllFriendLinks() {
  return db.friendLink.findMany({ orderBy: { sortOrder: "asc" } });
}
