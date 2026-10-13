import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const activeSubscription = await prisma.subscription.findFirst({ where: { userId: session.user.id, status: "ACTIVE" }, select: { subscriptionNumber: true, plan: { select: { name: true } }, childProfile: { select: { id: true, name: true } } } });
  if (!activeSubscription) return NextResponse.json({ error: "Konten hanya tersedia untuk pelanggan subscription aktif" }, { status: 403 });
  const activities = await prisma.subscriptionActivity.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ subscription: activeSubscription, activities });
}
