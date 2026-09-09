import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  validateInteger,
  validateOptionalText,
  validateText,
} from "@/lib/request-validation";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { order: "asc" }, take: 1 } },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], subtotal: 0 });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return NextResponse.json({ ...cart, subtotal });
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ error: "Gagal mengambil keranjang" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { productId, quantity, bundleId } = (await request.json()) as {
      productId?: string;
      quantity?: number;
      bundleId?: string;
    };

    const productIdCheck = validateText(productId, "productId", 100);
    const quantityCheck = validateInteger(quantity, "Quantity", 1);
    const bundleIdCheck = validateOptionalText(bundleId, "bundleId", 100);
    if (
      productIdCheck.error ||
      quantityCheck.error ||
      bundleIdCheck.error ||
      typeof productIdCheck.value !== "string" ||
      typeof quantityCheck.value !== "number" ||
      (bundleIdCheck.value !== null &&
        typeof bundleIdCheck.value !== "string")
    ) {
      return NextResponse.json(
        {
          error:
            productIdCheck.error ??
            quantityCheck.error ??
            bundleIdCheck.error ??
            "Data item keranjang tidak valid",
        },
        { status: 400 },
      );
    }

    const productIdValue = productIdCheck.value;
    const quantityValue = quantityCheck.value;

    const product = await prisma.product.findUnique({ where: { id: productIdValue } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // Kalau produk udah ada di cart, tambahin quantity-nya; kalau belum, bikin baris baru
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: productIdValue } },
    });

    const requestedQuantity = (existingItem?.quantity ?? 0) + quantityValue;
    if (product.stock < requestedQuantity) {
      return NextResponse.json(
        { error: `Stok "${product.name}" tidak cukup, sisa ${product.stock}` },
        { status: 400 }
      );
    }

    const cartItem = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantityValue },
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: productIdValue,
            quantity: quantityValue,
            bundleId: bundleIdCheck.value,
          },
        });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cart]", error);
    return NextResponse.json({ error: "Gagal menambah ke keranjang" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { itemId, quantity } = (await request.json()) as {
      itemId?: string;
      quantity?: number;
    };
    const itemIdCheck = validateText(itemId, "itemId", 100);
    const quantityCheck = validateInteger(quantity, "Quantity", 1);
    if (
      itemIdCheck.error ||
      quantityCheck.error ||
      typeof itemIdCheck.value !== "string" ||
      typeof quantityCheck.value !== "number"
    ) {
      return NextResponse.json(
        { error: itemIdCheck.error ?? quantityCheck.error ?? "Data tidak valid" },
        { status: 400 },
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemIdCheck.value, cart: { userId: session.user.id } },
      include: { product: true },
    });
    if (!item) return NextResponse.json({ error: "Item keranjang tidak ditemukan" }, { status: 404 });
    if (quantityCheck.value > item.product.stock) {
      return NextResponse.json(
        { error: `Stok "${item.product.name}" tidak cukup, sisa ${item.product.stock}` },
        { status: 400 },
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: quantityCheck.value },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/cart]", error);
    return NextResponse.json({ error: "Gagal mengubah jumlah item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { itemId } = (await request.json()) as { itemId?: string };
    const itemIdCheck = validateText(itemId, "itemId", 100);
    if (itemIdCheck.error || typeof itemIdCheck.value !== "string") {
      return NextResponse.json({ error: itemIdCheck.error }, { status: 400 });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemIdCheck.value, cart: { userId: session.user.id } },
      select: { id: true },
    });
    if (!item) return NextResponse.json({ error: "Item keranjang tidak ditemukan" }, { status: 404 });

    await prisma.cartItem.delete({ where: { id: item.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/cart]", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}
