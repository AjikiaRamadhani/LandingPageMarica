import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = (await request.json()) as { name?: string; durationMinutes?: number; price?: number; maxPlayers?: number; isActive?: boolean };
    return NextResponse.json(await prisma.tableFeePackage.update({ where: { id }, data: { ...(body.name !== undefined ? { name: body.name.trim() } : {}), ...(body.durationMinutes !== undefined ? { durationMinutes: body.durationMinutes } : {}), ...(body.price !== undefined ? { price: body.price } : {}), ...(body.maxPlayers !== undefined ? { maxPlayers: body.maxPlayers } : {}), ...(body.isActive !== undefined ? { isActive: body.isActive } : {}) } }));
  } catch (error) {
    console.error("[PUT /api/admin/table-fee-packages/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui tarif table fee" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.tableFeePackage.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/table-fee-packages/[id]]", error);
    return NextResponse.json({ error: "Gagal menonaktifkan tarif table fee" }, { status: 500 });
  }
}
