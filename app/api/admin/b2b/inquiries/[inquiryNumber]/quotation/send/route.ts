import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { sendB2BQuotationEmail } from "@/lib/b2b-mailer";

export async function POST(_request: Request, { params }: { params: Promise<{ inquiryNumber: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { inquiryNumber } = await params;
  const quotation = await prisma.b2BInquiry.findUnique({ where: { inquiryNumber }, include: { quotationItems: { orderBy: { createdAt: "asc" } } } });
  if (!quotation) return NextResponse.json({ error: "Inquiry B2B tidak ditemukan" }, { status: 404 });
  if (!quotation.quotationNumber || quotation.quotedTotal === null || quotation.quotationItems.length === 0) return NextResponse.json({ error: "Quotation belum dibuat" }, { status: 409 });
  try {
    await sendB2BQuotationEmail(quotation);
    await prisma.b2BInquiry.update({ where: { id: quotation.id }, data: { quotationSentAt: new Date() } });
    return NextResponse.json({ message: "Quotation berhasil dikirim", sentAt: new Date().toISOString() });
  } catch (error) {
    console.error("[POST /api/admin/b2b/inquiries/[inquiryNumber]/quotation/send]", error);
    return NextResponse.json({ error: "Gagal mengirim quotation" }, { status: 502 });
  }
}
