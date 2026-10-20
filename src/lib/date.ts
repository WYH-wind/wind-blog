// 站点展示时区：数据库内部一律 UTC（timestamptz），展示统一用站点时区
import type { Locale } from "@/messages";

export const SITE_TIMEZONE = "Asia/Shanghai";

const formatters: Record<Locale, Intl.DateTimeFormat> = {
  zh: new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: SITE_TIMEZONE,
  }),
  en: new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: SITE_TIMEZONE,
  }),
};

// YYYY-MM-DD 与语言无关（列表/归档/搜索结果统一使用）
const shortFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: SITE_TIMEZONE,
});

/** 中文「2026年9月20日」/ 英文 "Sep 20, 2026" */
export function formatDate(date: Date, locale: Locale = "zh"): string {
  return formatters[locale].format(date);
}

export function formatDateShort(date: Date): string {
  return shortFormatter.format(date);
}
