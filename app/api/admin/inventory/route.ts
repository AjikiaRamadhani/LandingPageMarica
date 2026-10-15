import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";
import {
  changeInventoryQuantity,
  INVENTORY_LOCATIONS,
  type InventoryLocation,
} from "@/lib/inventory-stock";

const movementTypes = ["PURCHASE", "ADJUSTMENT", "RETURN", "RESERVATION", "RELEASE", "TRANSFER"] as const;
const isLocation = (value: unknown): value is InventoryLocation =>
  typeof value === "string" && INVENTORY_LOCATIONS.includes(value as InventoryLocation);

async function authorizeInventoryAdmin() {
  const session = await auth();
  if (!session?.user) {
    return {
      authorized: false as const,
      session: null,
      response: NextResponse.json(
        { error: "Sesi login tidak valid atau sudah berakhir. Silakan login kembali." },
        { status: 401 },
      ),
    };
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return {
      authorized: false as const,
      session: null,
      response: NextResponse.json({ error: "Akses inventaris hanya tersedia untuk admin." }, { status: 403 }),
    };
  }
  return { authorized: true as const, session, response: null };
}

export async function GET(request: Request) {
  const authorization = await authorizeInventoryAdmin();
  if (!authorization.authorized) return authorization.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 25)));
    const productsPage = Math.max(1, Number(searchParams.get("productsPage") ?? 1));
    const productsLimit = Math.min(100, Math.max(1, Number(searchParams.get("productsLimit") ?? 50)));
    const search = searchParams.get("search")?.trim();
    const productId = searchParams.get("productId")?.trim() || undefined;
    const type = searchParams.get("type")?.trim() || undefined;
    const location = searchParams.get("location");
    const movementWhere = {
      ...(productId ? { productId } : {}),
      ...(isLocation(location) ? { location } : {}),
      ...(type && movementTypes.includes(type as (typeof movementTypes)[number])
        ? { type: type as (typeof movementTypes)[number] }
        : {}),
    };

    const productWhere = {
      isActive: true,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };
    const [movements, total, totalProducts, inventoryRows, lowStockRows, products, productTotal] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where: movementWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: { select: { id: true, name: true, sku: true, stock: true } },
          order: { select: { id: true, orderNumber: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.inventoryMovement.count({ where: movementWhere }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productInventory.findMany({
        where: { product: { isActive: true } },
        select: { location: true, quantity: true },
      }),
      prisma.productInventory.findMany({
        where: {
          ...(isLocation(location) ? { location } : {}),
          quantity: { lte: 10 },
          product: { isActive: true },
        },
        orderBy: [{ quantity: "asc" }, { product: { name: "asc" } }],
        take: 10,
        include: { product: { select: { id: true, name: true, sku: true, price: true, isActive: true } } },
      }),
      prisma.product.findMany({
        where: productWhere,
        orderBy: { name: "asc" },
        skip: (productsPage - 1) * productsLimit,
        take: productsLimit,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          inventories: { select: { location: true, quantity: true } },
        },
      }),
      prisma.product.count({ where: productWhere }),
    ]);

    const locations = INVENTORY_LOCATIONS.map((key) => {
      const quantities = inventoryRows.filter((row) => row.location === key);
      const lowStockCount = quantities.filter((row) => row.quantity > 0 && row.quantity <= 10).length;
      const outOfStockCount = quantities.filter((row) => row.quantity === 0).length;
      return {
        location: key,
        totalStock: quantities.reduce((sum, row) => sum + row.quantity, 0),
        lowStockCount,
        outOfStockCount,
      };
    });

    return NextResponse.json({
      movements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      products,
      productsPagination: {
        page: productsPage,
        limit: productsLimit,
        total: productTotal,
        totalPages: Math.ceil(productTotal / productsLimit),
      },
      summary: {
        totalProducts,
        locations,
        lowStockProducts: lowStockRows
          .filter((row) => row.product.isActive)
          .map((row) => ({ ...row.product, location: row.location, stock: row.quantity })),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/inventory]", error);
    return NextResponse.json({ error: "Gagal mengambil data inventaris" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeInventoryAdmin();
  if (!authorization.authorized) return authorization.response;
  const { session } = authorization;

  try {
    const body = (await request.json()) as {
      productId?: string;
      quantityDelta?: number;
      type?: string;
      location?: string;
      fromLocation?: string;
      toLocation?: string;
      reason?: string;
      referenceId?: string;
    };
    const productIdCheck = validateText(body.productId, "productId", 100);
    const quantityCheck = validateInteger(body.quantityDelta, "quantityDelta", -2147483647);
    const reasonCheck = validateOptionalText(body.reason, "Alasan", 240);
    const referenceCheck = validateOptionalText(body.referenceId, "Reference ID", 120);
    const type = body.type;

    if (
      productIdCheck.error ||
      quantityCheck.error ||
      reasonCheck.error ||
      referenceCheck.error ||
      typeof productIdCheck.value !== "string" ||
      typeof quantityCheck.value !== "number" ||
      quantityCheck.value === 0 ||
      quantityCheck.value > 2147483647 ||
      (reasonCheck.value !== null && typeof reasonCheck.value !== "string") ||
      (referenceCheck.value !== null && typeof referenceCheck.value !== "string") ||
      !type ||
      !movementTypes.includes(type as (typeof movementTypes)[number]) ||
      (type === "TRANSFER"
        ? !isLocation(body.fromLocation) || !isLocation(body.toLocation) || body.fromLocation === body.toLocation || quantityCheck.value < 1
        : !isLocation(body.location))
    ) {
      return NextResponse.json(
        { error: "Data penyesuaian atau transfer inventaris tidak valid" },
        { status: 400 },
      );
    }

    if (
      (["PURCHASE", "RETURN", "RELEASE"].includes(type) && quantityCheck.value < 0) ||
      (type === "RESERVATION" && quantityCheck.value > 0)
    ) {
      return NextResponse.json(
        { error: "Arah perubahan jumlah tidak sesuai dengan jenis pergerakan stok" },
        { status: 400 },
      );
    }

    const productId = productIdCheck.value;
    const quantityDelta = quantityCheck.value;
    const movement = await prisma.$transaction(async (tx) => {
      const lockedProduct = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "products" WHERE id = ${productId} FOR UPDATE
      `;
      if (lockedProduct.length === 0) throw new Error("PRODUCT_NOT_FOUND");

      if (type === "TRANSFER") {
        const fromLocation = body.fromLocation as InventoryLocation;
        const toLocation = body.toLocation as InventoryLocation;
        const referenceId = referenceCheck.value || `TRANSFER-${randomUUID()}`;
        await changeInventoryQuantity(tx, productId, fromLocation, -quantityDelta);
        await changeInventoryQuantity(tx, productId, toLocation, quantityDelta);
        const [outgoing, incoming] = await Promise.all([
          tx.inventoryMovement.create({
            data: {
              productId, location: fromLocation, type: "TRANSFER",
              quantityDelta: -quantityDelta, reason: reasonCheck.value,
              referenceId, createdById: session.user.id,
            },
          }),
          tx.inventoryMovement.create({
            data: {
              productId, location: toLocation, type: "TRANSFER",
              quantityDelta, reason: reasonCheck.value,
              referenceId, createdById: session.user.id,
            },
          }),
        ]);
        return { transferId: referenceId, movements: [outgoing, incoming] };
      }

      const location = body.location as InventoryLocation;
      await changeInventoryQuantity(tx, productId, location, quantityDelta);
      return tx.inventoryMovement.create({
        data: {
          productId,
          location,
          type: type as Exclude<(typeof movementTypes)[number], "TRANSFER">,
          quantityDelta,
          reason: reasonCheck.value,
          referenceId: referenceCheck.value,
          createdById: session.user.id,
        },
        include: { product: { select: { id: true, name: true, stock: true } } },
      });
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STOCK_SHORTAGE") {
      return NextResponse.json({ error: "Stok sumber tidak mencukupi" }, { status: 409 });
    }
    console.error("[POST /api/admin/inventory]", error);
    return NextResponse.json({ error: "Gagal mengubah inventaris" }, { status: 500 });
  }
}
