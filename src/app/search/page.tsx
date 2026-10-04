import { permanentRedirect } from "next/navigation";

// 搜索已改为头部图标触发的全局弹窗（任意页面可用），旧 /search 地址永久重定向到首页
export default function SearchPage() {
  permanentRedirect("/");
}
