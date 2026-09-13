import { auth } from "@/lib/auth";

export const APP_ROLES = ["ADMIN", "KASIR", "USER"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export async function requireRole(...allowedRoles: AppRole[]) {
  const session = await auth();
  const role = session?.user?.role as AppRole | undefined;

  if (!session?.user || !role || !allowedRoles.includes(role)) return null;

  return session;
}
