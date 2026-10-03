import "server-only";

import { db } from "@/server/db";
import {
  SETTING_DEFAULTS,
  SETTING_KEYS,
  type SettingKey,
} from "@/lib/settings-schema";

export type SiteSettings = Record<SettingKey, string>;

export async function getSettings(): Promise<SiteSettings> {
  const settings: SiteSettings = { ...SETTING_DEFAULTS };
  try {
    const rows = await db.setting.findMany();
    for (const row of rows) {
      if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
        settings[row.key as SettingKey] = row.value;
      }
    }
  } catch {
    // 数据库不可用时回退默认值，保证前台仍可渲染（构建期容错）
  }
  return settings;
}
