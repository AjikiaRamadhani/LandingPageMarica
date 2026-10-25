import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addProductAvailability } from "@/lib/order-product-availability";
import { getTrackingUrl } from "@/lib/shipping-tracking";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    const enrichedOrders = await addProductAvailability(orders);
    return NextResponse.json(enrichedOrders.map((order) => ({
      ...order,
      trackingUrl: getTrackingUrl(order.shippingCourier, order.trackingNumber),
    })));
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat pesanan" }, { status: 500 });
  }
}
