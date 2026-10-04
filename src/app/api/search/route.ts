import { NextResponse, type NextRequest } from "next/server";

import { normalizeSearchQuery } from "@/lib/search";
import { clientIp } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { searchPublishedPosts } from "@/server/queries/posts";

/** 全局搜索 API：q ≤ 50 字符（安全标准同旧搜索页），内存限流防刷 */
export async function GET(request: NextRequest) {
  if (!rateLimit(`search-ip:${clientIp(request)}`, 30)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const q = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));
  if (!q) return NextResponse.json({ hits: [] });

  const hits = await searchPublishedPosts(q);
  return NextResponse.json(
    {
      hits: hits.map((hit) => ({
        slug: hit.slug,
        title: hit.title,
        summary: hit.summary,
        publishedAt: hit.publishedAt?.toISOString() ?? null,
        matched: hit.matched,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
