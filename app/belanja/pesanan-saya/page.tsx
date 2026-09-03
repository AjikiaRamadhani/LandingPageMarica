"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft, Store, PackageSearch } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AddressModal, { type ShippingAddress } from "../../components/belanja/AddressModal";

/* -------------------------------------------------------------------------- */
/*  Types + mock data — replace with a fetch to /api/orders                   */
/* -------------------------------------------------------------------------- */

type OrderStatus =
  | "Menunggu Pembayaran"
  | "Diproses"
  | "Dikirim"
  | "Selesai"
  | "Dibatalkan";

type OrderItem = {
  productName: string;
  qty: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  orderCode: string;
  date: string;
  storeName: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
};

const TABS: { key: "Semua" | OrderStatus; label: string }[] = [
  { key: "Semua", label: "Semua Pesanan" },
  { key: "Menunggu Pembayaran", label: "Menunggu Pembayaran" },
  { key: "Diproses", label: "Diproses" },
  { key: "Dikirim", label: "Dikirim" },
  { key: "Selesai", label: "Selesai" },
  { key: "Dibatalkan", label: "Dibatalkan" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  "Menunggu Pembayaran": "bg-marica-amber/20 text-marica-amber-text",
  Diproses: "bg-marica-sky-light text-marica-blue",
  Dikirim: "bg-marica-violet/20 text-marica-violet-deep",
  Selesai: "bg-marica-green/15 text-marica-green",
  Dibatalkan: "bg-marica-rose-deep/10 text-marica-rose-deep",
};

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderCode: "ORD-20231015-001",
    date: "15 Okt 2023",
    storeName: "Marica Official Store",
    status: "Menunggu Pembayaran",
    items: [{ productName: "Creative Building Blocks Set", qty: 1, price: 250000 }],
    total: 250000,
  },
  {
    id: "2",
    orderCode: "ORD-20231012-045",
    date: "12 Okt 2023",
    storeName: "Marica Official Store",
    status: "Diproses",
    items: [{ productName: "Junior Science Explorer Kit", qty: 2, price: 150000 }],
    total: 300000,
  },
  {
    id: "3",
    orderCode: "ORD-20231005-089",
    date: "05 Okt 2023",
    storeName: "Marica Official Store",
    status: "Selesai",
    items: [{ productName: "Buku Cerita Petualangan Hutan", qty: 1, price: 85000 }],
    total: 85000,
  },
];

// Mock saved addresses — replace with a fetch to /api/addresses.
const MOCK_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-1",
    label: "Rumah",
    isPrimary: true,
    recipientName: "Budi Santoso",
    phone: "081234567890",
    province: "Jawa Tengah",
    city: "Kota Magelang",
    district: "Magelang Tengah",
    postalCode: "56117",
    fullAddress: "Jl. Pahlawan No. 12, RT 03/RW 05",
  },
];

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PesananSayaPage() {
  const router = useRouter();

  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("Semua");
  const [searchInput, setSearchInput] = useState("");

  // --- Shipping address modal (opened from "Bayar Sekarang") -----------
  const [addresses, setAddresses] = useState<ShippingAddress[]>(MOCK_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    MOCK_ADDRESSES[0]?.id ?? null
  );
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesTab = activeTab === "Semua" || order.status === activeTab;
      const matchesSearch =
        !q ||
        order.orderCode.toLowerCase().includes(q) ||
        order.items.some((item) => item.productName.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchInput]);

  const handleBayarSekarang = (order: Order) => {
    setPayingOrder(order);
    setAddressModalOpen(true);
  };

  const handleConfirmAddress = (address: ShippingAddress) => {
    setAddressModalOpen(false);
    if (!payingOrder) return;

    // TODO: replace with your real payment call, e.g.:
    // const res = await fetch(`/api/orders/${payingOrder.id}/pay`, {
    //   method: "POST",
    //   body: JSON.stringify({ shippingAddressId: address.id }),
    // });
    // const { paymentUrl } = await res.json();
    // router.push(paymentUrl);
    console.log("Lanjut ke pembayaran:", { order: payingOrder.orderCode, address });
    setPayingOrder(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="section-soft-bg flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 inline-flex items-center gap-1.5 font-body text-sm font-medium text-marica-ink-soft transition hover:text-marica-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-display text-2xl font-bold text-marica-ink sm:text-3xl">
              Pesanan Saya
            </h1>

            <div className="relative sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/60" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari pesanan atau nomor resi"
                className="w-full rounded-full border border-marica-ink/10 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/50 shadow-sm outline-none transition focus:border-marica-amber-dark/50"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-marica-ink/10 pb-px">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative shrink-0 whitespace-nowrap pb-3 font-body text-sm font-medium transition ${
                    active ? "text-marica-amber-dark" : "text-marica-ink-soft hover:text-marica-ink"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-marica-amber-dark" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders */}
          <div className="mt-6 flex flex-col gap-5">
            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-marica-ink/5 bg-white py-16 text-center shadow-sm">
                <PackageSearch className="h-10 w-10 text-marica-ink-soft/40" />
                <p className="font-display text-base font-semibold text-marica-ink">
                  Tidak ada pesanan
                </p>
                <p className="max-w-xs font-body text-sm text-marica-ink-soft">
                  Belum ada pesanan yang cocok dengan pencarian atau filter ini.
                </p>
              </div>
            )}

            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onBayarSekarang={handleBayarSekarang} />
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setSelectedAddressId}
        onAddAddress={(addr) => {
          setAddresses((prev) => [...prev, addr]);
          setSelectedAddressId(addr.id);
          // TODO: persist to your backend, e.g. POST /api/addresses
        }}
        onConfirm={handleConfirmAddress}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Order card                                                                */
