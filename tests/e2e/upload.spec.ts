import sharp from "sharp";
import { expect, test } from "@playwright/test";

import { loginAsAdmin, logout } from "./helpers";

test.describe("图片上传（编辑器内插入）", () => {
  test("上传图片被压缩转 WebP 并插入正文", async ({ page }) => {
    await loginAsAdmin(page);

    // 生成一张 3000x1000 的 PNG，验证服务端 sharp 压缩
    const png = await sharp({
      create: { width: 3000, height: 1000, channels: 3, background: { r: 90, g: 170, b: 170 } },
    })
      .png()
      .toBuffer();

    await page.goto("/admin/posts/new");
    await page.getByRole("textbox", { name: "标题" }).fill("E2E 上传验证（不保存）");
    await page.setInputFiles('input[type="file"]', {
      name: "test.png",
      mimeType: "image/png",
      buffer: png,
    });

    // 插入成功提示 + 正文出现上传 URL
    await expect(page.getByText("图片已插入")).toBeVisible();
    const content = await page.getByRole("textbox", { name: "正文" }).inputValue();
    expect(content).toMatch(/!\[\]\(\/api\/uploads\/\d{4}\/\d{2}\/\d{2}\/[0-9a-f]{16}\.webp\)/);

    // 取出 URL 请求该图片，确认是 webp 且最长边 ≤ 2000
    const url = content.match(/\/api\/uploads\/\d{4}\/\d{2}\/\d{2}\/[0-9a-f]{16}\.webp/)![0];
    const res = await page.request.get(url);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/webp");
    const body = await res.body();
    const meta = await sharp(body).metadata();
    expect(Math.max(meta.width!, meta.height!)).toBeLessThanOrEqual(2000);

    // 不保存文章，直接离开
    await logout(page);
  });
});
