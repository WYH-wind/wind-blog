import { NextResponse, type NextRequest } from "next/server";

import { HttpError, assertSameOrigin, clientIp } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { getPublishedPostIdBySlug } from "@/server/queries/posts";
import { recordView } from "@/server/mutations/views";
import {
  VISITOR_COOKIE_NAME,
  getVisitorId,
  newVisitorId,
  visitorCookieOptions,
} from "@/server/visitor-cookie";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 403;
    return NextResponse.json({ error: "forbidden" }, { status });
  }

  const { slug } = await params;
  const post = await getPublishedPostIdBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const visitorId = getVisitorId(request) ?? newVisitorId();
  if (!rateLimit(`view:${visitorId}`, 120) || !rateLimit(`view-ip:${clientIp(request)}`, 240)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const views = await recordView(post.id, visitorId);

  const response = NextResponse.json({ views });
  response.cookies.set(VISITOR_COOKIE_NAME, visitorId, visitorCookieOptions);
  return response;
}
