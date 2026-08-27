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
    if (isRateLimited(request, "register", 5)) {
      return NextResponse.json({ error: "Terlalu banyak percobaan, coba lagi nanti" }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, password, confirmPassword } = body as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Konfirmasi password tidak cocok" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar, silakan masuk" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Gagal membuat akun, coba lagi nanti" },
      { status: 500 }
    );
  }
}