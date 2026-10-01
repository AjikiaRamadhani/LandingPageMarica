import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const statuses = new Set(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]);

export async function GET(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 20)));
    const status = params.get("status")?.toUpperCase();
    const search = params.get("search")?.trim();
    if (status && !statuses.has(status)) return NextResponse.json({ error: "Status inquiry tidak valid" }, { status: 400 });
    const where = {
      ...(status ? { status: status as "NEW" | "CONTACTED" | "QUOTED" | "WON" | "LOST" } : {}),
      ...(search ? { OR: [{ inquiryNumber: { contains: search, mode: "insensitive" as const } }, { organizationName: { contains: search, mode: "insensitive" as const } }, { contactName: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {}),
    };
    const [inquiries, total] = await Promise.all([
      prisma.b2BInquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { _count: { select: { quotationItems: true } } } }),
      prisma.b2BInquiry.count({ where }),
    ]);
    return NextResponse.json({ inquiries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/admin/b2b/inquiries]", error);
    return NextResponse.json({ error: "Gagal mengambil inquiry B2B" }, { status: 500 });
  }
}
