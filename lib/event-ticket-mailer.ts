import { transporter } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

type TicketEmailInput = {
  bookingNumber: string;
  customerEmail: string;
  customerName: string;
  eventTitle: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress: string | null;
  tickets: Array<{ ticketCode: string; qrToken: string; participantName: string }>;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export async function sendEventTicketEmail(input: TicketEmailInput) {
  const qrCodes = await Promise.all(input.tickets.map((ticket) => QRCode.toDataURL(ticket.qrToken)));
  const ticketRows = input.tickets
    .map(
      (ticket, index) =>
        `<li><strong>${ticket.participantName}</strong> - ${ticket.ticketCode}<br /><img src="cid:event-ticket-${index}" width="180" height="180" alt="QR tiket" /></li>`
    )
    .join("");

  await transporter.sendMail({
    from: `Marica <${process.env.GMAIL_USER}>`,
    to: input.customerEmail,
    subject: `E-Tiket Event Marica - ${input.eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f">
        <h2>Pendaftaran event berhasil</h2>
        <p>Halo ${input.customerName}, pembayaran dan pendaftaran kamu sudah berhasil.</p>
        <p><strong>${input.eventTitle}</strong><br />
        ${formatDate(input.eventDate)} | ${input.startTime} - ${input.endTime} WIB<br />
        ${input.locationName}${input.locationAddress ? `, ${input.locationAddress}` : ""}</p>
        <p>Nomor booking: <strong>${input.bookingNumber}</strong></p>
        <p>Daftar tiket:</p>
        <ul>${ticketRows}</ul>
        <p>Tunjukkan QR tiket di atas atau dari halaman Event Saya saat check-in.</p>
      </div>
    `,
    attachments: qrCodes.map((qrCode, index) => ({
      filename: `ticket-${index + 1}.png`,
      content: Buffer.from(qrCode.split(",")[1], "base64"),
      cid: `event-ticket-${index}`,
    })),
  });
}

export async function sendEventTicketEmailIfNeeded(bookingId: string) {
  const booking = await prisma.eventBooking.findUnique({
    where: { id: bookingId },
    include: { event: true, tickets: true },
  });

  if (!booking || booking.status !== "PAID" || booking.ticketEmailSentAt || booking.tickets.length === 0) {
    return false;
  }

  try {
    await sendEventTicketEmail({
      bookingNumber: booking.bookingNumber,
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      eventTitle: booking.event.title,
      eventDate: booking.event.eventDate,
      startTime: booking.event.startTime,
      endTime: booking.event.endTime,
      locationName: booking.event.locationName,
      locationAddress: booking.event.locationAddress,
      tickets: booking.tickets,
    });

    await prisma.eventBooking.updateMany({
      where: { id: booking.id, ticketEmailSentAt: null },
      data: { ticketEmailSentAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("[Event ticket email]", error);
    return false;
  }
}