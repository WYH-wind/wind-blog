import "server-only";

import { db } from "@/server/db";

/**
 * Setting key 白名单 registry：后台只能读写这些键。
 * 新增站点配置时在此登记 key 与默认值。
 */
export const SETTING_DEFAULTS = {
  "site.name": "Wind",
  "site.description": "简洁、轻盈、流动的个人博客。",
  "site.avatar": "",
  "site.github": "",
  "site.email": "",
  "site.about": "## 关于\n\n这里的一切都很简单：一栏文字，一点风。",
  "site.footer": "简洁、轻盈、流动",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;

export async function getSettings(): Promise<SiteSettings> {
  const settings: SiteSettings = { ...SETTING_DEFAULTS };
  try {
    const rows = await db.setting.findMany();
    for (const row of rows) {
      if (row.key in settings) {
        settings[row.key as SettingKey] = row.value;
      }
    }
  } catch {
    // 数据库不可用时回退默认值，保证前台仍可渲染（构建期容错）
  }
  return settings;
}
