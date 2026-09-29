import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";
import QRCode from "qrcode";

export async function sendPlaypassTicketEmailIfNeeded(bookingId: string) {
  const booking = await prisma.playpassBooking.findUnique({
    where: { id: bookingId },
    include: { package: true, tickets: true },
  });
  if (!booking || booking.status !== "PAID" || booking.ticketEmailSentAt || booking.tickets.length === 0) return false;

  const ticket = booking.tickets[0];
  try {
    const qr = await QRCode.toDataURL(ticket.qrToken);
    await transporter.sendMail({
      from: `Marica <${process.env.GMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `E-Tiket Playpass Marica - ${booking.bookingNumber}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f">
        <h2>Booking Playpass berhasil</h2>
        <p>Halo ${booking.customerName}, pembayaran kamu sudah berhasil.</p>
        <p><strong>${booking.package.name}</strong><br />
        ${booking.visitDate.toLocaleDateString("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" })}<br />
        ${booking.startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} - ${booking.endTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB</p>
        <p>Nomor booking: <strong>${booking.bookingNumber}</strong><br />Jumlah tiket: ${booking.quantity}</p>
        <p><img src="cid:playpass-ticket-qr" width="220" height="220" alt="QR tiket Playpass" /></p>
        <p>Tunjukkan QR ini saat check-in di Marica Experience Store.</p>
      </div>`,
      attachments: [{ filename: "playpass-ticket.png", content: Buffer.from(qr.split(",")[1], "base64"), cid: "playpass-ticket-qr" }],
    });
    await prisma.playpassBooking.updateMany({ where: { id: booking.id, ticketEmailSentAt: null }, data: { ticketEmailSentAt: new Date() } });
    return true;
  } catch (error) {
    console.error("[Playpass ticket email]", error);
    return false;
  }
}
