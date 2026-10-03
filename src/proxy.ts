import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// proxy 独立于应用渲染运行，不应共享 server-only 模块——
// 这里直接读 process.env（全项目仅此一处例外，见 docs/PLAN.md）。
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-wind-session" : "wind-session";

/**
 * /admin 粗筛：未登录重定向登录页，已登录访问登录页回仪表盘。
 * 真正的授权在 requireAdmin()（每个 Server Action / Route Handler 内部）。
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let authed = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
      authed = true;
    } catch {
      authed = false;
    }
  }

  const { pathname } = request.nextUrl;
  if (!authed && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (authed && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
