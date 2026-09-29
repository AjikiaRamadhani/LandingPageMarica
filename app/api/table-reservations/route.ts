import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { snap } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";
import { auditAction } from "@/lib/audit";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";
import { combineDateAndMinutes, dateKey, getTableReservationAvailability, parseDateInput, parseTimeInput, reservationNumber } from "@/lib/table-reservation";
import { sendTableReservationEmailIfNeeded } from "@/lib/table-reservation-mailer";

const money = (value: number) => value;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get("packageId");
  const date = searchParams.get("date");
  if (packageId && date) {
    const availability = await getTableReservationAvailability(packageId, date);
    if (!availability) return NextResponse.json({ error: "Paket atau tanggal tidak valid" }, { status: 404 });
    return NextResponse.json(availability, { headers: { "Cache-Control": "no-store" } });
  }

  if (searchParams.get("mine") === "1") {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    return NextResponse.json(await prisma.tableReservation.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { package: true } }));
  }

  return NextResponse.json(await prisma.tableFeePackage.findMany({ where: { isActive: true }, orderBy: { price: "asc" }, select: { id: true, name: true, durationMinutes: true, price: true, maxPlayers: true, slotCapacity: true } }), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  try {
    const body = (await request.json()) as { packageId?: string; date?: string; startTime?: string; partySize?: number; customerPhone?: string };
    const packageId = validateText(body.packageId, "Paket meja", 100);
    const date = validateText(body.date, "Tanggal reservasi", 20);
    const startTime = validateText(body.startTime, "Jam reservasi", 10);
    const partySize = validateInteger(body.partySize ?? 1, "Jumlah pemain", 1);
    const phone = validateOptionalText(body.customerPhone, "Nomor WhatsApp", 40);
    if (packageId.error || date.error || startTime.error || partySize.error || phone.error || typeof packageId.value !== "string" || typeof date.value !== "string" || typeof startTime.value !== "string" || typeof partySize.value !== "number") return NextResponse.json({ error: "Data reservasi tidak valid" }, { status: 400 });

    const dateObject = parseDateInput(date.value);
    const startMinutes = parseTimeInput(startTime.value);
    if (!dateObject || startMinutes === null || dateKey(dateObject) !== date.value || date.value < dateKey(new Date())) return NextResponse.json({ error: "Tanggal atau jam reservasi tidak valid" }, { status: 400 });
    const availability = await getTableReservationAvailability(packageId.value, date.value);
    const selectedSlot = availability?.slots.find((slot) => slot.value === startTime.value);
    if (!availability || !selectedSlot || !selectedSlot.available) return NextResponse.json({ error: "Slot reservasi sudah penuh atau tidak tersedia" }, { status: 409 });
    if (partySize.value > availability.package.maxPlayers) return NextResponse.json({ error: "Jumlah pemain melebihi kapasitas paket" }, { status: 409 });

    const bookingNumber = reservationNumber();
    const start = combineDateAndMinutes(date.value, startMinutes);
    const end = combineDateAndMinutes(date.value, startMinutes + availability.package.durationMinutes);
    const totalPrice = money(availability.package.price);
    const reservation = await prisma.tableReservation.create({ data: { reservationNumber: bookingNumber, userId: session.user.id, packageId: availability.package.id, customerName: session.user.name ?? "Pelanggan Marica", customerEmail: session.user.email, customerPhone: phone.value, partySize: partySize.value, visitDate: dateObject, startTime: start, endTime: end, totalPrice, status: totalPrice > 0 ? "PENDING_PAYMENT" : "PAID", expiresAt: totalPrice > 0 ? new Date(Date.now() + 30 * 60 * 1000) : null } });

    if (totalPrice === 0) {
      await prisma.tableReservation.update({ where: { id: reservation.id }, data: { paidAt: new Date() } });
      await sendTableReservationEmailIfNeeded(reservation.id);
      return NextResponse.json({ reservation, redirectUrl: `/reservasi/tiket/${reservation.reservationNumber}` }, { status: 201 });
    }

    const transaction = await snap.createTransaction({ transaction_details: { order_id: bookingNumber, gross_amount: totalPrice }, customer_details: { first_name: reservation.customerName, email: reservation.customerEmail, phone: reservation.customerPhone ?? undefined }, item_details: [{ id: availability.package.id, price: availability.package.price, quantity: 1, name: availability.package.name.slice(0, 50) }] });
    const updated = await prisma.tableReservation.update({ where: { id: reservation.id }, data: { midtransOrderId: bookingNumber, midtransSnapToken: transaction.token } });
    auditAction({ action: "table_reservation_created", status: "success", payload: { reservationNumber: bookingNumber, packageId, userId: session.user.id } });
    return NextResponse.json({ reservation: updated, snapToken: transaction.token, redirectUrl: transaction.redirect_url }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/table-reservations]", error);
    return NextResponse.json({ error: "Gagal membuat reservasi meja" }, { status: 500 });
  }
}
