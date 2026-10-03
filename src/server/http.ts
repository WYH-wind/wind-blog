import "server-only";

import type { NextRequest } from "next/server";

/**
 * CSRF 防线之一：写方法校验 Origin 与 Host 一致（SameSite cookie 之外的补充层）。
 */
export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    throw new HttpError(403, "Missing origin");
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Invalid origin");
  }
  if (originHost !== request.headers.get("host")) {
    throw new HttpError(403, "Cross-origin request rejected");
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
