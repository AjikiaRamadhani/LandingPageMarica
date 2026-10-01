type Quotation = {
  quotationNumber: string | null;
  inquiryNumber: string;
  organizationName: string;
  organizationType: string;
  contactName: string;
  email: string;
  whatsapp: string;
  requestType: string;
  eventDate: Date | null;
  validUntil: Date | null;
  quotedTotal: number | null;
  quotationItems: Array<{ name: string; description: string | null; quantity: number; unitPrice: number; discount: number; subtotal: number }>;
};

const escapePdfText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "?");
const money = (value: number) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`;
const date = (value: Date | null) => value ? value.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }) : "-";

function wrap(value: string, max = 82) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max && current) { lines.push(current); current = word; } else current = `${current} ${word}`.trim();
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pageContent(lines: string[]) {
  let y = 790;
  const commands = ["BT", "/F1 10 Tf", "40 790 Td"];
  for (const line of lines) { commands.push(`0 -${y === 790 ? 0 : 16} Td`, `(${escapePdfText(line)}) Tj`); y -= 16; }
  commands.push("ET");
  return commands.join("\n");
}

export function createB2BQuotationPdf(quotation: Quotation) {
  const lines = [
    "MARICA EXPERIENCE STORE",
    "QUOTATION",
    "",
    `Quotation: ${quotation.quotationNumber ?? "-"}`,
    `Inquiry: ${quotation.inquiryNumber}`,
    `Tanggal: ${date(new Date())}`,
    `Berlaku sampai: ${date(quotation.validUntil)}`,
    "",
    `Organisasi: ${quotation.organizationName} (${quotation.organizationType})`,
    `PIC: ${quotation.contactName}`,
    `Kontak: ${quotation.email} | ${quotation.whatsapp}`,
    `Kebutuhan: ${quotation.requestType}`,
    `Tanggal acara: ${date(quotation.eventDate)}`,
    "",
    "RINCIAN PENAWARAN",
    "Nama item | Qty | Harga satuan | Diskon | Subtotal",
    ...quotation.quotationItems.flatMap((item) => [
      `${item.name} | ${item.quantity} | ${money(item.unitPrice)} | ${money(item.discount)} | ${money(item.subtotal)}`,
      ...wrap(item.description ?? "").map((line) => line ? `  ${line}` : ""),
    ]),
    "",
    `TOTAL QUOTATION: ${money(quotation.quotedTotal ?? 0)}`,
    "",
    "Terima kasih telah mempercayakan kebutuhan aktivitas edukasi kepada Marica.",
  ];
  const chunks: string[][] = [];
  for (let index = 0; index < lines.length; index += 42) chunks.push(lines.slice(index, index + 42));
  const objects: string[] = [];
  const add = (body: string) => { objects.push(body); return objects.length; };
  const font = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  for (const chunk of chunks) {
    const content = pageContent(chunk);
    contentIds.push(add(`<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`));
    pageIds.push(add(""));
  }
  const pages = add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  pageIds.forEach((id, index) => { objects[id - 1] = `<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`; });
  const catalog = add(`<< /Type /Catalog /Pages ${pages} 0 R >>`);
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf, "binary")); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}
