import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { validateText } from "@/lib/request-validation";

export async function GET(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchCheck = validateText(new URL(request.url).searchParams.get("search"), "Search member", 120);
  if (searchCheck.error || typeof searchCheck.value !== "string") {
    return NextResponse.json({ error: "Masukkan nama, email, atau nomor WhatsApp member" }, { status: 400 });
  }

  try {
    const now = new Date();
    const members = await prisma.user.findMany({
      where: {
        role: "USER",
        OR: [
          { name: { contains: searchCheck.value, mode: "insensitive" } },
          { email: { contains: searchCheck.value, mode: "insensitive" } },
          { whatsapp: { contains: searchCheck.value } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        pointAccount: { select: { balance: true } },
        vouchers: {
          where: { status: "AVAILABLE", voucher: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } },
          orderBy: { redeemedAt: "desc" },
          select: { id: true, status: true, voucher: { select: { id: true, code: true, title: true, discountAmount: true, expiresAt: true } } },
        },
      },
    });

    return NextResponse.json({ members: members.map((member) => ({ ...member, pointsBalance: member.pointAccount?.balance ?? 0 })) });
  } catch (error) {
    console.error("[GET /api/cashier/members]", error);
    return NextResponse.json({ error: "Gagal mencari member" }, { status: 500 });
  }
}
