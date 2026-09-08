import { transporter } from "@/lib/mailer";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function sendPrintableDownloadEmail(input: {
  email: string;
  name: string;
  printableTitle: string;
  downloadUrl: string;
  expiresInSeconds: number;
}) {
  const expiresInMinutes = Math.round(input.expiresInSeconds / 60);
  await transporter.sendMail({
    from: `Marica <${process.env.GMAIL_USER}>`,
    to: input.email,
    subject: `Download Printable Marica - ${input.printableTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#30251f">
        <h2>Printable kamu sudah siap</h2>
        <p>Halo ${escapeHtml(input.name)}, terima kasih sudah melengkapi data.</p>
        <p><strong>${escapeHtml(input.printableTitle)}</strong></p>
        <p><a href="${input.downloadUrl}">Download PDF sekarang</a></p>
        <p>Link ini berlaku sekitar ${expiresInMinutes} menit. Jika sudah kedaluwarsa, silakan submit form download lagi.</p>
      </div>
    `,
  });
}
