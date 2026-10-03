import Link from "next/link";

import { formatDateShort } from "@/lib/date";

export type PostListItemData = {
  slug: string;
  title: string;
  summary: string;
  pinned: boolean;
  publishedAt: Date | null;
  tags: Array<{ tag: { id: number; name: string; slug: string } }>;
};

export function PostListItem({ post }: { post: PostListItemData }) {
  return (
    <li className="group py-5">
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
  );
}
