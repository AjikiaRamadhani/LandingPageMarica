import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
    const { email, token, newPassword } = (await request.json()) as {
      email?: string;
      token?: string;
      newPassword?: string;
    };

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } });

    if (!record || record.identifier !== email) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Token sudah kadaluarsa, silakan minta link reset baru" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Token cuma sekali pakai
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password berhasil direset, silakan login." });
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json(
      { error: "Gagal reset password, coba lagi nanti" },
      { status: 500 }
    );
  }
}