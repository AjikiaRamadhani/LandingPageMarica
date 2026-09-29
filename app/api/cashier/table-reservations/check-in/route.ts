import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { qrToken?: string; reservationNumber?: string };
    const token = body.qrToken?.trim() || body.reservationNumber?.trim();
    if (!token) return NextResponse.json({ error: "QR reservasi wajib diisi" }, { status: 400 });
    const reservation = await prisma.tableReservation.findFirst({ where: { OR: [{ qrToken: token }, { reservationNumber: token }] }, include: { package: true } });
    if (!reservation) return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
    if (reservation.status !== "PAID") return NextResponse.json({ error: "Reservasi belum dibayar atau sudah digunakan" }, { status: 409 });
    return NextResponse.json(await prisma.tableReservation.update({ where: { id: reservation.id }, data: { status: "CHECKED_IN", checkedInAt: new Date() }, include: { package: true } }));
  } catch (error) {
    console.error("[POST /api/cashier/table-reservations/check-in]", error);
    return NextResponse.json({ error: "Gagal check-in reservasi" }, { status: 500 });
  }
}
