import "server-only";

import { db } from "@/server/db";

export async function listVisibleFriendLinks() {
  return db.friendLink.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
  });
}
