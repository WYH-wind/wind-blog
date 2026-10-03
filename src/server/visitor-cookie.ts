import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import { isProd } from "@/env";

// __Host- 前缀要求 Secure + 无 Domain + Path=/（生产满足）；本地 http 开发用无前缀名
export const VISITOR_COOKIE_NAME = isProd ? "__Host-wind-visitor" : "wind-visitor";

export function getVisitorId(request: NextRequest): string | null {
  const value = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  return value && value.length >= 8 ? value : null;
}

export function newVisitorId(): string {
  return randomUUID();
}

export const visitorCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
