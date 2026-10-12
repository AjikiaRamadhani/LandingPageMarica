import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await prisma.preOrderCampaign.findFirst({ where: { slug, status: "PUBLISHED" }, include: { product: { include: { images: { orderBy: { order: "asc" } } } } } });
  if (!campaign) return NextResponse.json({ error: "Campaign tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ...campaign, remaining: campaign.stockLimit === null ? null : Math.max(0, campaign.stockLimit - campaign.reservedQuantity) });
}
