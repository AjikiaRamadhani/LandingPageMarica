import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const EVENT_TYPES = new Set(["VIEW", "CLICK", "CART", "PURCHASE"]);

export async function POST(request: Request) {
  if (isRateLimited(request, "recommendation-event", 180)) {
    return NextResponse.json({ error: "Terlalu banyak event" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as {
      productId?: unknown;
      type?: unknown;
      sessionId?: unknown;
    };
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim().toUpperCase() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!productId || productId.length > 100 || !EVENT_TYPES.has(type)) {
      return NextResponse.json({ error: "Data event tidak valid" }, { status: 400 });
    }

    if (sessionId && !/^[A-Za-z0-9_-]{16,100}$/.test(sessionId)) {
      return NextResponse.json({ error: "Session id tidak valid" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;
    if (!userId && !sessionId) {
      return NextResponse.json({ error: "Session id diperlukan" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // React Strict Mode and quick refreshes should not inflate view counts.
    const duplicateWindow = type === "VIEW" ? 15 : 2;
    const recentEvent = await prisma.recommendationEvent.findFirst({
      where: {
        productId,
        type: type as "VIEW" | "CLICK" | "CART" | "PURCHASE",
        createdAt: { gte: new Date(Date.now() - duplicateWindow * 60_000) },
        ...(userId ? { userId } : { userId: null, sessionId }),
      },
      select: { id: true },
    });

    if (recentEvent) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    await prisma.recommendationEvent.create({
      data: {
        userId,
        sessionId: sessionId || null,
        productId,
        type: type as "VIEW" | "CLICK" | "CART" | "PURCHASE",
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/recommendations/events]", error);
    return NextResponse.json({ error: "Gagal menyimpan event" }, { status: 500 });
  }
}
