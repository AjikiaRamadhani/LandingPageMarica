import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.subscription.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true, email: true, whatsapp: true } }, plan: true, cycles: { orderBy: { periodStart: "desc" }, take: 3, include: { delivery: true } } } }));
}
