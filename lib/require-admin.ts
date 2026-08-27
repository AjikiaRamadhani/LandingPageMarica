import { auth } from "@/lib/auth";

/**
 * Cek apakah request sekarang datang dari user yang login DAN role-nya ADMIN.
 * Return session kalau valid, null kalau enggak (dipakai buat return 401/403).
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}