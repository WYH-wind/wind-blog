import { HomeView, homeMetadata } from "@/components/page-views/home-view";

export const revalidate = 300;

export function generateMetadata() {
  return homeMetadata("en");
}

export default function Page() {
  return <HomeView locale="en" />;
}
