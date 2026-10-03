import { hash } from "@node-rs/argon2";

async function main() {
  const password = process.argv[2];
  if (!password || password.length < 8) {
    console.error("用法: pnpm admin:hash-password <密码>（至少 8 位）");
    process.exit(1);
  }
  // @node-rs/argon2 默认参数即 OWASP 推荐的 Argon2id
  const digest = await hash(password);
  console.log("已生成 ADMIN_PASSWORD_HASH，请写入 .env：");
  console.log(`ADMIN_PASSWORD_HASH="${digest}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
