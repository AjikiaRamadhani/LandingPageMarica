import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const searchParams = new URL(request.url).searchParams;
    const requestedLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 5;
    const rawSessionId = searchParams.get("sessionId");
    const sessionId =
      rawSessionId && /^[A-Za-z0-9_-]{16,100}$/.test(rawSessionId)
        ? rawSessionId
        : null;

    if (!productId) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 },
      );
    }

    const session = await auth();
    const products = await getRecommendations(productId, limit, {
      userId: session?.user?.id,
      sessionId,
    });
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
