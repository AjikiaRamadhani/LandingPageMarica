import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 20)));
    const search = params.get("search")?.trim();
    const where = {
      role: "USER" as const,
      ...(search
        ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }, { whatsapp: { contains: search } }] }
        : {}),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, whatsapp: true, role: true, createdAt: true, orders: { orderBy: { createdAt: "desc" }, select: { total: true, status: true, shippingPhone: true } }, pointAccount: { select: { balance: true } } } }),
      prisma.user.count({ where }),
    ]);
    const customers = users.map((user) => ({ id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp ?? user.orders[0]?.shippingPhone ?? null, role: user.role, status: user.orders.some((order) => order.status !== "CANCELLED" && order.status !== "EXPIRED") ? "ACTIVE" : "INACTIVE", totalOrders: user.orders.length, totalSpent: user.orders.filter((order) => order.status !== "CANCELLED" && order.status !== "EXPIRED").reduce((sum, order) => sum + order.total, 0), pointsBalance: user.pointAccount?.balance ?? 0, createdAt: user.createdAt }));
    return NextResponse.json({ customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/admin/customers]", error);
    return NextResponse.json({ error: "Gagal mengambil data pelanggan" }, { status: 500 });
  }
}
