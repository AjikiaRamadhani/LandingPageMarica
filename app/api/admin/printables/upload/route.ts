import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "printables";
const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const file = (await request.formData()).get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File PDF wajib diisi" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "File harus berformat PDF" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Ukuran PDF maksimal 15MB" }, { status: 400 });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: "application/pdf",
      upsert: false,
    });
    if (error) return NextResponse.json({ error: "Gagal upload PDF" }, { status: 500 });

    return NextResponse.json({ fileUrl: path }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/printables/upload]", error);
    return NextResponse.json({ error: "Gagal upload PDF" }, { status: 500 });
  }
}