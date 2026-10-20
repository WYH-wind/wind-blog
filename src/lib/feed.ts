import "server-only";

import { env } from "@/env";
import { getDictionary, localePath, type Locale } from "@/messages";
import { listPublishedPosts } from "@/server/queries/posts";

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** RSS 构建器：zh（/feed.xml）与 en（/en/feed.xml）共用；文章内容保持单语 */
export async function buildFeedRss(locale: Locale): Promise<string> {
  const t = getDictionary(locale);
  const posts = await listPublishedPosts(20);
  const siteUrl = env.SITE_URL.replace(/\/+$/, "");
  const feedPath = localePath(locale, "/feed.xml");

  const items = posts
    .map((post) => {
      const url = `${siteUrl}${localePath(locale, `/posts/${post.slug}`)}`;
      const date = (post.publishedAt ?? post.createdAt).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${date}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Wind</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(t.feed.description)}</description>
    <language>${t.feed.language}</language>
    <atom:link href="${siteUrl}${feedPath}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
