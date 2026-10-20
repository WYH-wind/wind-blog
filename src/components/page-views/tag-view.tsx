import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PostListItem } from "@/components/post-list-item";
import { ogMeta, seoAlternates } from "@/lib/seo";
import { getDictionary, type Locale } from "@/messages";
import { getTagBySlug, listPublishedPostsByTag } from "@/server/queries/posts";

export async function TagView({ locale, slug }: { locale: Locale; slug: string }) {
  const t = getDictionary(locale);
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();
  const posts = await listPublishedPostsByTag(tag.id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">
        {t.tags.title}：<span className="text-accent">{tag.name}</span>
      </h1>
      {posts.length === 0 ? (
        <p className="text-muted">{t.tags.emptyTag}</p>
      ) : (
        <ul className="divide-y divide-line/70">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} locale={locale} />
          ))}
        </ul>
      )}
    </div>
  );
}

export async function tagMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const t = getDictionary(locale);
  const tag = await getTagBySlug(slug);
  return {
    title: tag ? `${t.tags.title}：${tag.name}` : t.post.notFoundTitle,
    alternates: seoAlternates(locale, `/tags/${slug}`),
    openGraph: ogMeta(locale),
  };
}
