import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";
import QRCode from "qrcode";

export async function sendTableReservationEmailIfNeeded(reservationId: string) {
  const reservation = await prisma.tableReservation.findUnique({ where: { id: reservationId }, include: { package: true } });
  if (!reservation || reservation.status !== "PAID" || reservation.ticketEmailSentAt) return false;
  try {
    const qr = await QRCode.toDataURL(reservation.qrToken);
    await transporter.sendMail({
      from: `Marica <${process.env.GMAIL_USER}>`,
      to: reservation.customerEmail,
      subject: `Konfirmasi Reservasi Meja Marica - ${reservation.reservationNumber}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f"><h2>Reservasi meja berhasil</h2><p>Halo ${reservation.customerName}, pembayaran reservasi kamu sudah berhasil.</p><p><strong>${reservation.package.name}</strong><br />${reservation.visitDate.toLocaleDateString("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" })}<br />${reservation.startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} - ${reservation.endTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB<br />${reservation.partySize} pemain</p><p>Nomor reservasi: <strong>${reservation.reservationNumber}</strong></p><p><img src="cid:table-reservation-qr" width="220" height="220" alt="QR reservasi meja" /></p><p>Tunjukkan QR ini kepada kasir saat datang.</p></div>`,
      attachments: [{ filename: "table-reservation.png", content: Buffer.from(qr.split(",")[1], "base64"), cid: "table-reservation-qr" }],
    });
    await prisma.tableReservation.updateMany({ where: { id: reservation.id, ticketEmailSentAt: null }, data: { ticketEmailSentAt: new Date() } });
    return true;
  } catch (error) {
    console.error("[Table reservation email]", error);
    return false;
  }
}
