import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "标签" };
export const revalidate = 300;

import { listTagsWithCount } from "@/server/queries/posts";

export default async function TagsPage() {
  const tags = await listTagsWithCount();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">标签</h1>
      {tags.length === 0 ? (
        <p className="text-muted">还没有任何标签。</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm transition-colors hover:border-accent/40 hover:text-accent"
            >
              {tag.name}
              <span className="ml-1.5 font-mono text-xs text-muted">{tag._count.posts}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
