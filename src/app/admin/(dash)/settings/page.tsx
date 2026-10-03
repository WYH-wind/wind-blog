import { saveSettingsFormAction } from "@/server/actions/settings";
import { getSettings } from "@/server/queries/settings";

const field =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-heading text-2xl tracking-wide">站点设置</h1>

      <form action={saveSettingsFormAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">站点名称</span>
          <input name="site.name" defaultValue={settings["site.name"]} className={field} required />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">一句话简介</span>
          <input
            name="site.description"
            defaultValue={settings["site.description"]}
            className={field}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">GitHub 主页</span>
          <input name="site.github" defaultValue={settings["site.github"]} className={field} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">联系邮箱</span>
          <input name="site.email" defaultValue={settings["site.email"]} className={field} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">页脚文案</span>
          <input name="site.footer" defaultValue={settings["site.footer"]} className={field} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">关于页（Markdown）</span>
          <textarea
            name="site.about"
            defaultValue={settings["site.about"]}
            rows={10}
            className={`${field} font-mono leading-6`}
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2 text-sm text-background transition-opacity hover:opacity-90"
        >
          保存设置
        </button>
      </form>
    </div>
  );
}
