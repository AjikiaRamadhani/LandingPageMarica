import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mailerFrom, transporter } from "@/lib/mailer";
import { isRateLimited } from "@/lib/rate-limit";
import {
  createPasswordResetOtp,
  hashPasswordResetOtp,
  PASSWORD_RESET_OTP_TTL_MS,
} from "@/lib/password-reset";

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

    if (!user) {
      return NextResponse.json(
        { error: "Akun dengan email tersebut tidak ditemukan", code: "USER_NOT_FOUND", userFound: false },
        { status: 404 },
      );
    }

    const otp = createPasswordResetOtp();
    const expires = new Date(Date.now() + PASSWORD_RESET_OTP_TTL_MS);

    // Hapus token lama punya email ini biar gak numpuk
    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: hashPasswordResetOtp(otp),
        expires,
      },
    });

    await transporter.sendMail({
      from: `"Marica" <${mailerFrom}>`,
      to: normalizedEmail,
      subject: "Reset Password Marica",
      html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #2b2118;">Reset Password Marica</h2>
            <p style="color: #57493c;">Halo! Kami menerima permintaan untuk reset password akun Marica kamu.</p>
            <p style="margin: 24px 0; color: #2b2118; font-size: 30px; letter-spacing: 8px; font-weight: 700;">
              ${otp}
            </p>
            <p style="color: #857a6d; font-size: 13px;">Kode ini berlaku selama 10 menit dan hanya bisa digunakan sekali. Kalau kamu gak merasa minta reset password, abaikan aja email ini.</p>
          </div>
        `,
    });

    return NextResponse.json({
      message: "Kode OTP reset password sudah dikirim.",
      userFound: true,
    });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    if (error instanceof Error && /socket|smtp|connection|timeout|enotfound|getaddrinfo/i.test(error.message)) {
      return NextResponse.json(
        { error: "Layanan email sedang bermasalah, coba lagi beberapa saat lagi" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memproses permintaan, coba lagi nanti" },
      { status: 500 }
    );
  }
}
