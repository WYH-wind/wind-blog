import Link from "next/link";

import { formatDate } from "@/lib/date";
import { listPublishedPosts } from "@/server/queries/posts";

export default async function Home() {
  const posts = await listPublishedPosts(20);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Wind</h1>
        <p className="text-zinc-600 dark:text-zinc-400">简洁、轻盈、流动的个人博客。</p>
      </section>

      <section className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="space-y-1">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-medium">
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()} className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(post.publishedAt)}
                </time>
              )}
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">{post.summary}</p>
            <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {post.tags.map(({ tag }) => (
                <span key={tag.id}>{tag.name}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
