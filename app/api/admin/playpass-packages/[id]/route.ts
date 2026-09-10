import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = (await request.json()) as { name?: string; durationMinutes?: number; price?: number; maxParticipants?: number; isActive?: boolean };
    const packageData = await prisma.playpassPackage.update({ where: { id }, data: { ...(body.name !== undefined ? { name: body.name.trim() } : {}), ...(body.durationMinutes !== undefined ? { durationMinutes: body.durationMinutes } : {}), ...(body.price !== undefined ? { price: body.price } : {}), ...(body.maxParticipants !== undefined ? { maxParticipants: body.maxParticipants } : {}), ...(body.isActive !== undefined ? { isActive: body.isActive } : {}) } });
    return NextResponse.json(packageData);
  } catch (error) {
    console.error("[PUT /api/admin/playpass-packages/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui paket Playpass" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.playpassPackage.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/playpass-packages/[id]]", error);
    return NextResponse.json({ error: "Gagal menonaktifkan paket Playpass" }, { status: 500 });
  }
}
