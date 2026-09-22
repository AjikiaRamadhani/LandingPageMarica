import { prisma } from "@/lib/prisma";

type SessionLike = {
  user?: {
    id?: string;
    email?: string | null;
  };
};

// Auth.js sessions created before the id fix may only contain the email.
// Resolve both forms to the canonical database user before using the id.
export async function findSessionUser(session: SessionLike) {
  const sessionUser = session.user;
  if (!sessionUser?.id && !sessionUser?.email) return null;

  const where = sessionUser.id
    ? { id: sessionUser.id }
    : { email: sessionUser.email as string };

  return prisma.user.findUnique({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      whatsapp: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
}
