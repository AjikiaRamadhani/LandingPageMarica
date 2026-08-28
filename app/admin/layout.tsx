
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "../components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/artikel");
  }

  if (role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen min-w-0 w-full flex-col overflow-x-hidden bg-marica-sky-light/20 md:flex-row">
      <AdminSidebar
        name={session.user.name}
        email={session.user.email}
      />

      <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}

