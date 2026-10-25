import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const notification = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    });
    if (notification.count === 0) {
      return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/notifications/:id]", error);
    return NextResponse.json({ error: "Gagal menandai notifikasi" }, { status: 500 });
  }
}
