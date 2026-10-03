import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

import { requireAdmin } from "@/server/auth/require-admin";
import { env } from "@/env";
import { HttpError, assertSameOrigin, clientIp } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DIM = 6000; // 原图宽高上限
const MAX_EDGE = 2000; // 压缩后最长边

// magic bytes 白名单（禁 SVG：可携带活动内容，docs/PLAN.md 安全标准）
function detectImage(buf: Buffer): "jpeg" | "png" | "gif" | "webp" | "avif" | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (buf.subarray(0, 3).toString("ascii") === "GIF") return "gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  if (
    buf.subarray(4, 8).toString("ascii") === "ftyp" &&
    /^av(if|is)/.test(buf.subarray(8, 12).toString("ascii"))
  ) {
    return "avif";
  }
  return null;
}

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 403;
    return errorResponse(status, status === 401 ? "未登录" : "forbidden");
  }

  if (!rateLimit(`upload-ip:${clientIp(request)}`, 10)) {
    return errorResponse(429, "上传过于频繁");
  }

  let file: File;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return errorResponse(400, "缺少文件");
    file = value;
  } catch {
    return errorResponse(400, "请求体不合法");
  }

  if (file.size > MAX_BYTES) return errorResponse(413, "文件超过 10MB");
  if (file.size === 0) return errorResponse(400, "空文件");

  const buf = Buffer.from(await file.arrayBuffer());
  if (!detectImage(buf)) {
    return errorResponse(415, "仅支持 jpeg / png / webp / gif / avif，暂不支持 SVG");
  }

  let webp: Buffer;
  try {
    const image = sharp(buf, { failOn: "error" });
    const meta = await image.metadata();
    if (!meta.width || !meta.height || meta.width > MAX_DIM || meta.height > MAX_DIM) {
      return errorResponse(415, `图片尺寸超限（最大 ${MAX_DIM}×${MAX_DIM}）`);
    }
    webp = await image
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return errorResponse(415, "图片解析失败");
  }

  // 随机文件名 + 日期目录，杜绝路径注入与用户文件名
  const now = new Date();
  const relDir = path.join(
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  );
  const absDir = path.join(env.UPLOAD_DIR, relDir);
  await mkdir(absDir, { recursive: true });
  const name = `${randomBytes(8).toString("hex")}.webp`;
  await writeFile(path.join(absDir, name), webp);

  const url = `/api/uploads/${path.join(relDir, name).replaceAll("\\", "/")}`;
  return NextResponse.json({ url });
}
