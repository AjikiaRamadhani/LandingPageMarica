import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await prisma.event.findMany({
    orderBy: { eventDate: "asc" },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: { status: "PAID" },
        select: { quantity: true },
      },
    },
  });

  return NextResponse.json(
    events.map(({ bookings, ...event }) => ({
      ...event,
      paidQuantity: bookings.reduce((sum, booking) => sum + booking.quantity, 0),
    }))
  );
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      category?: string;
      description?: string;
      benefits?: string[];
      imageUrl?: string;
      price?: number;
      eventDate?: string;
      startTime?: string;
      endTime?: string;
      locationName?: string;
      locationAddress?: string;
      quota?: number;
      isActive?: boolean;
    };

    const validPrice = typeof body.price === "number" && Number.isInteger(body.price) ? body.price : null;
    const validQuota = typeof body.quota === "number" && Number.isInteger(body.quota) ? body.quota : null;

    if (
      !body.title?.trim() ||
      !body.category?.trim() ||
      !body.description?.trim() ||
      !body.eventDate ||
      !body.startTime?.trim() ||
      !body.endTime?.trim() ||
      !body.locationName?.trim() ||
      validPrice === null ||
      validPrice < 0 ||
      validQuota === null ||
      validQuota < 1
    ) {
      return NextResponse.json({ error: "Data event belum lengkap atau tidak valid" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: body.title.trim(),
        slug: slugify(body.slug?.trim() || body.title),
        category: body.category.trim(),
        description: body.description.trim(),
        benefits: body.benefits ?? [],
        imageUrl: body.imageUrl?.trim() || null,
        price: validPrice,
        eventDate: new Date(body.eventDate),
        startTime: body.startTime.trim(),
        endTime: body.endTime.trim(),
        locationName: body.locationName.trim(),
        locationAddress: body.locationAddress?.trim() || null,
        quota: validQuota,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/events]", error);
    return NextResponse.json({ error: "Gagal membuat event" }, { status: 500 });
  }
}