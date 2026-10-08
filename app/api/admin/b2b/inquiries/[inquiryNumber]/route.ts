import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { parseInquiryNumber } from "@/lib/b2b";

const statuses = new Set(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]);

export async function GET(_request: Request, { params }: { params: Promise<{ inquiryNumber: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { inquiryNumber } = await params;
  const inquiry = await prisma.b2BInquiry.findUnique({ where: { inquiryNumber }, include: { quotationItems: { orderBy: { createdAt: "asc" } } } });
  if (!inquiry) return NextResponse.json({ error: "Inquiry B2B tidak ditemukan" }, { status: 404 });
  return NextResponse.json(inquiry);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ inquiryNumber: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { inquiryNumber: rawNumber } = await params;
    const inquiryNumber = parseInquiryNumber(rawNumber);
    const body = (await request.json().catch(() => ({}))) as { status?: string; adminNotes?: string };
    const status = body.status?.toUpperCase();
    if (status && !statuses.has(status)) return NextResponse.json({ error: "Status inquiry tidak valid" }, { status: 400 });
    const inquiry = await prisma.b2BInquiry.update({ where: { inquiryNumber }, data: { ...(status ? { status: status as "NEW" | "CONTACTED" | "QUOTED" | "WON" | "LOST" } : {}), ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes?.trim().slice(0, 5000) || null } : {}) }, include: { quotationItems: true } });
    return NextResponse.json(inquiry);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_INQUIRY_NUMBER") return NextResponse.json({ error: "Nomor inquiry tidak valid" }, { status: 400 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Inquiry B2B tidak ditemukan" }, { status: 404 });
    console.error("[PATCH /api/admin/b2b/inquiries/[inquiryNumber]]", error);
    return NextResponse.json({ error: "Gagal memperbarui inquiry B2B" }, { status: 500 });
  }
}
