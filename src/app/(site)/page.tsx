import { HomeView, homeMetadata } from "@/components/page-views/home-view";

export const revalidate = 300;

export function generateMetadata() {
  return homeMetadata("zh");
}

export default function Page() {
  return <HomeView locale="zh" />;
}
