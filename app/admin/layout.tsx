import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

// Guard kedua di server component, selain middleware.ts di root.
// Middleware sudah menolak request sebelum sampai sini, tapi layout ini
// tetap dicek ulang supaya halaman admin tidak pernah ter-render untuk
// non-admin walau ada perubahan konfigurasi matcher di masa depan.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/artikel");
  }
  if (role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-marica-sky-light/20">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar name={session.user.name} email={session.user.email} />
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
