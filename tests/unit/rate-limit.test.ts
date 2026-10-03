import { describe, expect, it } from "vitest";

import { rateLimit } from "@/server/rate-limit";

describe("rateLimit", () => {
  it("窗口内放行 N 次后拒绝", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(false);
  });

  it("不同 key 互不影响", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, 1)).toBe(true);
    expect(rateLimit(a, 1)).toBe(false);
    expect(rateLimit(b, 1)).toBe(true);
  });
});
