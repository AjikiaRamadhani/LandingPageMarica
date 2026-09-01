export type ApiProductImage = {
  id: string;
  url: string;
  isVideo: boolean;
  order: number;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  ageMin: number | null;
  ageMax: number | null;
  skillFocus: string[];
  playerCount: string | null;
  isBestSeller: boolean;
  soldCount: number;
  ratingAvg: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string } | null;
  images: ApiProductImage[];
};

export type ApiProductsResponse = {
  products: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  colorTag: string | null;
  children: { id: string; name: string; slug: string }[];
};

export type SortValue = "newest" | "price_asc" | "price_desc" | "bestseller";

export type PriceRangeOption = {
  key: string;
  label: string;
  min?: number;
  max?: number;
};

export type AgeOption = {
  key: string;
  label: string;
  value: string; // "min-max", matches the API's `age` param contract
};

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "bestseller", label: "Terpopuler" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
];

export const PRICE_RANGES: PriceRangeOption[] = [
  { key: "all", label: "Semua Harga" },
  { key: "under-100", label: "Di bawah Rp 100.000", max: 100000 },
  { key: "100-300", label: "Rp 100.000 - Rp 300.000", min: 100000, max: 300000 },
  { key: "over-300", label: "Di atas Rp 300.000", min: 300000 },
];

export const AGE_OPTIONS: AgeOption[] = [
  { key: "0-2", label: "0 - 2 Tahun", value: "0-2" },
  { key: "3-5", label: "3 - 5 Tahun", value: "3-5" },
  { key: "6-8", label: "6 - 8 Tahun", value: "6-8" },
  { key: "9-99", label: "9+ Tahun", value: "9-99" },
];