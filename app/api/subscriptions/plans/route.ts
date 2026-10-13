import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(await prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: [{ price: "asc" }, { createdAt: "desc" }] }));
}
