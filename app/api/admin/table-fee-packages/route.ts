import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.tableFeePackage.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { name?: string; durationMinutes?: number; price?: number; maxPlayers?: number };
    const durationMinutes = typeof body.durationMinutes === "number" ? body.durationMinutes : 0;
    const price = typeof body.price === "number" ? body.price : -1;
    const maxPlayers = typeof body.maxPlayers === "number" ? body.maxPlayers : 4;
    if (!body.name?.trim() || !Number.isInteger(durationMinutes) || durationMinutes < 1 || !Number.isInteger(price) || price < 0 || !Number.isInteger(maxPlayers) || maxPlayers < 1) return NextResponse.json({ error: "Data tarif table fee tidak valid" }, { status: 400 });
    return NextResponse.json(await prisma.tableFeePackage.create({ data: { name: body.name.trim(), durationMinutes, price, maxPlayers } }), { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/table-fee-packages]", error);
    return NextResponse.json({ error: "Gagal membuat tarif table fee" }, { status: 500 });
  }
}
