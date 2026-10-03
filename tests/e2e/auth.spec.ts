import { expect, test } from "@playwright/test";

import { loginAsAdmin, logout } from "./helpers";

test.describe("管理后台登录", () => {
  test("未登录访问后台重定向登录页", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("错误密码提示且不进入后台", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("textbox", { name: "管理员密码" }).fill("wrong-password");
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page.getByText("密码不正确")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("正确密码进入后台并可退出", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("heading", { name: "文章管理" })).toBeVisible();
    await logout(page);
  });

  test("已登录访问登录页回仪表盘", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin$/);
    await logout(page);
  });
});
