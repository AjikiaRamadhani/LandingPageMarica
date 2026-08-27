import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "forgot-password", 3)) {
      return NextResponse.json({ error: "Terlalu banyak percobaan, coba lagi nanti" }, { status: 429 });
    }

    const { email } = (await request.json()) as { email?: string };
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Selalu balas sukses meskipun email gak ketemu di database,
    // biar orang luar gak bisa nebak-nebak email mana yang terdaftar
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // berlaku 1 jam

      // Hapus token lama punya email ini biar gak numpuk
      await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });

      await prisma.verificationToken.create({
        data: { identifier: normalizedEmail, token, expires },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}&email=${encodeURIComponent(
        normalizedEmail
      )}`;

      await transporter.sendMail({
        from: `"Marica" <${process.env.GMAIL_USER}>`,
          to: normalizedEmail,
        subject: "Reset Password Marica",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #2b2118;">Reset Password Marica</h2>
            <p style="color: #57493c;">Halo! Kami menerima permintaan untuk reset password akun Marica kamu.</p>
            <p style="margin: 24px 0;">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#f5a623;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">
                Reset Password
              </a>
            </p>
            <p style="color: #857a6d; font-size: 13px;">Link ini berlaku selama 1 jam. Kalau kamu gak merasa minta reset password, abaikan aja email ini.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "Kalau email terdaftar, link reset password sudah dikirim.",
    });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    return NextResponse.json(
      { error: "Gagal memproses permintaan, coba lagi nanti" },
      { status: 500 }
    );
  }
}