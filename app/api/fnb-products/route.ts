import { NextResponse } from "next/server";
import { getActiveFnbProducts } from "@/lib/fnb";

export async function GET() {
  try {
    return NextResponse.json(await getActiveFnbProducts(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/fnb-products]", error);
    return NextResponse.json({ error: "Gagal memuat menu F&B" }, { status: 500 });
  }
}
