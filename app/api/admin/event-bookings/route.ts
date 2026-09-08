import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const status = searchParams.get("status");
    const eventId = searchParams.get("eventId");
    const search = searchParams.get("search")?.trim();
    const where = {
      ...(status ? { status: status as "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED" } : {}),
      ...(eventId ? { eventId } : {}),
      ...(search
        ? {
            OR: [
              { bookingNumber: { contains: search, mode: "insensitive" as const } },
              { customerName: { contains: search, mode: "insensitive" as const } },
              { customerEmail: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.eventBooking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          event: { select: { id: true, title: true, eventDate: true } },
          tickets: { select: { ticketCode: true, participantName: true, status: true, checkedInAt: true } },
        },
      }),
      prisma.eventBooking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/event-bookings]", error);
    return NextResponse.json({ error: "Gagal mengambil booking event" }, { status: 500 });
  }
}