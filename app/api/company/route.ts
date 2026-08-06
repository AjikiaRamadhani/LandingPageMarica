import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.companyProfile.findFirst();

    if (!data) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/company]", error);
    return NextResponse.json({ error: "Failed to fetch company profile" }, { status: 500 });
  }
}
