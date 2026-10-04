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

  test("全局搜索弹窗（任意页可开、即搜即得、回车直达）", async ({ page }) => {
    // 旧 /search 地址 → 301 回首页
    await page.goto("/search");
    await expect(page).toHaveURL(/\/$/);

    // 任意页面（友链页）点头部图标弹出，输入框自动聚焦
    await page.goto("/links");
    await page.getByRole("button", { name: "搜索" }).click();
    const input = page.getByRole("searchbox", { name: "搜索关键词" });
    await expect(input).toBeFocused();

    // 标题命中
    await input.fill("Next.js");
    await expect(page.getByRole("link", { name: /用 Next\.js 16 搭建自己的博客/ })).toBeVisible({
      timeout: 5000,
    });

    // 仅正文命中的关键词（pg_dump 只出现在文章正文里）也能搜到
    await input.fill("pg_dump");
    await expect(page.getByRole("link", { name: /PostgreSQL 18 值得关注的几个点/ })).toBeVisible({
      timeout: 5000,
    });

    // 回车打开当前项
    await input.press("Enter");
    await expect(page).toHaveURL(/\/posts\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("404 页面", async ({ page }) => {
    await page.goto("/posts/this-slug-does-not-exist");
    await expect(page.getByText("风把这一页吹走了")).toBeVisible();
  });
});
