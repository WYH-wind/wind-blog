// 站点展示时区：数据库内部一律 UTC（timestamptz），展示统一用站点时区
export const SITE_TIMEZONE = "Asia/Shanghai";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: SITE_TIMEZONE,
});

const shortFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: SITE_TIMEZONE,
});

export function formatDate(date: Date): string {
  return formatter.format(date);
}

/** YYYY-MM-DD（站点时区），用于列表/归档 */
export function formatDateShort(date: Date): string {
  return shortFormatter.format(date);
}
