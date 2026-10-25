import { prisma } from "@/lib/prisma";
import { mailerFrom, transporter } from "@/lib/mailer";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function formatRupiah(value: number) {
  return `Rp${new Intl.NumberFormat("id-ID").format(value)}`;
}

export async function sendOrderPaymentEmailIfNeeded(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  if (!order || order.status !== "PAID" || order.paymentEmailSentAt || !order.user.email) return false;

  await transporter.sendMail({
    from: `Marica <${mailerFrom}>`,
    to: order.user.email,
    subject: `Pembayaran berhasil - ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f">
        <h2>Pembayaran berhasil</h2>
        <p>Halo ${escapeHtml(order.user.name ?? order.shippingName)}, pembayaran pesanan kamu sudah kami terima.</p>
        <p>Nomor pesanan: <strong>${escapeHtml(order.orderNumber)}</strong></p>
        <ul>${order.items.map((item) => `<li>${escapeHtml(item.productName)} x${item.quantity} — ${formatRupiah(item.price * item.quantity)}</li>`).join("")}</ul>
        <p><strong>Total: ${formatRupiah(order.total)}</strong></p>
        <p>Pesanan akan diproses oleh tim Marica.</p>
      </div>
    `,
  });

  await prisma.order.updateMany({
    where: { id: order.id, status: "PAID", paymentEmailSentAt: null },
    data: { paymentEmailSentAt: new Date() },
  });
  return true;
}

export async function sendOrderExpiredEmailIfNeeded(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!order || order.status !== "EXPIRED" || order.expirationEmailSentAt || !order.user.email) return false;

  await transporter.sendMail({
    from: `Marica <${mailerFrom}>`,
    to: order.user.email,
    subject: `Pesanan kedaluwarsa - ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f">
        <h2>Pesanan kedaluwarsa</h2>
        <p>Halo ${escapeHtml(order.user.name ?? order.shippingName)}, waktu pembayaran untuk pesanan <strong>${escapeHtml(order.orderNumber)}</strong> sudah berakhir.</p>
        <p>Pesanan ini tidak dapat diproses. Silakan buat pesanan baru jika masih ingin membeli produk tersebut.</p>
      </div>
    `,
  });

  await prisma.order.updateMany({
    where: { id: order.id, status: "EXPIRED", expirationEmailSentAt: null },
    data: { expirationEmailSentAt: new Date() },
  });
  return true;
}
