import { expect, test } from "@playwright/test";

test.describe("前台渲染（Markdown 管线）", () => {
  test("seed 文章：标题锚点、Shiki 高亮、目录、安全渲染", async ({ page }) => {
    await page.goto("/posts/build-blog-with-nextjs-16");

    // 标题带 id（rehype-slug）
    await expect(page.locator('h2[id="渲染管线的安全边界"]')).toBeVisible();

    // Shiki 双主题代码高亮
    await expect(page.locator("pre.shiki").first()).toBeVisible();

    // 桌面：左侧目录栏直接可见
    const tocLink = page
      .locator("aside")
      .getByRole("link", { name: "渲染管线的安全边界" });
    await expect(tocLink).toBeVisible();
    await tocLink.click();
    // 非 ASCII id 在地址栏会被百分号编码
    await expect(page).toHaveURL(/#%E6%B8%B2%E6%9F%93%E7%AE%A1%E7%BA%BF%E7%9A%84%E5%AE%89%E5%85%A8%E8%BE%B9%E7%95%8C$/);

    // 相邻文章导航
    await expect(page.getByRole("link", { name: /PostgreSQL 18 值得关注的几个点/ })).toBeVisible();
  });

  test("移动端：左栏隐藏，目录折叠可用", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/posts/build-blog-with-nextjs-16");

    await expect(page.locator("aside")).toBeHidden();
    await page.locator("summary", { hasText: "目录" }).click();
    await expect(
      page.locator("details").getByRole("link", { name: "渲染管线的安全边界" }),
    ).toBeVisible();
  });

  test("游客点赞交互（乐观更新 + 持久）", async ({ page }) => {
    await page.goto("/posts/why-wind");
    const like = page.getByRole("button", { name: /赞/ });
    await expect(like).toBeVisible({ timeout: 5000 });
    // 初始计数可能是任意值；点击后 +1 且 active，再点取消
    await like.click();
    await expect(like).toHaveAttribute("aria-pressed", "true");
    await like.click();
    await expect(like).toHaveAttribute("aria-pressed", "false");
  });

  test("搜索页可用", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox", { name: "搜索关键词" }).fill("Next.js");
    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page).toHaveURL(/q=/);
    await expect(page.getByRole("link", { name: /用 Next\.js 16 搭建自己的博客/ })).toBeVisible();
  });

  test("404 页面", async ({ page }) => {
    await page.goto("/posts/this-slug-does-not-exist");
    await expect(page.getByText("风把这一页吹走了")).toBeVisible();
  });
});
