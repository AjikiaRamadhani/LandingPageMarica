import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const existing = await prisma.subscriptionActivity.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Activity tidak ditemukan" }, { status: 404 });
    const data: Record<string, unknown> = {};
    for (const key of ["slug", "title", "description", "contentType", "videoUrl", "guideUrl", "thumbnailUrl"]) if (body[key] !== undefined) { if (typeof body[key] !== "string" || !body[key].trim()) return NextResponse.json({ error: `${key} tidak valid` }, { status: 400 }); data[key] = body[key].trim(); }
    for (const key of ["ageMin", "ageMax", "sortOrder"]) if (body[key] !== undefined) { if (!Number.isInteger(body[key]) || Number(body[key]) < 0) return NextResponse.json({ error: `${key} tidak valid` }, { status: 400 }); data[key] = body[key]; }
    if (body.isPublished !== undefined) { if (typeof body.isPublished !== "boolean") return NextResponse.json({ error: "isPublished tidak valid" }, { status: 400 }); data.isPublished = body.isPublished; }
    const updated = await prisma.subscriptionActivity.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/subscription-activities/:id]", error);
    return NextResponse.json({ error: "Gagal memperbarui activity subscription" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.subscriptionActivity.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Activity tidak ditemukan" }, { status: 404 });
  await prisma.subscriptionActivity.delete({ where: { id } });
  return NextResponse.json({ message: "Activity subscription berhasil dihapus" });
}
