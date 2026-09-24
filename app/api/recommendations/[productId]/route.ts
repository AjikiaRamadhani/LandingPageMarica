import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit"));
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 5;

    if (!productId) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 },
      );
    }

    const products = await getRecommendations(productId, limit);
    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    console.error("[GET /api/recommendations/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}
