import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { snap } from "@/lib/midtrans";

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${date}-${random}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingProvince,
      shippingPostalCode,
      shippingCourier,
      shippingService,
      shippingCost,
      checkoutProductId,
    } = body as {
      shippingName?: string;
      shippingPhone?: string;
      shippingAddress?: string;
      shippingCity?: string;
      shippingProvince?: string;
      shippingPostalCode?: string;
      shippingCourier?: string;
      shippingService?: string;
      shippingCost?: number;
      checkoutProductId?: string;
    };

    if (
      !shippingName ||
      !shippingPhone ||
      !shippingAddress ||
      !shippingCity ||
      !shippingProvince ||
      !shippingPostalCode ||
      shippingCost === undefined
    ) {
      return NextResponse.json({ error: "Data alamat pengiriman belum lengkap" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: { include: { images: { take: 1, orderBy: { order: "asc" } } } } },
        },
      },
    });

    const checkoutItems = checkoutProductId
      ? cart?.items.filter((item) => item.productId === checkoutProductId) ?? []
      : cart?.items ?? [];

    if (!cart || checkoutItems.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Validasi ulang stok sebelum checkout, siapa tau stok berubah sejak ditambah ke keranjang
    for (const item of checkoutItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok "${item.product.name}" tidak cukup, sisa ${item.product.stock}` },
          { status: 400 }
        );
      }
    }

    const subtotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingProvince,
        shippingPostalCode,
        shippingCourier,
        shippingService,
        shippingCost,
        subtotal,
        total,
        paymentMethod: "midtrans",
        midtransOrderId: orderNumber,
        items: {
          create: checkoutItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productImageUrl: item.product.images[0]?.url,
            price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
            bundleId: item.bundleId,
          })),
        },
      },
      include: { items: true },
    });

    // Minta Snap Token dari Midtrans
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderNumber,
        gross_amount: total,
      },
      customer_details: {
        first_name: shippingName,
        phone: shippingPhone,
        shipping_address: {
          address: shippingAddress,
          city: shippingCity,
          postal_code: shippingPostalCode,
        },
      },
      item_details: [
        ...order.items.map((item) => ({
          id: item.productId,
          price: item.price,
          quantity: item.quantity,
          name: item.productName.slice(0, 50),
        })),
        {
          id: "SHIPPING",
          price: shippingCost,
          quantity: 1,
          name: `Ongkir (${shippingCourier ?? "-"} ${shippingService ?? ""})`,
        },
      ],
    } as Parameters<typeof snap.createTransaction>[0]);

    await prisma.order.update({
      where: { id: order.id },
      data: { midtransSnapToken: transaction.token },
    });

    // Kosongin keranjang setelah order berhasil dibuat
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        ...(checkoutProductId ? { productId: checkoutProductId } : {}),
      },
    });

    return NextResponse.json(
      {
        order,
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Gagal memproses checkout" }, { status: 500 });
  }
}