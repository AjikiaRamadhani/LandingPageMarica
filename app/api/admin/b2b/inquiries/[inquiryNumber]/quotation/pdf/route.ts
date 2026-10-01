import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { createB2BQuotationPdf } from "@/lib/b2b-quotation-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ inquiryNumber: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { inquiryNumber } = await params;
  const quotation = await prisma.b2BInquiry.findUnique({ where: { inquiryNumber }, include: { quotationItems: { orderBy: { createdAt: "asc" } } } });
  if (!quotation) return NextResponse.json({ error: "Inquiry B2B tidak ditemukan" }, { status: 404 });
  if (!quotation.quotationNumber || quotation.quotedTotal === null || quotation.quotationItems.length === 0) return NextResponse.json({ error: "Quotation belum dibuat" }, { status: 409 });
  const pdf = createB2BQuotationPdf(quotation);
  return new Response(new Uint8Array(pdf), { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${quotation.quotationNumber}.pdf"`, "Cache-Control": "no-store" } });
}
