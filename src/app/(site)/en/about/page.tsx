import { AboutView, aboutMetadata } from "@/components/page-views/about-view";

export const revalidate = 300;

export function generateMetadata() {
  return aboutMetadata("en");
}

export default function Page() {
  return <AboutView locale="en" />;
}
