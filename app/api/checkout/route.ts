import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { snap } from "@/lib/midtrans";
import {
  validateOptionalText,
  validateText,
  validateInteger,
} from "@/lib/request-validation";

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

    const shippingNameCheck = validateText(shippingName, "Nama pengirim", 120);
    const shippingPhoneCheck = validateText(shippingPhone, "Nomor telepon", 30);
    const shippingAddressCheck = validateText(shippingAddress, "Alamat pengiriman", 500);
    const shippingCityCheck = validateText(shippingCity, "Kota", 120);
    const shippingProvinceCheck = validateText(shippingProvince, "Provinsi", 120);
    const shippingPostalCodeCheck = validateText(shippingPostalCode, "Kode pos", 20);
    const shippingCourierCheck = validateOptionalText(
      shippingCourier,
      "Kurir pengiriman",
      40,
    );
    const shippingServiceCheck = validateOptionalText(
      shippingService,
      "Layanan pengiriman",
      80,
    );
    const shippingCostCheck = validateInteger(shippingCost, "Biaya ongkir", 0);

    if (
      shippingNameCheck.error ||
      shippingPhoneCheck.error ||
      shippingAddressCheck.error ||
      shippingCityCheck.error ||
      shippingProvinceCheck.error ||
      shippingPostalCodeCheck.error ||
      shippingCourierCheck.error ||
      shippingServiceCheck.error ||
      shippingCostCheck.error ||
      typeof shippingNameCheck.value !== "string" ||
      typeof shippingPhoneCheck.value !== "string" ||
      typeof shippingAddressCheck.value !== "string" ||
      typeof shippingCityCheck.value !== "string" ||
      typeof shippingProvinceCheck.value !== "string" ||
      typeof shippingPostalCodeCheck.value !== "string" ||
      (shippingCourierCheck.value !== null &&
        typeof shippingCourierCheck.value !== "string") ||
      (shippingServiceCheck.value !== null &&
        typeof shippingServiceCheck.value !== "string") ||
      typeof shippingCostCheck.value !== "number"
    ) {
      const errorMessage =
        shippingNameCheck.error ??
        shippingPhoneCheck.error ??
        shippingAddressCheck.error ??
        shippingCityCheck.error ??
        shippingProvinceCheck.error ??
        shippingPostalCodeCheck.error ??
        shippingCourierCheck.error ??
        shippingServiceCheck.error ??
        shippingCostCheck.error ??
        "Data alamat pengiriman belum lengkap";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const shippingNameValue = shippingNameCheck.value;
    const shippingPhoneValue = shippingPhoneCheck.value;
    const shippingAddressValue = shippingAddressCheck.value;
    const shippingCityValue = shippingCityCheck.value;
    const shippingProvinceValue = shippingProvinceCheck.value;
    const shippingPostalCodeValue = shippingPostalCodeCheck.value;
    const shippingCourierValue = shippingCourierCheck.value;
    const shippingServiceValue = shippingServiceCheck.value;
    const shippingCostValue = shippingCostCheck.value;

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

    const subtotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + shippingCostValue;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const productIds = checkoutItems.map((item) => item.productId);
      const lockedProducts = await tx.$queryRaw<Array<{ id: string; name: string; stock: number }>>`
        SELECT id, name, stock
        FROM "products"
        WHERE id = ANY (${productIds})
        FOR UPDATE
      `;

      const stockMap = new Map(lockedProducts.map((product) => [product.id, product]));
      const shortage = checkoutItems.find((item) => {
        const product = stockMap.get(item.productId);
        return !product || product.stock < item.quantity;
      });

      if (shortage) {
        const product = stockMap.get(shortage.productId);
        const currentStock = product?.stock ?? 0;
        throw Object.assign(new Error("STOCK_SHORTAGE"), {
          statusCode: 400,
          detail: `Stok "${shortage.product.name}" tidak cukup, sisa ${currentStock}`,
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          shippingName: shippingNameValue,
          shippingPhone: shippingPhoneValue,
          shippingAddress: shippingAddressValue,
          shippingCity: shippingCityValue,
          shippingProvince: shippingProvinceValue,
          shippingPostalCode: shippingPostalCodeValue,
          shippingCourier: shippingCourierValue,
          shippingService: shippingServiceValue,
          shippingCost: shippingCostValue,
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
    });

    // Minta Snap Token dari Midtrans
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderNumber,
        gross_amount: total,
      },
      customer_details: {
        first_name: shippingNameValue,
        phone: shippingPhoneValue,
        shipping_address: {
          address: shippingAddressValue,
          city: shippingCityValue,
          postal_code: shippingPostalCodeValue,
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
          price: shippingCostValue,
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
    const statusCode =
      typeof error === "object" && error && "statusCode" in error && typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    if (statusCode === 400) {
      const detail =
        typeof error === "object" && error && "detail" in error && typeof error.detail === "string"
          ? error.detail
          : "Stok produk tidak cukup";
      return NextResponse.json({ error: detail }, { status: 400 });
    }

    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Gagal memproses checkout" }, { status: 500 });
  }
}
