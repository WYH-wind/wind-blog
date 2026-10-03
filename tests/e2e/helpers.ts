import { expect, type Page } from "@playwright/test";

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin");
  // 未登录会被 proxy 送回登录页
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByRole("textbox", { name: "管理员密码" }).fill("wind-dev-2026");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
}
