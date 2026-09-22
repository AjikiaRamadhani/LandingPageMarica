import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findSessionUser } from "@/lib/session-user";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function ensureAvatarBucket() {
  const { error: updateError } = await supabaseAdmin.storage
    .updateBucket(BUCKET, { public: true });

  if (!updateError) return null;

  const missingBucket = updateError.message.toLowerCase().includes("bucket not found");
  if (!missingBucket) return updateError;

  const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
  });
  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    return createError;
  }

  return null;
}

// POST /api/user/profile/avatar
// Upload atau ganti foto profil user.
// Menerima multipart/form-data dengan field "avatar" berupa file gambar.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const user = await findSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File foto wajib disertakan" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format foto tidak didukung. Gunakan JPEG, PNG, atau WebP" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Ukuran foto maksimal 2MB" }, { status: 400 });
    }

    const bucketError = await ensureAvatarBucket();
    if (bucketError) {
      console.error("[POST /api/user/profile/avatar] bucket error:", bucketError);
      return NextResponse.json({ error: "Penyimpanan foto belum siap" }, { status: 500 });
    }

    // Hapus avatar lama dari Supabase jika ada
    if (user.image) {
      // Ekstrak path dari URL Supabase untuk dihapus
      // URL format: https://<project>.supabase.co/storage/v1/object/public/avatars/<path>
      const url = new URL(user.image);
      const pathParts = url.pathname.split(`/object/public/${BUCKET}/`);
      if (pathParts.length === 2) {
        await supabaseAdmin.storage.from(BUCKET).remove([pathParts[1]]);
      }
    }

    // Tentukan extension file & buat path yang unik per user
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[POST /api/user/profile/avatar] upload error:", uploadError);
      return NextResponse.json({ error: "Gagal mengupload foto" }, { status: 500 });
    }

    // Ambil URL publik dari Supabase
    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
    const imageUrl = publicUrlData.publicUrl;

    // Simpan URL baru ke database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
      select: { id: true, image: true },
    });

    return NextResponse.json({ image: updatedUser.image });
  } catch (error) {
    console.error("[POST /api/user/profile/avatar]", error);
    return NextResponse.json({ error: "Gagal memperbarui foto profil" }, { status: 500 });
  }
}

// DELETE /api/user/profile/avatar
// Hapus foto profil user dan kembali ke avatar default (null).
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const user = await findSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.image) {
      const url = new URL(user.image);
      const pathParts = url.pathname.split(`/object/public/${BUCKET}/`);
      if (pathParts.length === 2) {
        await supabaseAdmin.storage.from(BUCKET).remove([pathParts[1]]);
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    return NextResponse.json({ message: "Foto profil berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/user/profile/avatar]", error);
    return NextResponse.json({ error: "Gagal menghapus foto profil" }, { status: 500 });
  }
}

