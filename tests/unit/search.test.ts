import { describe, expect, it } from "vitest";

import { escapeLikePattern, normalizeSearchQuery } from "@/lib/search";

describe("escapeLikePattern", () => {
  it("转义 LIKE 通配符", () => {
    expect(escapeLikePattern("100% 全部_win\\dir")).toBe("100\\% 全部\\_win\\\\dir");
  });

  it("普通文本不变", () => {
    expect(escapeLikePattern("Next.js 16")).toBe("Next.js 16");
  });
});

describe("normalizeSearchQuery", () => {
  it("去首尾空白并截断到 50 字符", () => {
    expect(normalizeSearchQuery("  hello  ")).toBe("hello");
    expect(normalizeSearchQuery("好".repeat(80)).length).toBe(50);
  });

  it("空输入安全", () => {
    expect(normalizeSearchQuery(undefined)).toBe("");
    expect(normalizeSearchQuery(null)).toBe("");
  });
});
