import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/server/queries/settings";

/** 前台公共布局：zh（无前缀）与 /en 两棵路由树共用；后台 admin 在组外不受影响 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <SiteHeader siteName={settings["site.name"]} />
      <main className="w-full flex-1 px-6 py-10">{children}</main>
      <SiteFooter siteName={settings["site.name"]} footerText={settings["site.footer"]} />
    </>
  );
}
