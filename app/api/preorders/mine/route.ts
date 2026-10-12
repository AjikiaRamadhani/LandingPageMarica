import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.preOrderReservation.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { campaign: { include: { product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } } } } }));
}
