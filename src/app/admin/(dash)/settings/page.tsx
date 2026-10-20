import { SettingsPanel } from "@/components/admin/settings-panel";
import { renderMarkdown } from "@/lib/markdown";
import { getSettings } from "@/server/queries/settings";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const { html } = await renderMarkdown(settings["site.about"]);

  return (
    <div className="mx-auto max-w-xl">
      <SettingsPanel settings={settings} aboutHtml={html} />
    </div>
  );
}
