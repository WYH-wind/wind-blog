import { db } from "@/server/db";

/**
 * 存活 + DB 可达性；不暴露任何内部细节（docs/PLAN.md 安全标准）。
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
