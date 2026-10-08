import { transporter } from "@/lib/mailer";
import { createB2BQuotationPdf } from "@/lib/b2b-quotation-pdf";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (value: number) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`;

export async function sendB2BQuotationEmail(quotation: Parameters<typeof createB2BQuotationPdf>[0]) {
  if (!quotation.quotationNumber || quotation.quotedTotal === null) return false;
  const pdf = createB2BQuotationPdf(quotation);
  const rows = quotation.quotationItems.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${money(item.subtotal)}</td></tr>`).join("");
  await transporter.sendMail({
    from: `Marica <${process.env.GMAIL_USER}>`,
    to: quotation.email,
    subject: `Quotation Marica - ${quotation.quotationNumber}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f"><h2>Quotation Marica</h2><p>Halo ${escapeHtml(quotation.contactName)}, berikut quotation untuk kebutuhan <strong>${escapeHtml(quotation.organizationName)}</strong>.</p><p>Nomor quotation: <strong>${escapeHtml(quotation.quotationNumber)}</strong><br />Berlaku sampai: ${quotation.validUntil?.toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }) ?? "-"}</p><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse"><thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table><p><strong>Total: ${money(quotation.quotedTotal)}</strong></p><p>Detail lengkap quotation terlampir dalam format PDF.</p></div>`,
    attachments: [{ filename: `${quotation.quotationNumber}.pdf`, content: pdf, contentType: "application/pdf" }],
  });
  return true;
}