/* -------------------------------------------------------------------------- */

function OrderCard({
  order,
  onBayarSekarang,
}: {
  order: Order;
  onBayarSekarang: (order: Order) => void;
}) {
  return (
    <div className="rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-[0_10px_28px_rgba(120,60,10,0.06)] sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-marica-ink/5 pb-4">
        <span className="flex items-center gap-2 font-body text-sm font-semibold text-marica-ink">
          <Store className="h-4 w-4 text-marica-ink-soft" />
          {order.storeName}
          <span className="font-normal text-marica-ink-soft">· {order.date}</span>
        </span>

        <span className="flex items-center gap-2.5">
          <span className="font-body text-xs text-marica-ink-soft">{order.orderCode}</span>
          <span
            className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}
          >
            {order.status}
          </span>
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-4 py-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-marica-cream">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold text-marica-ink sm:text-base">
                {item.productName}
              </p>
              <p className="mt-0.5 font-body text-xs text-marica-ink-soft sm:text-sm">
                {item.qty} barang x {formatRupiah(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total + actions */}
      <div className="flex flex-col items-end gap-3 border-t border-marica-ink/5 pt-4">
        <div className="text-right">
          <p className="font-body text-xs text-marica-ink-soft">Total Pesanan</p>
          <p className="font-display text-xl font-bold text-marica-amber-text">
            {formatRupiah(order.total)}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2.5">
          <Link
            href={`/belanja/pesanan-saya/${order.id}`}
            className="rounded-full border-2 border-marica-amber-dark/40 px-5 py-2 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10"
          >
            Detail Pesanan
          </Link>

          {order.status === "Menunggu Pembayaran" && (
            <button
              type="button"
              onClick={() => onBayarSekarang(order)}
              className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Bayar Sekarang
            </button>
          )}

          {order.status === "Diproses" && (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-full border-2 border-marica-ink/10 px-5 py-2 font-body text-sm font-semibold text-marica-ink-soft/50"
            >
              Lacak Pesanan
            </button>
          )}

          {order.status === "Dikirim" && (
            <Link
              href={`/belanja/pesanan-saya/${order.id}/lacak`}
              className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Lacak Pesanan
            </Link>
          )}

          {order.status === "Selesai" && (
            <>
              <Link
                href="/belanja"
                className="rounded-full border-2 border-marica-amber-dark/40 px-5 py-2 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10"
              >
                Beli Lagi
              </Link>
              <button
                type="button"
                className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                Beri Ulasan
              </button>
            </>
          )}

          {order.status === "Dibatalkan" && (
            <Link
              href="/belanja"
              className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Beli Lagi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}