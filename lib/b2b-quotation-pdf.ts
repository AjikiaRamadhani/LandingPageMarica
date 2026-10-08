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
  quotationItems: Array<{
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
  }>;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const orange = "0.87 0.56 0.05";
const ink = "0.15 0.13 0.12";
const muted = "0.38 0.36 0.33";
const line = "0.88 0.86 0.82";

const escapePdfText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");

const money = (value: number) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
const date = (value: Date | null) =>
  value
    ? value.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      })
    : "-";

function wrap(value: string, max: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = `${current} ${word}`.trim();
    if (current && next.length > max) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function text(value: string, x: number, y: number, size: number, font = "/F1", color = ink) {
  return `${color} rg BT ${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function rect(x: number, y: number, width: number, height: number, color: string) {
  return `${color} rg ${x} ${y} ${width} ${height} re f`;
}

function strokeLine(x1: number, y1: number, x2: number, y2: number) {
  return `${line} RG 0.7 w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function itemHeight(item: Quotation["quotationItems"][number]) {
  return 42 + wrap(item.description ?? "", 72).length * 11;
}

function splitItems(items: Quotation["quotationItems"]) {
  const pages: Quotation["quotationItems"][] = [];
  let current: Quotation["quotationItems"] = [];
  let height = 0;
  const firstLimit = 270;
  const nextLimit = 500;
  for (const item of items) {
    const limit = pages.length === 0 ? firstLimit : nextLimit;
    if (current.length && height + itemHeight(item) > limit) {
      pages.push(current);
      current = [];
      height = 0;
    }
    current.push(item);
    height += itemHeight(item);
  }
  if (current.length || !pages.length) pages.push(current);
  return pages;
}

function pageContent(
  quotation: Quotation,
  items: Quotation["quotationItems"],
  pageIndex: number,
  pageCount: number,
) {
  const commands: string[] = [
    rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "0.99 0.985 0.97"),
    rect(0, 760, PAGE_WIDTH, 82, orange),
    text("MARICA EXPERIENCE STORE", 40, 805, 16, "/F2", "1 1 1"),
    text("QUOTATION", 40, 780, 10, "/F1", "1 1 1"),
    text(quotation.quotationNumber ?? "DRAFT", 405, 806, 11, "/F2", "1 1 1"),
    text(`Halaman ${pageIndex + 1} dari ${pageCount}`, 440, 782, 8, "/F1", "1 1 1"),
  ];

  let y = 730;
  if (pageIndex === 0) {
    commands.push(
      text("PENAWARAN KERJA SAMA", 40, y, 9, "/F2", orange),
      text(`Inquiry ${quotation.inquiryNumber}`, 40, y - 22, 14, "/F2"),
      text(`Dibuat ${date(new Date())}`, 40, y - 40, 9, "/F1", muted),
      text(`Berlaku sampai ${date(quotation.validUntil)}`, 370, y - 40, 9, "/F1", muted),
      rect(40, 555, 515, 92, "0.96 0.95 0.92"),
      text("UNTUK", 56, 625, 8, "/F2", orange),
      text(quotation.organizationName, 56, 606, 13, "/F2"),
      text(`${quotation.organizationType}  |  PIC: ${quotation.contactName}`, 56, 588, 9, "/F1", muted),
      text(`${quotation.email}  |  ${quotation.whatsapp}`, 56, 572, 9, "/F1", muted),
      text("KEBUTUHAN", 330, 625, 8, "/F2", orange),
      ...wrap(quotation.requestType, 30)
        .slice(0, 2)
        .map((value, index) => text(value, 330, 606 - index * 14, 10, "/F2")),
    );
    y = 520;
  } else {
    commands.push(text("RINCIAN PENAWARAN (LANJUTAN)", 40, y, 12, "/F2"));
    y = 700;
  }

  commands.push(
    rect(40, y - 24, 515, 24, ink),
    text("ITEM", 52, y - 16, 8, "/F2", "1 1 1"),
    text("QTY", 310, y - 16, 8, "/F2", "1 1 1"),
    text("HARGA", 365, y - 16, 8, "/F2", "1 1 1"),
    text("DISKON", 438, y - 16, 8, "/F2", "1 1 1"),
    text("SUBTOTAL", 495, y - 16, 8, "/F2", "1 1 1"),
  );
  y -= 24;

  for (const item of items) {
    const descriptions = wrap(item.description ?? "", 58);
    const height = itemHeight(item);
    commands.push(rect(40, y - height, 515, height, "1 1 1"));
    commands.push(text(wrap(item.name, 38)[0], 52, y - 17, 9, "/F2"));
    descriptions
      .slice(0, 2)
      .forEach((value, index) => commands.push(text(value, 52, y - 31 - index * 11, 7.5, "/F1", muted)));
    commands.push(
      text(String(item.quantity), 315, y - 17, 9),
      text(money(item.unitPrice), 350, y - 17, 8),
      text(money(item.discount), 430, y - 17, 8),
      text(money(item.subtotal), 490, y - 17, 8, "/F2"),
      strokeLine(40, y - height, 555, y - height),
    );
    y -= height;
  }

  if (pageIndex === pageCount - 1) {
    commands.push(
      rect(350, y - 58, 205, 58, "0.96 0.95 0.92"),
      text("TOTAL PENAWARAN", 365, y - 21, 8, "/F2", muted),
      text(money(quotation.quotedTotal ?? 0), 365, y - 44, 16, "/F2", orange),
      text("Terima kasih telah mempercayakan kebutuhan aktivitas edukasi kepada Marica.", 40, 72, 8, "/F1", muted),
      strokeLine(40, 92, 555, 92),
      text("MARICA EXPERIENCE STORE", 40, 54, 8, "/F2", orange),
      text("Dokumen dibuat secara otomatis", 405, 54, 8, "/F1", muted),
    );
  } else {
    commands.push(text("Bersambung ke halaman berikutnya", 40, 60, 8, "/F1", muted));
  }
  return commands.join("\n");
}

export function createB2BQuotationPdf(quotation: Quotation) {
  const pages = splitItems(quotation.quotationItems);
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const regularFont = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFont = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  pages.forEach((items, index) => {
    const content = pageContent(quotation, items, index, pages.length);
    contentIds.push(add(`<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`));
    pageIds.push(add(""));
  });
  const pagesId = add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  pageIds.forEach((id, index) => {
    objects[id - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFont} 0 R /F2 ${boldFont} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
  });
  const catalog = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}
