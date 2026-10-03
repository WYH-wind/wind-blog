import { expect, test } from "@playwright/test";

import { loginAsAdmin, logout } from "./helpers";

const TITLE = "E2E 发布链路验证";
const SLUG_PREFIX = "e2e-publish-check";

test.describe("发布链路（登录 → 新建 → 草稿 → 发布跳转 → 删除）", () => {
  test("完整走一遍后台写作发布", async ({ page }) => {
    await loginAsAdmin(page);

    // 前置清理：上次失败运行可能残留同名文章
    await page.goto("/admin");
    const stale = page.locator("li", { has: page.getByRole("link", { name: TITLE }) });
    while ((await stale.count()) > 0) {
      page.once("dialog", (dialog) => dialog.accept());
      await stale.first().getByRole("button", { name: "删除" }).click();
      await stale
        .first()
        .waitFor({ state: "detached", timeout: 5000 })
        .catch(() => {});
    }

    // 新建
    await page.getByRole("link", { name: "新建文章" }).click();
    await page.getByRole("textbox", { name: "标题" }).fill(TITLE);
    const slugBox = page.getByRole("textbox", { name: "slug" });
    await expect(slugBox).not.toBeEmpty();
    await slugBox.fill(SLUG_PREFIX);
    await page
      .getByRole("textbox", { name: "正文" })
      .fill("## E2E 标题\n\n一段含 `行内代码` 的正文。\n\n```ts\nconst e2e = true;\n```");

    // 标签选择器：输入新标签回车添加
    const tagInput = page.getByRole("textbox", { name: "新标签" });
    await tagInput.fill("测试");
    await tagInput.press("Enter");
    await expect(page.getByRole("button", { name: "移除标签 测试" })).toBeVisible();

    // 先存草稿：跳到编辑页
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/\d+\/edit$/, { timeout: 10_000 });

    // 发布：二次确认后跳到前台文章页
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "发布" }).click();
    await expect(page).toHaveURL(new RegExp(`/posts/${SLUG_PREFIX}$`), { timeout: 10_000 });

    // 前台列表出现
    await page.goto("/");
    await expect(page.getByRole("link", { name: TITLE })).toBeVisible();

    // 文章页渲染（Markdown 管线 + Shiki）
    await page.goto(`/posts/${SLUG_PREFIX}`);
    await expect(page.getByRole("heading", { name: "E2E 标题" })).toBeVisible();
    await expect(page.locator("pre.shiki")).toHaveCount(1);
    await expect(page.getByRole("button", { name: /赞/ })).toBeVisible();

    // 清理：删除（confirm 必须在点击前注册，Playwright 默认 dismiss）
    await page.goto("/admin");
    const row = page.locator("li", { has: page.getByRole("link", { name: TITLE }) }).first();
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "删除" }).click();
    await expect(page.getByRole("link", { name: TITLE })).toHaveCount(0);

    await logout(page);
  });
});
