import { permanentRedirect } from "next/navigation";

// 搜索是全局弹窗；/en/search 与 /search 一致重定向回对应语言首页
export default function EnSearchPage() {
  permanentRedirect("/en");
}
