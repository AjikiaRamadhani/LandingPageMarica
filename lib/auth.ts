import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        if (isRateLimited(request, "login", 10)) return null;

        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // Auth.js does not always copy the provider user's id into `sub`
        // when a custom credentials provider is used. Keep it explicit so
        // server routes can reliably identify the current user.
        if (user.id) token.sub = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, updatedAt: true },
        });

        if (!dbUser) return {};

        // Profile edits update `updatedAt`, but must not log the user out on
        // the next navigation. Keep the session valid while the user exists.
        // An explicit session update still refreshes the timestamp stored in
        // the token for future session synchronization.
        if (trigger === "update") {
          token.userUpdatedAt = dbUser.updatedAt.toISOString();
        }
        token.role = dbUser.role;
        token.userUpdatedAt ??= dbUser.updatedAt.toISOString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
