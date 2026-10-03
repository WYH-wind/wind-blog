import type { Metadata } from "next";

import { renderMarkdown } from "@/lib/markdown";
import { getSettings } from "@/server/queries/settings";

export const metadata: Metadata = { title: "关于" };
export const revalidate = 300;

export default async function AboutPage() {
  const settings = await getSettings();
  const { html } = await renderMarkdown(settings["site.about"]);

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">关于</h1>
      <div
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
