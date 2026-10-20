import { expect, test } from "@playwright/test";

test.describe("界面层双语（F2：zh 默认无前缀，/en 前缀）", () => {
  test("/en 首页英文 UI，内容保持单语", async ({ page }) => {
    await page.goto("/en");

    // 导航与 UI 为英文
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tags" })).toBeVisible();

    // <html lang> 随 /en 切换（客户端 effect）
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("en");

    // 文章内容不翻译：seed 文章原题出现在 /en 列表
    await expect(page.getByRole("link", { name: /用 Next\.js 16 搭建自己的博客/ })).toBeVisible();
  });

  test("切换器往返不丢路径", async ({ page }) => {
    await page.goto("/posts/build-blog-with-nextjs-16");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/posts\/build-blog-with-nextjs-16$/);
    await page.getByRole("link", { name: "中文" }).click();
    await expect(page).toHaveURL(/\/posts\/build-blog-with-nextjs-16$/);
  });

  test("hreflang 三条齐全，RSS 双 feed", async ({ page }) => {
    const res = await page.goto("/tags");
    const html = (await res!.text()).toLowerCase();
    expect(html).toContain('hreflang="zh-cn"');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="x-default"');

    // 英文页的 RSS 指向 /en/feed.xml（metadataBase 会解析为绝对地址）
    const enRes = await page.goto("/en/about");
    const enHtml = await enRes!.text();
    expect(enHtml).toContain("/en/feed.xml");
  });

  test("/en 文章页英文 UI（阅读时长/目录/点赞）", async ({ page }) => {
    await page.goto("/en/posts/build-blog-with-nextjs-16");
    await expect(page.getByText(/min read/)).toBeVisible();
    await expect(page.locator("aside").getByText("Contents", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Like/ })).toBeVisible();
    // 中文站点的「赞」不出现
    await expect(page.getByRole("button", { name: /^赞/ })).toHaveCount(0);
  });

  test("404 双语", async ({ page }) => {
    await page.goto("/en/no-such-page");
    await expect(page.getByText("The wind took this page away")).toBeVisible();
    await page.goto("/no-such-page");
    await expect(page.getByText("风把这一页吹走了")).toBeVisible();
  });
});
