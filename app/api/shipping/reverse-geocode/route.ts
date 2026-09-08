import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
    return NextResponse.json({ error: "Koordinat lokasi tidak valid" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`,
      { headers: { "User-Agent": "Marica-Web/1.0 contact@marica.id" }, next: { revalidate: 300 } }
    );
    const data = await response.json();
    if (!response.ok || !data?.address) {
      return NextResponse.json({ error: "Alamat dari lokasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ address: data.address });
  } catch (error) {
    console.error("[GET /api/shipping/reverse-geocode]", error);
    return NextResponse.json({ error: "Gagal mengambil alamat dari lokasi" }, { status: 502 });
  }
}