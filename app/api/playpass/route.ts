import { NextResponse } from "next/server";
import { getPlaypassSlotAvailability } from "@/lib/playpass-booking";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get("packageId");
  const date = searchParams.get("date");

  if (packageId && date) {
    const availability = await getPlaypassSlotAvailability(packageId, date);
    if (!availability) return NextResponse.json({ error: "Paket atau tanggal tidak valid" }, { status: 404 });
    return NextResponse.json(availability, { headers: { "Cache-Control": "no-store" } });
  }

  const packages = await prisma.playpassPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    select: { id: true, name: true, durationMinutes: true, price: true, maxParticipants: true, slotCapacity: true },
  });
  return NextResponse.json(packages, { headers: { "Cache-Control": "no-store" } });
}
