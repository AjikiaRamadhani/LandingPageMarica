import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { sendEventTicketEmailIfNeeded } from "@/lib/event-ticket-mailer";

const MAX_PARTICIPANTS_PER_BOOKING = 10;
const PENDING_BOOKING_MINUTES = 30;

function generateBookingNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `EVT-${date}-${suffix}`;
}

function normalizeParticipantNames(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((name): name is string => typeof name === "string")
    .map((name) => name.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      eventId?: string;
      eventSlug?: string;
      quantity?: number;
      participantNames?: unknown;
      customerPhone?: string;
    };

    const eventId = body.eventId?.trim();
    const eventSlug = body.eventSlug?.trim();
    const quantity = Number(body.quantity);
    const participantNames = normalizeParticipantNames(body.participantNames);

    if ((!eventId && !eventSlug) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PARTICIPANTS_PER_BOOKING) {
      return NextResponse.json({ error: "Data booking tidak valid" }, { status: 400 });
    }

    if (participantNames.length !== quantity) {
      return NextResponse.json(
        { error: "Nama peserta harus sesuai dengan jumlah tiket" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: eventId ? { id: eventId } : { slug: eventSlug },
    });
    if (!event || !event.isActive || event.eventDate < new Date()) {
      return NextResponse.json({ error: "Event tidak tersedia" }, { status: 404 });
    }

    const activeBookings = await prisma.eventBooking.aggregate({
      where: {
        eventId: event.id,
        OR: [
          { status: "PAID" },
          { status: "PENDING_PAYMENT", expiresAt: { gt: new Date() } },
        ],
      },
      _sum: { quantity: true },
    });

    const bookedQuantity = activeBookings._sum.quantity ?? 0;
    if (bookedQuantity + quantity > event.quota) {
      return NextResponse.json({ error: "Kuota event tidak mencukupi" }, { status: 409 });
    }

    const bookingNumber = generateBookingNumber();
    const totalPrice = event.price * quantity;
    const expiresAt = new Date(Date.now() + PENDING_BOOKING_MINUTES * 60 * 1000);

    const booking = await prisma.eventBooking.create({
      data: {
        bookingNumber,
        eventId: event.id,
        userId: session.user.id,
        customerName: session.user.name?.trim() || session.user.email,
        customerEmail: session.user.email,
        customerPhone: body.customerPhone?.trim() || null,
        participantNames,
        quantity,
        totalPrice,
        expiresAt: event.price > 0 ? expiresAt : null,
        midtransOrderId: event.price > 0 ? bookingNumber : null,
        status: event.price > 0 ? "PENDING_PAYMENT" : "PAID",
        paidAt: event.price > 0 ? null : new Date(),
        tickets:
          event.price === 0
            ? {
                create: participantNames.map((participantName, index) => ({
                  ticketCode: `${bookingNumber}-${index + 1}`,
                  qrToken: crypto.randomUUID(),
                  participantName,
                })),
              }
            : undefined,
      },
      include: { tickets: true },
    });

    if (event.price === 0) {
      await sendEventTicketEmailIfNeeded(booking.id);
      return NextResponse.json({ booking }, { status: 201 });
    }

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: bookingNumber,
        gross_amount: totalPrice,
      },
      customer_details: {
        first_name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone ?? undefined,
      },
      item_details: [
        {
          id: event.id,
          price: event.price,
          quantity,
          name: event.title.slice(0, 50),
        },
      ],
    });

    const updatedBooking = await prisma.eventBooking.update({
      where: { id: booking.id },
      data: {
        midtransSnapToken: transaction.token,
      },
      include: { tickets: true },
    });

    return NextResponse.json(
      {
        booking: updatedBooking,
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/event-bookings]", error);
    return NextResponse.json({ error: "Gagal membuat booking event" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const bookings = await prisma.eventBooking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        event: true,
        tickets: true,
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[GET /api/event-bookings]", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat booking" }, { status: 500 });
  }
}