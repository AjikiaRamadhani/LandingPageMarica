import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const account = await prisma.pointAccount.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    return NextResponse.json({
      balance: account?.balance ?? 0,
      transactions: account?.transactions ?? [],
    });
  } catch (error) {
    console.error("[GET /api/points]", error);
    return NextResponse.json({ error: "Gagal mengambil saldo poin" }, { status: 500 });
  }
}
