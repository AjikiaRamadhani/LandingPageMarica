import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { bookings: { include: { tickets: true, user: { select: { id: true, name: true, email: true } } } } },
  });
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });

    const data = {
      ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
      ...(typeof body.slug === "string" ? { slug: body.slug.trim() } : {}),
      ...(typeof body.category === "string" ? { category: body.category.trim() } : {}),
      ...(typeof body.description === "string" ? { description: body.description.trim() } : {}),
      ...(Array.isArray(body.benefits) ? { benefits: body.benefits.filter((item): item is string => typeof item === "string") } : {}),
      ...(typeof body.imageUrl === "string" ? { imageUrl: body.imageUrl.trim() || null } : {}),
      ...(typeof body.price === "number" && Number.isInteger(body.price) && body.price >= 0 ? { price: body.price } : {}),
      ...(typeof body.eventDate === "string" ? { eventDate: new Date(body.eventDate) } : {}),
      ...(typeof body.startTime === "string" ? { startTime: body.startTime.trim() } : {}),
      ...(typeof body.endTime === "string" ? { endTime: body.endTime.trim() } : {}),
      ...(typeof body.locationName === "string" ? { locationName: body.locationName.trim() } : {}),
      ...(typeof body.locationAddress === "string" ? { locationAddress: body.locationAddress.trim() || null } : {}),
      ...(typeof body.quota === "number" && Number.isInteger(body.quota) && body.quota > 0 ? { quota: body.quota } : {}),
      ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    };

    const event = await prisma.event.update({ where: { id }, data });
    return NextResponse.json(event);
  } catch (error) {
    console.error("[PATCH /api/admin/events/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui event" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.updateMany({
    where: { id },
    data: { isActive: false },
  });
  if (event.count === 0) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ message: "Event dinonaktifkan" });
}