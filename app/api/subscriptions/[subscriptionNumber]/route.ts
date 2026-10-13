import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ subscriptionNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { subscriptionNumber } = await params;
  const body = await request.json() as { action?: "PAUSE" | "RESUME" | "CANCEL" };
  const subscription = await prisma.subscription.findFirst({ where: { subscriptionNumber, userId: session.user.id } });
  if (!subscription) return NextResponse.json({ error: "Subscription tidak ditemukan" }, { status: 404 });
  if (body.action === "PAUSE") {
    if (!["ACTIVE", "PAST_DUE"].includes(subscription.status)) return NextResponse.json({ error: "Subscription tidak dapat dipause" }, { status: 409 });
    return NextResponse.json(await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "PAUSED" } }));
  }
  if (body.action === "RESUME") {
    if (subscription.status !== "PAUSED") return NextResponse.json({ error: "Subscription tidak sedang dipause" }, { status: 409 });
    return NextResponse.json(await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "ACTIVE", pausedUntil: null } }));
  }
  if (body.action === "CANCEL") return NextResponse.json(await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED", cancelledAt: new Date() } }));
  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}
