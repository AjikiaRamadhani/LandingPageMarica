import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "Password harus mengandung huruf dan angka";
  if (!/[^a-zA-Z0-9]/.test(password))
    return "Password harus mengandung minimal satu simbol";
  return null;
}

// POST /api/user/profile/change-password
// Ganti kata sandi untuk user yang sudah login.
// Berbeda dengan reset-password (yang pakai token email), endpoint ini
// memerlukan password lama untuk verifikasi identitas.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Konfirmasi password baru tidak cocok" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Password baru tidak boleh sama dengan password lama" },
        { status: 400 }
      );
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Ambil user beserta password hash dari database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // User yang login via Google/sosmed tidak punya password → password null
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "Akun ini menggunakan login sosial (Google, dll). Ganti password tidak berlaku untuk akun ini.",
        },
        { status: 400 }
      );
    }

    // Verifikasi password lama
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Password saat ini tidak sesuai" }, { status: 400 });
    }

    // Hash & simpan password baru
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: newHashedPassword },
    });

    return NextResponse.json({ message: "Kata sandi berhasil diperbarui" });
  } catch (error) {
    console.error("[POST /api/user/profile/change-password]", error);
    return NextResponse.json({ error: "Gagal memperbarui kata sandi" }, { status: 500 });
  }
}

