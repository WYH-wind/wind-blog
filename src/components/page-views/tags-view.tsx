import Link from "next/link";

import { ogMeta, seoAlternates } from "@/lib/seo";
import { getDictionary, localePath, type Locale } from "@/messages";
import { listTagsWithCount } from "@/server/queries/posts";

export async function TagsView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const tags = await listTagsWithCount();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">{t.tags.title}</h1>
      {tags.length === 0 ? (
        <p className="text-muted">{t.tags.empty}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={localePath(locale, `/tags/${tag.slug}`)}
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

export function tagsMetadata(locale: Locale) {
  const t = getDictionary(locale);
  return {
    title: t.tags.title,
    alternates: seoAlternates(locale, "/tags"),
    openGraph: ogMeta(locale),
  };
}
