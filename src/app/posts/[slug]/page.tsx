import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { PostReactions } from "@/components/post-reactions";
import { formatDate } from "@/lib/date";
import { renderMarkdown } from "@/lib/markdown";
import {
  getPostNeighbors,
  getPublishedPostBySlug,
  getPublishedRedirectTarget,
} from "@/server/queries/posts";

type PostPageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "文章不存在" };
  return { title: post.title, description: post.summary };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    // slug 曾被修改：旧链接 308 到新地址
    const target = await getPublishedRedirectTarget(slug);
    if (target) permanentRedirect(`/posts/${target}`);
    notFound();
  }

  const { html, toc, readingMinutes } = await renderMarkdown(post.content);
  const { prev, next } = await getPostNeighbors(post.publishedAt ?? post.createdAt);

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          )}
          <span>约 {readingMinutes} 分钟</span>
          {post.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-full bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </header>

      {toc.length > 2 && (
        <nav aria-label="目录" className="text-sm">
          <details>
            <summary className="cursor-pointer text-zinc-500 dark:text-zinc-400">目录</summary>
            <ul className="mt-2 space-y-1 border-l border-zinc-200 pl-4 dark:border-zinc-700">
              {toc.map((item) => (
                <li key={item.id} style={{ paddingLeft: `${(item.depth - 2) * 12}px` }}>
                  <a
                    href={`#${item.id}`}
                    className="text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </nav>
      )}

      <div
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <PostReactions slug={post.slug} initialViews={post.views} />

      <nav className="flex justify-between gap-4 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-700">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="text-zinc-600 hover:underline dark:text-zinc-400"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/posts/${next.slug}`}
            className="text-right text-zinc-600 hover:underline dark:text-zinc-400"
          >
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}
