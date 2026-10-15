import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import KasirLayoutShell from "./KasirLayoutShell";

export default async function KasirLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) redirect("/login?callbackUrl=/kasir");
  if (role !== "KASIR") redirect("/");

  return (
    <KasirLayoutShell
      name={session.user.name}
      email={session.user.email}
    >
      {children}
    </KasirLayoutShell>
  );
}
