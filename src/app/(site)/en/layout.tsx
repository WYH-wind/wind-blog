import { HtmlLang } from "@/components/html-lang";

/** /en 树：仅负责把 <html lang> 切到 en，公共布局由 (site) 提供 */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang lang="en" />
      {children}
    </>
  );
}
