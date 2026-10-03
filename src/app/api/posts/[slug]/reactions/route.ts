import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { HttpError, assertSameOrigin, clientIp } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { getReactionCounts, getVisitorReactions } from "@/server/queries/reactions";
import { getPublishedPostIdBySlug } from "@/server/queries/posts";
import { toggleReaction } from "@/server/mutations/reactions";
import {
  VISITOR_COOKIE_NAME,
  getVisitorId,
  newVisitorId,
  visitorCookieOptions,
} from "@/server/visitor-cookie";

type RouteContext = { params: Promise<{ slug: string }> };

const bodySchema = z.object({ kind: z.enum(["LIKE", "FAVORITE"]) });

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const post = await getPublishedPostIdBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const visitorId = getVisitorId(_request);
  const [counts, mine] = await Promise.all([
    getReactionCounts(post.id),
    visitorId
      ? getVisitorReactions(post.id, visitorId)
      : Promise.resolve({ LIKE: false, FAVORITE: false }),
  ]);

  return NextResponse.json({ counts, mine });
}

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
  if (
    !rateLimit(`reaction:${visitorId}`, 30) ||
    !rateLimit(`reaction-ip:${clientIp(request)}`, 60)
  ) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let kind: "LIKE" | "FAVORITE";
  try {
    ({ kind } = bodySchema.parse(await request.json()));
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const result = await toggleReaction(post.id, visitorId, kind);
  const counts = await getReactionCounts(post.id);

  const response = NextResponse.json({ ...result, counts });
  response.cookies.set(VISITOR_COOKIE_NAME, visitorId, visitorCookieOptions);
  return response;
}
