import type { Metadata } from "next";

import { listVisibleFriendLinks } from "@/server/queries/friend-links";

export const metadata: Metadata = { title: "友链" };
export const revalidate = 300;

export default async function LinksPage() {
  const links = await listVisibleFriendLinks();

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">友链</h1>
      {links.length === 0 ? (
        <p className="text-muted">还没有友链，风还在路上。</p>
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
