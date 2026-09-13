import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";

async function updateVoucher(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = (await request.json()) as { code?: string; title?: string; description?: string; pointsCost?: number; discountAmount?: number; isActive?: boolean; expiresAt?: string | null };
    const data: Parameters<typeof prisma.voucher.update>[0]["data"] = {};
    if (body.code !== undefined) { const value = validateText(body.code, "Kode voucher", 60); if (value.error || typeof value.value !== "string") return NextResponse.json({ error: value.error ?? "Kode voucher tidak valid" }, { status: 400 }); data.code = value.value.toUpperCase(); }
    if (body.title !== undefined) { const value = validateText(body.title, "Judul voucher", 120); if (value.error || typeof value.value !== "string") return NextResponse.json({ error: value.error ?? "Judul voucher tidak valid" }, { status: 400 }); data.title = value.value; }
    if (body.description !== undefined) { const value = validateOptionalText(body.description, "Deskripsi", 240); if (value.error) return NextResponse.json({ error: value.error }, { status: 400 }); data.description = value.value; }
    if (body.pointsCost !== undefined) { const value = validateInteger(body.pointsCost, "Biaya poin", 1); if (value.error || typeof value.value !== "number") return NextResponse.json({ error: value.error ?? "Biaya poin tidak valid" }, { status: 400 }); data.pointsCost = value.value; }
    if (body.discountAmount !== undefined) { const value = validateInteger(body.discountAmount, "Nilai diskon", 1); if (value.error || typeof value.value !== "number") return NextResponse.json({ error: value.error ?? "Nilai diskon tidak valid" }, { status: 400 }); data.discountAmount = value.value; }
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    return NextResponse.json(await prisma.voucher.update({ where: { id }, data }));
  } catch (error) {
    console.error("[PATCH /api/admin/vouchers/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui voucher" }, { status: 500 });
  }
}

export const PATCH = updateVoucher;
export const PUT = updateVoucher;

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const owned = await prisma.userVoucher.count({ where: { voucherId: id } });
    if (owned > 0) return NextResponse.json({ error: "Voucher sudah pernah dimiliki user; nonaktifkan saja" }, { status: 409 });
    await prisma.voucher.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/vouchers/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus voucher" }, { status: 500 });
  }
}
