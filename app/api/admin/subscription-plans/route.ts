import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.subscriptionPlan.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { subscriptions: true } } } }));
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { slug?: string; name?: string; description?: string; price?: number; interval?: "MONTHLY" | "QUARTERLY"; isActive?: boolean };
    if (!body.slug || !body.name || !body.description || typeof body.price !== "number" || !Number.isInteger(body.price) || body.price < 0 || !body.interval) return NextResponse.json({ error: "Data paket subscription belum lengkap" }, { status: 400 });
    return NextResponse.json(await prisma.subscriptionPlan.create({ data: { slug: body.slug.trim(), name: body.name.trim(), description: body.description.trim(), price: body.price, interval: body.interval, isActive: body.isActive ?? true } }), { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/subscription-plans]", error);
    return NextResponse.json({ error: "Gagal membuat paket subscription" }, { status: 500 });
  }
}
