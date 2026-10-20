import { ogMeta, seoAlternates } from "@/lib/seo";
import { getDictionary, type Locale } from "@/messages";
import { listVisibleFriendLinks } from "@/server/queries/friend-links";

export async function LinksView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const links = await listVisibleFriendLinks();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">{t.links.title}</h1>
      {links.length === 0 ? (
        <p className="text-muted">{t.links.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-accent/40"
              >
                <p className="font-heading text-base transition-colors group-hover:text-accent">
                  {link.name}
                </p>
                {link.description && (
                  <p className="mt-0.5 text-sm text-muted">{link.description}</p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function linksMetadata(locale: Locale) {
  const t = getDictionary(locale);
  return {
    title: t.links.title,
    alternates: seoAlternates(locale, "/links"),
    openGraph: ogMeta(locale),
  };
}
