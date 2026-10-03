import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { isAuthenticated } from "@/server/auth/session";

export const metadata = { robots: { index: false, follow: false } };

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
