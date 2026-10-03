import { describe, expect, it } from "vitest";

import { slugFromTitle } from "@/lib/slug";

describe("slugFromTitle", () => {
  it("中文标题转拼音", () => {
    expect(slugFromTitle("为什么给博客起名「Wind」")).toBe("wei-shen-me-gei-bo-ke-qi-ming-wind");
  });

  it("中英混合保留英文与数字", () => {
    const slug = slugFromTitle("用 Next.js 16 搭建博客");
    expect(slug).toMatch(/^yong-nextjs-16-da-jian-bo-ke$/);
  });

  it("全符号标题回退随机 ID", () => {
    expect(slugFromTitle("!!!???")).toMatch(/^post-[a-z0-9]+$/);
  });

  it("连续连字符收敛且去首尾", () => {
    expect(slugFromTitle("a -- b")).toBe("a-b");
  });

  it("长度上限 80", () => {
    expect(slugFromTitle("很长".repeat(60)).length).toBeLessThanOrEqual(80);
  });
});
