import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { validateText } from "@/lib/request-validation";

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { qrToken?: string; ticketNumber?: string };
    const token = validateText(body.qrToken ?? body.ticketNumber, "QR Playpass", 160);
    if (token.error || typeof token.value !== "string") return NextResponse.json({ error: "QR Playpass wajib diisi" }, { status: 400 });
    const ticket = await prisma.playpassTicket.findFirst({ where: { OR: [{ qrToken: token.value }, { ticketNumber: token.value }] }, include: { package: true, customer: { select: { name: true, email: true, whatsapp: true } } } });
    if (!ticket) return NextResponse.json({ error: "Tiket Playpass tidak ditemukan" }, { status: 404 });
    if (ticket.status !== "ACTIVE") return NextResponse.json({ error: "Tiket sudah digunakan atau tidak aktif", status: ticket.status }, { status: 409 });
    if (ticket.expiresAt <= new Date()) {
      await prisma.playpassTicket.update({ where: { id: ticket.id }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Tiket Playpass sudah expired" }, { status: 409 });
    }
    return NextResponse.json(await prisma.playpassTicket.update({ where: { id: ticket.id }, data: { status: "CHECKED_IN", checkedInAt: new Date() }, include: { package: true, customer: { select: { name: true, email: true, whatsapp: true } } } }));
  } catch (error) {
    console.error("[POST /api/cashier/playpasses/check-in]", error);
    return NextResponse.json({ error: "Gagal check-in Playpass" }, { status: 500 });
  }
}
