import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json() as { slug?: string; name?: string; description?: string; price?: number; interval?: "MONTHLY" | "QUARTERLY"; isActive?: boolean };
  if (!body.name || !body.description || typeof body.price !== "number" || !Number.isInteger(body.price) || body.price < 0 || !body.interval) return NextResponse.json({ error: "Data paket subscription belum lengkap" }, { status: 400 });
  try {
    return NextResponse.json(await prisma.subscriptionPlan.update({ where: { id }, data: { slug: body.slug?.trim(), name: body.name.trim(), description: body.description.trim(), price: body.price, interval: body.interval, isActive: body.isActive ?? true } }));
  } catch { return NextResponse.json({ error: "Paket subscription tidak ditemukan" }, { status: 404 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try { await prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } }); return NextResponse.json({ message: "Paket dinonaktifkan" }); }
  catch { return NextResponse.json({ error: "Paket subscription tidak ditemukan" }, { status: 404 }); }
}
