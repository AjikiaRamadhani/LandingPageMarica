import { NextResponse } from "next/server";
import { getShippingCost } from "@/lib/rajaongkir";

export async function POST(request: Request) {
  try {
    const { destinationId, weightGrams, courier } = (await request.json()) as {
      destinationId?: string;
      weightGrams?: number;
      courier?: string;
    };

    if (!destinationId || !weightGrams || !courier) {
      return NextResponse.json(
        { error: "destinationId, weightGrams, dan courier wajib diisi" },
        { status: 400 }
      );
    }

    const result = await getShippingCost({ destinationId, weightGrams, courier });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/shipping/cost]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghitung ongkir" },
      { status: 500 }
    );
  }
}