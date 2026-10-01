import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { calculateQuotationItems, createQuotationNumber, parseInquiryNumber, parseOptionalDate } from "@/lib/b2b";

export async function POST(request: Request, { params }: { params: Promise<{ inquiryNumber: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { inquiryNumber: rawNumber } = await params;
    const inquiryNumber = parseInquiryNumber(rawNumber);
    const body = (await request.json()) as { items?: unknown; validUntil?: unknown };
    const items = calculateQuotationItems(body.items);
    const validUntil = parseOptionalDate(body.validUntil) ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const result = await prisma.$transaction(async (tx) => {
      const inquiry = await tx.b2BInquiry.findUnique({ where: { inquiryNumber }, select: { id: true, quotationNumber: true } });
      if (!inquiry) throw new Error("INQUIRY_NOT_FOUND");
      await tx.b2BQuotationItem.deleteMany({ where: { inquiryId: inquiry.id } });
      await tx.b2BQuotationItem.createMany({ data: items.map((item) => ({ ...item, inquiryId: inquiry.id })) });
      return tx.b2BInquiry.update({ where: { id: inquiry.id }, data: { status: "QUOTED", quotationNumber: inquiry.quotationNumber ?? createQuotationNumber(), quotedTotal: items.reduce((sum, item) => sum + item.subtotal, 0), validUntil }, include: { quotationItems: { orderBy: { createdAt: "asc" } } } });
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["INVALID_INQUIRY_NUMBER", "INVALID_QUOTATION_ITEMS", "INVALID_DATE"].includes(error.message)) return NextResponse.json({ error: "Data quotation tidak valid" }, { status: 400 });
    if (error instanceof Error && error.message === "INQUIRY_NOT_FOUND") return NextResponse.json({ error: "Inquiry B2B tidak ditemukan" }, { status: 404 });
    console.error("[POST /api/admin/b2b/inquiries/[inquiryNumber]/quotation]", error);
    return NextResponse.json({ error: "Gagal membuat quotation" }, { status: 500 });
  }
}
