import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getB2BInquiryFilters } from "@/lib/b2b-admin-filters";

export async function GET(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 20)));
    const filters = getB2BInquiryFilters(params);
    const [inquiries, total] = await Promise.all([
      prisma.b2BInquiry.findMany({ where: filters.where, orderBy: filters.orderBy, skip: (page - 1) * limit, take: limit, include: { _count: { select: { quotationItems: true } } } }),
      prisma.b2BInquiry.count({ where: filters.where }),
    ]);
    return NextResponse.json({ inquiries, filters: { status: filters.status, organizationType: filters.organizationType, dateFrom: filters.dateFrom, dateTo: filters.dateTo, sortBy: filters.sortBy, sortOrder: filters.sortOrder }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error instanceof Error && ["INVALID_DATE_FILTER", "INVALID_STATUS_FILTER", "INVALID_SORT_FILTER"].includes(error.message)) return NextResponse.json({ error: "Filter inquiry B2B tidak valid" }, { status: 400 });
    console.error("[GET /api/admin/b2b/inquiries]", error);
    return NextResponse.json({ error: "Gagal mengambil inquiry B2B" }, { status: 500 });
  }
}
