import { Prisma } from "@/app/generated/prisma";

export const B2B_STATUSES = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"] as const;
export const B2B_IN_PROGRESS_STATUSES = ["CONTACTED", "QUOTED"] as const;

function dateBoundary(value: string | null, end: boolean) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("INVALID_DATE_FILTER");
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_DATE_FILTER");
  if (end) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

export function getB2BInquiryFilters(params: URLSearchParams) {
  const rawStatus = params.get("status")?.toUpperCase() ?? "";
  const status = rawStatus === "IN_PROGRESS" ? rawStatus : rawStatus && B2B_STATUSES.includes(rawStatus as typeof B2B_STATUSES[number]) ? rawStatus : null;
  if (rawStatus && !status) throw new Error("INVALID_STATUS_FILTER");
  const organizationType = params.get("organizationType")?.trim().toUpperCase() || null;
  const dateFrom = dateBoundary(params.get("dateFrom"), false);
  const dateTo = dateBoundary(params.get("dateTo"), true);
  if (dateFrom && dateTo && dateFrom >= dateTo) throw new Error("INVALID_DATE_FILTER");
  const search = params.get("search")?.trim() || null;
  const where: Prisma.B2BInquiryWhereInput = {
    ...(status === "IN_PROGRESS" ? { status: { in: [...B2B_IN_PROGRESS_STATUSES] } } : status ? { status: status as typeof B2B_STATUSES[number] } : {}),
    ...(organizationType ? { organizationType: { equals: organizationType, mode: "insensitive" } } : {}),
    ...(dateFrom || dateTo ? { createdAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lt: dateTo } : {}) } } : {}),
    ...(search ? { OR: [{ inquiryNumber: { contains: search, mode: "insensitive" } }, { organizationName: { contains: search, mode: "insensitive" } }, { contactName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {}),
  };
  const sortBy = params.get("sortBy") ?? "createdAt";
  const sortOrder: "asc" | "desc" = params.get("sortOrder") === "asc" ? "asc" : "desc";
  const orderBy = sortBy === "organizationName" ? { organizationName: sortOrder } : sortBy === "eventDate" ? { eventDate: sortOrder } : sortBy === "status" ? { status: sortOrder } : { createdAt: sortOrder };
  if (!["createdAt", "organizationName", "eventDate", "status"].includes(sortBy)) throw new Error("INVALID_SORT_FILTER");
  return { where, orderBy, status, organizationType, dateFrom, dateTo, search, sortBy, sortOrder };
}
