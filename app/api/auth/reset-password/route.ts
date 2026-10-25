import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { hashPasswordResetOtp, isPasswordResetOtp } from "@/lib/password-reset";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "Password harus mengandung huruf dan angka";
  if (!/[^a-zA-Z0-9]/.test(password))
    return "Password harus mengandung minimal satu simbol";
  return null;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "reset-password", 5)) {
      return NextResponse.json({ error: "Terlalu banyak percobaan, coba lagi nanti" }, { status: 429 });
    }

    const { email, otp, newPassword } = (await request.json()) as {
      email?: string;
      otp?: string;
      newPassword?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = otp?.trim();

    if (!normalizedEmail || !normalizedOtp || !newPassword) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    if (!isPasswordResetOtp(normalizedOtp)) {
      return NextResponse.json({ error: "Kode OTP harus terdiri dari 6 angka" }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Satu statement PostgreSQL ini bersifat atomik, tetapi tidak memakai
    // interactive transaction Prisma yang bermasalah pada driver adapter ini.
    const updatedUsers = await prisma.$executeRaw`
      WITH consumed AS (
        DELETE FROM "verificationtokens"
        WHERE "identifier" = ${normalizedEmail}
          AND "token" = ${hashPasswordResetOtp(normalizedOtp)}
          AND "expires" > NOW()
        RETURNING "identifier"
      )
      UPDATE "users"
      SET "password" = ${hashedPassword}, "updatedAt" = NOW()
      FROM consumed
      WHERE "users"."email" = consumed."identifier"
    `;

    const resetSucceeded = updatedUsers === 1;

    if (!resetSucceeded) {
      return NextResponse.json({ error: "Kode OTP tidak valid atau sudah kadaluarsa" }, { status: 400 });
    }

    return NextResponse.json({ message: "Password berhasil direset, silakan login." });
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json(
      { error: "Gagal reset password, coba lagi nanti" },
      { status: 500 }
    );
  }
}
