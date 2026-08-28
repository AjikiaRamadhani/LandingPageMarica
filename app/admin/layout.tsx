import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "../components/admin/AdminSidebar";

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
    // flex-col di mobile: strip menu (dari AdminSidebar) menumpuk di atas
    // konten. flex-row di md ke atas: sidebar statis berdampingan dengan
    // konten. Profil admin + tombol "Kembali ke situs"/"Keluar" ada di
    // bagian bawah AdminSidebar itu sendiri (mobile & desktop sama),
    // jadi tidak perlu topbar terpisah lagi.
    <div className="flex min-h-screen flex-col bg-marica-sky-light/20 md:flex-row">
      <AdminSidebar name={session.user.name} email={session.user.email} />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
