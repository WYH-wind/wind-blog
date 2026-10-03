import type { Metadata } from "next";
import Link from "next/link";

import { formatDateShort, SITE_TIMEZONE } from "@/lib/date";
import { listArchivedPosts } from "@/server/queries/posts";

export const metadata: Metadata = { title: "归档" };
export const revalidate = 300;

export default async function ArchivesPage() {
  const posts = await listArchivedPosts();

  // 按站点时区的年份分组
  const byYear = new Map<number, typeof posts>();
  for (const post of posts) {
    if (!post.publishedAt) continue;
    const year = Number(
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        timeZone: SITE_TIMEZONE,
      }).format(post.publishedAt),
    );
    const list = byYear.get(year) ?? [];
    list.push(post);
    byYear.set(year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-3xl tracking-wide">
        归档 <span className="ml-1 font-mono text-base text-muted">{posts.length}</span>
      </h1>
      {years.length === 0 && <p className="text-muted">还没有发布任何文章。</p>}
      {years.map((year) => (
        <section key={year} className="space-y-3">
          <h2 className="font-heading text-xl text-accent">{year}</h2>
          <ul className="space-y-2.5">
            {byYear.get(year)!.map((post) => (
              <li key={post.id} className="flex items-baseline gap-4 text-sm">
                {post.publishedAt && (
                  <time
                    dateTime={post.publishedAt.toISOString()}
                    className="shrink-0 font-mono text-muted"
                  >
                    {formatDateShort(post.publishedAt)}
                  </time>
                )}
                <Link href={`/posts/${post.slug}`} className="transition-colors hover:text-accent">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
