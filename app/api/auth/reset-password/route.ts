import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

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

    const { email, token, newPassword } = (await request.json()) as {
      email?: string;
      token?: string;
      newPassword?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !token || !newPassword) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const resetSucceeded = await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.verificationToken.deleteMany({
        where: {
          token,
          identifier: normalizedEmail,
          expires: { gt: new Date() },
        },
      });

      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { email: normalizedEmail },
        data: { password: hashedPassword },
      });

      return true;
    });

    if (!resetSucceeded) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
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