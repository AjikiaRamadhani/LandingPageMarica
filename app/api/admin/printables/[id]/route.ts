import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const printable = await prisma.printable.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
        ...(typeof body.slug === "string" ? { slug: body.slug.trim() } : {}),
        ...(typeof body.description === "string" ? { description: body.description.trim() } : {}),
        ...(typeof body.subject === "string" ? { subject: body.subject.trim() } : {}),
        ...(typeof body.ageMin === "number" ? { ageMin: body.ageMin } : {}),
        ...(typeof body.ageMax === "number" ? { ageMax: body.ageMax } : {}),
        ...(typeof body.thumbnailUrl === "string" ? { thumbnailUrl: body.thumbnailUrl.trim() || null } : {}),
        ...(typeof body.fileUrl === "string" ? { fileUrl: body.fileUrl.trim() } : {}),
        ...(typeof body.price === "number" && body.price >= 0 ? { price: body.price } : {}),
        ...(typeof body.points === "number" && Number.isInteger(body.points) && body.points >= 0 ? { points: body.points } : {}),
        ...(typeof body.isFeatured === "boolean" ? { isFeatured: body.isFeatured } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
      },
    });
    return NextResponse.json(printable);
  } catch (error) {
    console.error("[PATCH /api/admin/printables/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui printable" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await prisma.printable.updateMany({ where: { id }, data: { isActive: false } });
  if (!result.count) return NextResponse.json({ error: "Printable tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ message: "Printable dinonaktifkan" });
}
