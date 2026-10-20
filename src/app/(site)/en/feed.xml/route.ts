import { buildFeedRss } from "@/lib/feed";

export const revalidate = 3600;

export async function GET() {
  const xml = await buildFeedRss("en");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
