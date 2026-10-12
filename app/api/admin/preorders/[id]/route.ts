import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json() as { title?: string; description?: string; price?: number; preorderOpenAt?: string; preorderCloseAt?: string | null; releaseAt?: string; stockLimit?: number | null; status?: "DRAFT" | "PUBLISHED" | "CLOSED" | "COMPLETED" };
    const updated = await prisma.preOrderCampaign.update({ where: { id }, data: { ...(body.title !== undefined ? { title: body.title.trim() } : {}), ...(body.description !== undefined ? { description: body.description.trim() } : {}), ...(body.price !== undefined ? { price: body.price } : {}), ...(body.preorderOpenAt !== undefined ? { preorderOpenAt: new Date(body.preorderOpenAt) } : {}), ...(body.preorderCloseAt !== undefined ? { preorderCloseAt: body.preorderCloseAt ? new Date(body.preorderCloseAt) : null } : {}), ...(body.releaseAt !== undefined ? { releaseAt: new Date(body.releaseAt) } : {}), ...(body.stockLimit !== undefined ? { stockLimit: body.stockLimit } : {}), ...(body.status !== undefined ? { status: body.status } : {}) } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/preorders/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui campaign pre-order" }, { status: 500 });
  }
}
