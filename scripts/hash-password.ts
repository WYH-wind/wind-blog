import { hash } from "@node-rs/argon2";

async function main() {
  const password = process.argv[2];
  if (!password || password.length < 8) {
    console.error("用法: pnpm admin:hash-password <密码>（至少 8 位）");
    process.exit(1);
  }
  // @node-rs/argon2 默认参数即 OWASP 推荐的 Argon2id
  const digest = await hash(password);
  // .env 由 @next/env 加载，会对值做 $变量 展开，必须转义
  const escaped = digest.replaceAll("$", "\\$");
  console.log("已生成 Argon2id 哈希。下面是可直接粘贴进 .env 的行：");
  console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
