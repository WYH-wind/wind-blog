import { z } from "zod";

/** Setting key 白名单 registry：后台只能读写这些键（docs/PLAN.md 数据模型） */
export const SETTING_KEYS = [
  "site.name",
  "site.description",
  "site.avatar",
  "site.github",
  "site.email",
  "site.about",
  "site.footer",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const SETTING_DEFAULTS: Record<SettingKey, string> = {
  "site.name": "Wind",
  "site.description": "简洁、轻盈、流动的个人博客。",
  "site.avatar": "",
  "site.github": "",
  "site.email": "",
  "site.about": "## 关于\n\n这里的一切都很简单：一栏文字，一点风。",
  "site.footer": "简洁、轻盈、流动",
};

export const settingsSchema = z.object({
  "site.name": z.string().trim().min(1, "站名不能为空").max(60),
  "site.description": z.string().trim().max(200),
  "site.avatar": z.string().trim().max(300),
  "site.github": z.string().trim().max(300),
  "site.email": z.string().trim().max(120),
  "site.about": z.string().max(20_000),
  "site.footer": z.string().trim().max(200),
});
