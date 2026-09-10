import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access-control";
import { getPosTransactionReceipt } from "@/lib/pos-receipt";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const receipt = await getPosTransactionReceipt(id);
    if (!receipt) return NextResponse.json({ error: "Transaksi POS tidak ditemukan" }, { status: 404 });
    return NextResponse.json(receipt);
  } catch (error) {
    console.error("[GET /api/cashier/transactions/[id]]", error);
    return NextResponse.json({ error: "Gagal mengambil detail transaksi POS" }, { status: 500 });
  }
}
