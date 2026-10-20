import { renderMarkdown } from "@/lib/markdown";
import { ogMeta, seoAlternates } from "@/lib/seo";
import { getDictionary, type Locale } from "@/messages";
import { getSettings } from "@/server/queries/settings";

export async function AboutView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const settings = await getSettings();
  const { html } = await renderMarkdown(settings["site.about"]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">{t.about.title}</h1>
      <div
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function aboutMetadata(locale: Locale) {
  const t = getDictionary(locale);
  return {
    title: t.about.title,
    alternates: seoAlternates(locale, "/about"),
    openGraph: ogMeta(locale),
  };
}
