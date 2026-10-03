import Link from "next/link";

import { WindLines } from "@/components/wind-lines";
import { formatDateShort } from "@/lib/date";
import { listPublishedPosts } from "@/server/queries/posts";
import { getSettings } from "@/server/queries/settings";

export default async function Home() {
  const [posts, settings] = await Promise.all([listPublishedPosts(20), getSettings()]);

  return (
    <div className="space-y-12">
      <section className="relative pb-4 pt-8">
        <WindLines className="pointer-events-none absolute inset-x-0 -top-4 w-full opacity-80" />
        <div className="relative">
          <h1 className="font-heading text-5xl tracking-wide">{settings["site.name"]}</h1>
          <p className="mt-3 text-muted">{settings["site.description"]}</p>
        </div>
      </section>

      <ul className="divide-y divide-line/70">
        {posts.map((post) => (
          <li key={post.id} className="group py-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-lg transition-colors group-hover:text-accent">
                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                {post.pinned && (
                  <span className="ml-2 rounded-full border border-accent/30 px-1.5 py-0.5 align-middle text-xs text-accent">
                    置顶
                  </span>
                )}
              </h2>
              {post.publishedAt && (
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="shrink-0 font-mono text-sm text-muted"
                >
                  {formatDateShort(post.publishedAt)}
                </time>
              )}
            </div>
            <p className="mt-1 text-sm leading-6 text-muted">{post.summary}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="rounded-full bg-accent-soft px-2 py-0.5 text-accent transition-opacity hover:opacity-80"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
