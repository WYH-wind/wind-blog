import { describe, expect, it } from "vitest";

import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("raw HTML 被转义/丢弃，不产生可执行标签", async () => {
    const { html } = await renderMarkdown(
      "正文 <script>alert(1)</script> 与 <img src=x onerror=alert(1)>",
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
  });

  it("javascript: 链接不成立", async () => {
    const { html } = await renderMarkdown("[点我](javascript:alert(1))");
    expect(html).not.toMatch(/href=["']javascript:/i);
  });

  it("标题生成 id 且 TOC 与之一致", async () => {
    const md = "## 概览\n\n内容\n\n### 细节\n\n更多";
    const { html, toc } = await renderMarkdown(md);
    expect(html).toContain('<h2 id="概览">');
    expect(toc).toEqual([
      { id: "概览", text: "概览", depth: 2 },
      { id: "细节", text: "细节", depth: 3 },
    ]);
  });

  it("代码块带 Shiki 双主题变量", async () => {
    const { html } = await renderMarkdown("```ts\nconst a = 1;\n```");
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });

  it("未知语言回落 plaintext 不抛错", async () => {
    const { html } = await renderMarkdown("```no-such-lang\nx\n```");
    expect(html).toContain("<pre");
  });

  it("GFM 表格渲染", async () => {
    const { html } = await renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(html).toContain("<table>");
  });

  it("变色/高亮指令渲染为白名单标签", async () => {
    const { html } = await renderMarkdown(":red[危险] 与 :mark[重点] 与 :blue[链接感]");
    expect(html).toContain('<span class="wind-c-red">危险</span>');
    expect(html).toContain("<mark>重点</mark>");
    expect(html).toContain('<span class="wind-c-blue">链接感</span>');
  });

  it("白名单外的指令整体丢弃，不产生标签", async () => {
    const { html } = await renderMarkdown(
      "前 :javascript[alert(1)] 后\n\n:::evil\n隐藏内容\n:::",
    );
    expect(html).not.toContain("alert(1)");
    expect(html).not.toContain("隐藏内容");
    expect(html).not.toContain("<javascript");
    // 未知指令不能落成默认的 <div> 包裹
    expect(html).not.toContain("<div");
  });

  it("指令属性不透传（防 XSS）", async () => {
    const { html } = await renderMarkdown(':red[文字]{onclick="alert(1)"}');
    expect(html).toContain("wind-c-red");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("alert");
  });
});

describe("阅读时长", () => {
  it("中文按字数估算", async () => {
    const md = "字".repeat(800);
    const { readingMinutes } = await renderMarkdown(md);
    expect(readingMinutes).toBe(2);
  });

  it("代码块不计入", async () => {
    const { readingMinutes } = await renderMarkdown("```ts\nconst a = 1;\n```\n十个汉字左右。");
    expect(readingMinutes).toBe(1);
  });
});
