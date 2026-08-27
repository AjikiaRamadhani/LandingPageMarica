import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Menjaga semua route /admin/* di level middleware (edge), bukan cuma di API.
// Kenapa perlu dua lapis (middleware + requireAdmin di tiap API route)?
// - Middleware ini mencegah user non-admin bahkan MELIHAT halaman admin
//   (render halaman, fetch client-side, dsb).
// - requireAdmin di lib/require-admin.ts tetap wajib dipertahankan di setiap
//   API route, karena middleware bisa saja ke-skip/ke-bypass kalau ada
//   kesalahan konfigurasi matcher, atau kalau API dipanggil langsung tanpa
//   lewat halaman. Jangan hapus requireAdmin walau middleware ini sudah ada.
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const isAdmin = isLoggedIn && role === "ADMIN";

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    // Supaya setelah login, admin langsung diarahkan balik ke halaman yang dituju.
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAdmin) {
    // Sudah login tapi bukan admin: jangan lempar ke /login lagi (dia akan
    // login ulang dan mentok di sini lagi). Lempar ke beranda saja.
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
