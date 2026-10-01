import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { B2B_IN_PROGRESS_STATUSES, getB2BInquiryFilters } from "@/lib/b2b-admin-filters";

export async function GET(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    params.delete("status");
    params.delete("sortBy");
    params.delete("sortOrder");
    const filters = getB2BInquiryFilters(params);
    const base = filters.where;
    const [total, newCount, inProgress, quotationSent, won, lost] = await Promise.all([
      prisma.b2BInquiry.count({ where: base }),
      prisma.b2BInquiry.count({ where: { ...base, status: "NEW" } }),
      prisma.b2BInquiry.count({ where: { ...base, status: { in: [...B2B_IN_PROGRESS_STATUSES] } } }),
      prisma.b2BInquiry.count({ where: { ...base, status: "QUOTED" } }),
      prisma.b2BInquiry.count({ where: { ...base, status: "WON" } }),
      prisma.b2BInquiry.count({ where: { ...base, status: "LOST" } }),
    ]);
    return NextResponse.json({ summary: { total, new: newCount, inProgress, quotationSent, won, lost }, filters: { organizationType: filters.organizationType, dateFrom: filters.dateFrom, dateTo: filters.dateTo } });
  } catch (error) {
    if (error instanceof Error && ["INVALID_DATE_FILTER", "INVALID_STATUS_FILTER", "INVALID_SORT_FILTER"].includes(error.message)) return NextResponse.json({ error: "Filter summary B2B tidak valid" }, { status: 400 });
    console.error("[GET /api/admin/b2b/summary]", error);
    return NextResponse.json({ error: "Gagal mengambil summary B2B" }, { status: 500 });
  }
}
