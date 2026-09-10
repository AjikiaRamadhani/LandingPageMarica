import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { code?: string; title?: string; description?: string; pointsCost?: number; discountAmount?: number; expiresAt?: string };
  const code = validateText(body.code, "Kode voucher", 60); const title = validateText(body.title, "Judul voucher", 120); const cost = validateInteger(body.pointsCost, "Biaya poin", 1); const discount = validateInteger(body.discountAmount, "Nilai diskon", 1); const description = validateOptionalText(body.description, "Deskripsi", 240);
  if (code.error || title.error || cost.error || discount.error || description.error || typeof code.value !== "string" || typeof title.value !== "string" || typeof cost.value !== "number" || typeof discount.value !== "number") return NextResponse.json({ error: "Data voucher tidak valid" }, { status: 400 });
  const voucher = await prisma.voucher.create({ data: { code: code.value.toUpperCase(), title: title.value, description: description.value, pointsCost: cost.value, discountAmount: discount.value, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null } });
  return NextResponse.json(voucher, { status: 201 });
}
