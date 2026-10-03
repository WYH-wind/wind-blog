import "server-only";

/**
 * 内存级频率限制（单实例足够，docs/PLAN.md 安全标准）。
 * 进程重启即清空，可接受；生产环境另有 nginx limit_req 一层。
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();

  // 粗略清扫，避免 Map 无限增长
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
