import { requireRole } from "@/lib/access-control";

/**
 * Cek apakah request sekarang datang dari user yang login DAN role-nya ADMIN.
 * Return session kalau valid, null kalau enggak (dipakai buat return 401/403).
 */
export async function requireAdmin() {
  return requireRole("ADMIN");
}
