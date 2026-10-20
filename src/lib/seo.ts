import type { Metadata } from "next";

import { DEFAULT_LOCALE, localePath, type Locale } from "@/messages";

/** 每页的 hreflang/canonical/RSS：zh 无前缀、en 带 /en 前缀、x-default 指向默认语言 */
export function seoAlternates(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path),
    languages: {
      "zh-CN": localePath("zh", path),
      en: localePath("en", path),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
    types: { "application/rss+xml": localePath(locale, "/feed.xml") },
  };
}

export function ogMeta(locale: Locale): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: "Wind",
    locale: locale === "en" ? "en_US" : "zh_CN",
  };
}
