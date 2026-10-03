import "server-only";

import { HttpError } from "@/server/http";
import { isAuthenticated } from "@/server/auth/session";

/**
 * 双层授权的内层：每个写库的 Server Action / Route Handler 必须显式调用。
 * proxy.ts 只是粗筛，绝不能作为唯一授权层（docs/PLAN.md 安全标准）。
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new HttpError(401, "Unauthorized");
  }
}
