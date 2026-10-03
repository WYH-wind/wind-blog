import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/env";

type RouteContext = { params: Promise<{ path: string[] }> };

// 仅允许 日期目录 + 十六进制文件名.webp（上传 API 的唯一产出形态）
const REL_PATH_RE = /^\d{4}\/\d{2}\/\d{2}\/[0-9a-f]{16}\.webp$/;

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { path: segments } = await params;
  const rel = segments.join("/");

  if (!REL_PATH_RE.test(rel)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const abs = path.join(env.UPLOAD_DIR, rel);
    // 双保险：解析后必须仍在 uploads 目录内
    if (!path.resolve(abs).startsWith(path.resolve(env.UPLOAD_DIR))) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const data = await readFile(abs);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
