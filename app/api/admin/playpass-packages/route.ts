import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { validateInteger, validateText } from "@/lib/request-validation";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.playpassPackage.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { name?: string; durationMinutes?: number; price?: number; maxParticipants?: number };
    const name = validateText(body.name, "Nama paket", 120);
    const duration = validateInteger(body.durationMinutes, "Durasi", 1);
    const price = validateInteger(body.price, "Harga", 0);
    const max = validateInteger(body.maxParticipants ?? 1, "Maksimal peserta", 1);
    if (name.error || duration.error || price.error || max.error || typeof name.value !== "string" || typeof duration.value !== "number" || typeof price.value !== "number" || typeof max.value !== "number") return NextResponse.json({ error: "Data paket Playpass tidak valid" }, { status: 400 });
    return NextResponse.json(await prisma.playpassPackage.create({ data: { name: name.value, durationMinutes: duration.value, price: price.value, maxParticipants: max.value } }), { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/playpass-packages]", error);
    return NextResponse.json({ error: "Gagal membuat paket Playpass" }, { status: 500 });
  }
}
