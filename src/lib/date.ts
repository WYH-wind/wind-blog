// 站点展示时区：数据库内部一律 UTC（timestamptz），展示统一用站点时区
export const SITE_TIMEZONE = "Asia/Shanghai";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: SITE_TIMEZONE,
});

export function formatDate(date: Date): string {
  return formatter.format(date);
}
