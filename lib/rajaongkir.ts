const BASE_URL = "https://rajaongkir.komerce.id/api/v1";

async function komerceFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      key: process.env.RAJAONGKIR_API_KEY!,
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json();

  // NOTE: belum kekonfirmasi 100% bentuk error response API baru ini,
  // sesuaikan kondisi ini kalau ternyata errornya kebentuk beda pas ditest
  if (!res.ok) {
    throw new Error(data?.meta?.message ?? data?.message ?? "RajaOngkir API error");
  }

  return data.data ?? data;
}

// Cari ID destinasi (kota/kecamatan) berdasarkan keyword,
// dipakai buat cari ID kota ASAL (sekali di awal) maupun ID tujuan (tiap checkout)
export async function searchDestination(query: string) {
  const params = new URLSearchParams({ search: query, limit: "10", offset: "0" });
  return komerceFetch(`/destination/domestic-destination?${params.toString()}`);
}

export async function getShippingCost(params: {
  destinationId: string;
  weightGrams: number;
  courier: string; // "jne", atau gabung beberapa "jne:sicepat:jnt" (cek dokumentasi kalau ini bener support multi)
}) {
  const originId = process.env.RAJAONGKIR_ORIGIN_ID;

  if (!originId) {
    throw new Error(
      "RAJAONGKIR_ORIGIN_ID belum diset di .env - cari dulu ID-nya lewat GET /api/shipping/destinations?search=nama-kota-marica"
    );
  }

  const body = new URLSearchParams({
    origin: originId,
    destination: params.destinationId,
    weight: String(params.weightGrams),
    courier: params.courier,
  });

  return komerceFetch("/calculate/domestic-cost", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}