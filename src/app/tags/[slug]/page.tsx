import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostListItem } from "@/components/post-list-item";
import { getTagBySlug, listPublishedPostsByTag } from "@/server/queries/posts";

type TagPageProps = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  return { title: tag ? `标签：${tag.name}` : "标签不存在" };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const posts = await listPublishedPostsByTag(tag.id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">
        标签：<span className="text-accent">{tag.name}</span>
      </h1>
      {posts.length === 0 ? (
        <p className="text-muted">这个标签下还没有文章。</p>
      ) : (
        <ul className="divide-y divide-line/70">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
