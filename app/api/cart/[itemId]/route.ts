import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getOwnedCartItem(itemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) return null;
  return item;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { itemId } = await params;
    const { quantity } = (await request.json()) as { quantity?: number };

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "quantity minimal 1" }, { status: 400 });
    }

    const item = await getOwnedCartItem(itemId, session.user.id);
    if (!item) {
      return NextResponse.json({ error: "Item keranjang tidak ditemukan" }, { status: 404 });
    }

    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (product && product.stock < quantity) {
      return NextResponse.json({ error: `Stok tidak cukup, sisa ${product.stock}` }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/cart/[itemId]]", error);
    return NextResponse.json({ error: "Gagal update keranjang" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { itemId } = await params;

    const item = await getOwnedCartItem(itemId, session.user.id);
    if (!item) {
      return NextResponse.json({ error: "Item keranjang tidak ditemukan" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: "Item dihapus dari keranjang" });
  } catch (error) {
    console.error("[DELETE /api/cart/[itemId]]", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}