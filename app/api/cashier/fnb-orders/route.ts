import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(request.url).searchParams.get("status");
  const validStatuses = new Set(["PENDING", "PREPARING", "READY", "SERVED", "CANCELLED"]);
  if (status && !validStatuses.has(status.toUpperCase())) return NextResponse.json({ error: "Status F&B tidak valid" }, { status: 400 });
  const items = await prisma.fnbOrderItem.findMany({
    where: status ? { status: status.toUpperCase() as "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" } : { status: { not: "SERVED" } },
    orderBy: { createdAt: "asc" },
    include: { fnbProduct: true, playpassBooking: { select: { bookingNumber: true, customerName: true, visitDate: true, startTime: true } }, tableReservation: { select: { reservationNumber: true, customerName: true, visitDate: true, startTime: true } } },
  });
  return NextResponse.json(items);
}
