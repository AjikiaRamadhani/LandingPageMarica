import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "productId dan quantity wajib diisi" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
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
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;
    if (product.stock < requestedQuantity) {
      return NextResponse.json(
        { error: `Stok "${product.name}" tidak cukup, sisa ${product.stock}` },
        { status: 400 }
      );
    }

    const cartItem = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        })
      : await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity, bundleId },
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
    if (!itemId || quantity == null || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "itemId dan quantity wajib valid" }, { status: 400 });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: session.user.id } },
      include: { product: true },
    });
    if (!item) return NextResponse.json({ error: "Item keranjang tidak ditemukan" }, { status: 404 });
    if (quantity > item.product.stock) {
      return NextResponse.json(
        { error: `Stok "${item.product.name}" tidak cukup, sisa ${item.product.stock}` },
        { status: 400 },
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
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
    if (!itemId) return NextResponse.json({ error: "itemId wajib diisi" }, { status: 400 });

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: session.user.id } },
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