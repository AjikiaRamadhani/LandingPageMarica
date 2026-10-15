"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function KasirLayoutShell({
  name,
  email,
  children,
}: {
  name?: string | null;
  email?: string | null;
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 w-full flex-col bg-marica-sky-light/20 lg:flex-row">
      <AdminSidebar
        name={name}
        email={email}
        role="KASIR"
        onCollapsedChange={setIsCollapsed}
      />
      <main className={`min-h-screen min-w-0 w-full max-w-full overflow-x-hidden bg-marica-sky-light/20 px-3.5 py-4 transition-[margin] duration-200 sm:px-6 sm:py-6 lg:px-8 lg:py-8 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {children}
      </main>
    </div>
  );
}
