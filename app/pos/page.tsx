"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  Minus,
  Package,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingCart,
  Ticket,
  Trash2,
  UserRound,
  AlertCircle,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  images?: { url: string }[];
};
type PackageItem = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  maxParticipants?: number;
};
type MemberVoucher = {
  id: string;
  voucher: { code: string; title: string; discountAmount: number };
};
type Member = {
  id: string;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  pointsBalance: number;
  vouchers?: MemberVoucher[];
};
type CartItem = {
  key: string;
  type: "PRODUCT" | "PLAYPASS" | "TABLE_FEE";
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  tableNumber?: string;
};
type Shift = { id: string; openingCash: number; openedAt: string };
type CatalogTab = "PRODUCT" | "PLAYPASS" | "TABLE_FEE";
type CheckInMode = "EVENT" | "PLAYPASS";
type Sale = {
  id: string;
  transactionNumber: string;
  status: string;
  total: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: { itemName: string; quantity: number }[];
};
type ActiveTable = {
  id: string;
  sessionNumber: string;
  tableNumber: string;
  endsAt: string;
  package: { name: string };
};

const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function PosPage() {
  const [tab, setTab] = useState<CatalogTab>("PRODUCT");
  const [products, setProducts] = useState<Product[]>([]);
  const [playpasses, setPlaypasses] = useState<PackageItem[]>([]);
  const [tableFees, setTableFees] = useState<PackageItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "QRIS">(
    "CASH",
  );
  const [tableNumber, setTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVoiding, setIsVoiding] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [activeTables, setActiveTables] = useState<ActiveTable[]>([]);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [checkInMode, setCheckInMode] = useState<CheckInMode>("EVENT");
  const [checkInToken, setCheckInToken] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isCameraActive) return;
    const scanner = new Html5Qrcode("kasir-qr-reader");
    scannerRef.current = scanner;
    void scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (decodedText) => {
          setCheckInToken(decodedText);
          setIsCameraActive(false);
          void scanner.stop().catch(() => undefined);
        },
        () => undefined,
      )
      .catch(() => {
        setIsCameraActive(false);
        setNotice({
          type: "error",
          text: "Kamera tidak dapat diakses. Gunakan input kode QR.",
        });
      });
    return () => {
      void scanner.stop().catch(() => undefined);
      scanner.clear();
      scannerRef.current = null;
    };
  }, [isCameraActive]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=50", { cache: "no-store" }).then((res) =>
        res.json(),
      ),
      fetch("/api/cashier/playpasses", { cache: "no-store" }).then((res) =>
        res.json(),
      ),
      fetch("/api/cashier/table-fees/packages", { cache: "no-store" }).then(
        (res) => res.json(),
      ),
      fetch("/api/cashier/shifts", { cache: "no-store" }).then((res) =>
        res.json(),
      ),
      fetch("/api/cashier/sales?limit=20", { cache: "no-store" }).then((res) =>
        res.json(),
      ),
      fetch("/api/cashier/table-fees", { cache: "no-store" }).then((res) =>
        res.json(),
      ),
    ])
      .then(
        ([
          productData,
          playpassData,
          tableFeeData,
          shiftData,
          salesData,
          tableData,
        ]) => {
          setProducts(productData.products ?? []);
          setPlaypasses(Array.isArray(playpassData) ? playpassData : []);
          setTableFees(Array.isArray(tableFeeData) ? tableFeeData : []);
          setShift(shiftData.shift ?? null);
          setSales(Array.isArray(salesData.sales) ? salesData.sales : []);
          setActiveTables(
            Array.isArray(tableData.sessions) ? tableData.sessions : [],
          );
        },
      )
      .catch(() =>
        setNotice({ type: "error", text: "Katalog POS gagal dimuat." }),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const value = memberQuery.trim();
    if (value.length < 2) {
      setMembers([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/cashier/members?search=${encodeURIComponent(value)}`, {
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => setMembers(data.members ?? []))
        .catch(() => setMembers([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [memberQuery]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const paid = Number(paidAmount) || 0;
  const change = Math.max(0, paid - total);
  const catalog =
    tab === "PRODUCT" ? products : tab === "PLAYPASS" ? playpasses : tableFees;
  const filteredCatalog = catalog.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  function addItem(item: Product | PackageItem) {
    const type = tab;
    const key = `${type}-${item.id}`;
    if (type === "TABLE_FEE") {
      setCart((current) => [
        ...current,
        {
          key: `${key}-${Date.now()}`,
          type,
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          tableNumber,
        },
      ]);
      return;
    }
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing)
        return current.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + 1 } : line,
        );
      return [
        ...current,
        {
          key,
          type,
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(key: string, delta: number) {
    setCart((current) =>
      current.flatMap((item) =>
        item.key !== key
          ? item
          : item.quantity + delta > 0
            ? [{ ...item, quantity: item.quantity + delta }]
            : [],
      ),
    );
  }

  async function openShift(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/cashier/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openingCash: Number(openingCash) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice({ type: "error", text: data.error ?? "Shift gagal dibuka." });
      return;
    }
    setShift(data);
    setOpeningCash("");
    setNotice({ type: "success", text: "Shift berhasil dibuka." });
  }

  async function submitSale(event: React.FormEvent) {
    event.preventDefault();
    if (!shift) {
      setNotice({ type: "error", text: "Buka shift terlebih dahulu." });
      return;
    }
    if (cart.length === 0) {
      setNotice({ type: "error", text: "Tambahkan item ke keranjang." });
      return;
    }
    if (
      cart.some(
        (item) => item.type === "TABLE_FEE" && !item.tableNumber?.trim(),
      )
    ) {
      setNotice({
        type: "error",
        text: "Masukkan nomor meja untuk Table Fee.",
      });
      return;
    }
    setIsSubmitting(true);
    setNotice(null);
    const res = await fetch("/api/cashier/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: member?.id,
        paymentMethod,
        paidAmount: paid,
        items: cart.map((item) => ({
          type: item.type,
          productId: item.type === "PRODUCT" ? item.itemId : undefined,
          packageId: item.type !== "PRODUCT" ? item.itemId : undefined,
          tableNumber: item.tableNumber,
          quantity: item.quantity,
        })),
      }),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (!res.ok) {
      setNotice({
        type: "error",
        text: data.error ?? "Transaksi gagal disimpan.",
      });
      return;
    }
    setCart([]);
    setPaidAmount("");
    setMember(null);
    setMemberQuery("");
    setLastSaleId(data.id ?? null);
    setSales((current) => [data, ...current]);
    setNotice({
      type: "success",
      text: `Transaksi ${data.transactionNumber} berhasil dibuat.`,
    });
  }

  async function closeShift(event: React.FormEvent) {
    event.preventDefault();
    if (!shift) return;
    setIsClosing(true);
    const res = await fetch(`/api/cashier/shifts/${shift.id}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closingCash: Number(closingCash) }),
    });
    const data = await res.json();
    setIsClosing(false);
    if (!res.ok) {
      setNotice({ type: "error", text: data.error ?? "Shift gagal ditutup." });
      return;
    }
    setShift(null);
    setClosingCash("");
    setNotice({
      type: "success",
      text: `Shift ditutup. Selisih kas ${money(data.difference ?? 0)}.`,
    });
  }

  async function voidSale(sale: Sale) {
    if (!window.confirm(`Void transaksi ${sale.transactionNumber}?`)) return;
    setIsVoiding(sale.id);
    const res = await fetch(`/api/cashier/sales/${sale.id}/void`, {
      method: "POST",
    });
    const data = await res.json();
    setIsVoiding(null);
    if (!res.ok) {
      setNotice({
        type: "error",
        text: data.error ?? "Transaksi gagal di-void.",
      });
      return;
    }
    setSales((current) =>
      current.map((item) =>
        item.id === sale.id ? { ...item, status: "VOIDED" } : item,
      ),
    );
    setNotice({
      type: "success",
      text: `Transaksi ${sale.transactionNumber} berhasil di-void.`,
    });
  }

  async function printReceipt(saleId: string) {
    const res = await fetch(`/api/cashier/sales/${saleId}/receipt`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice({ type: "error", text: data.error ?? "Struk gagal dimuat." });
      return;
    }
    const popup = window.open("", "_blank", "width=420,height=720");
    if (!popup) {
      setNotice({
        type: "error",
        text: "Izinkan pop-up browser untuk mencetak struk.",
      });
      return;
    }
    popup.document.write(
      `<html><head><title>${data.transactionNumber}</title><style>body{font:14px Arial;padding:24px;color:#222}h1{text-align:center;font-size:20px}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:6px 0;border-bottom:1px solid #eee}td:last-child{text-align:right}strong{font-size:18px}</style></head><body><h1>${data.title}</h1><p>${data.transactionNumber}<br>${new Date(data.date).toLocaleString("id-ID")}<br>Kasir: ${data.cashierName}</p><table>${data.items.map((item: { name: string; quantity: number; subtotal: number }) => `<tr><td>${item.name} x${item.quantity}</td><td>${money(item.subtotal)}</td></tr>`).join("")}</table><p>Total: <strong>${money(data.total)}</strong></p><p>Bayar: ${money(data.paidAmount)}<br>Kembalian: ${money(data.changeAmount)}</p><script>window.print();</script></body></html>`,
    );
    popup.document.close();
  }

  async function submitCheckIn(event: React.FormEvent) {
    event.preventDefault();
    const token = checkInToken.trim();
    if (!token) return;
    const endpoint =
      checkInMode === "EVENT"
        ? "/api/event-tickets/check-in"
        : "/api/cashier/playpasses/check-in";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: token }),
    });
    const data = await res.json();
    setNotice({
      type: res.ok ? "success" : "error",
      text: res.ok
        ? `${data.message ?? "Check-in berhasil"}${data.ticket?.participantName ? `: ${data.ticket.participantName}` : data.ticket?.ticketNumber ? `: ${data.ticket.ticketNumber}` : ""}`
        : (data.error ?? "Check-in gagal"),
    });
    if (res.ok) setCheckInToken("");
  }

  return (
    <div className="mx-auto min-h-full max-w-375 pb-10">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-marica-amber-text">
            Marica Point of Sale
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-marica-ink">
            Sales POS
          </h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Layani transaksi produk dan aktivitas dalam satu pembayaran.
          </p>
        </div>
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${shift ? "border-marica-green/30 bg-marica-green/10" : "border-marica-rose-deep/20 bg-white"}`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${shift ? "bg-marica-green" : "bg-marica-rose-deep"}`}
          />
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft">
              Status shift
            </p>
            <p className="font-body text-sm font-bold text-marica-ink">
              {shift
                ? `Aktif sejak ${new Date(shift.openedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                : "Belum dibuka"}
            </p>
          </div>
        </div>
      </header>

      {notice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-marica-ink/35 p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-live="assertive"
        >
          <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_24px_80px_rgba(28,27,27,0.22)]">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${notice.type === "error" ? "bg-marica-rose-deep/10 text-marica-rose-deep" : "bg-marica-green/10 text-green-700"}`}
            >
              {notice.type === "error" ? (
                <AlertCircle className="h-7 w-7" />
              ) : (
                <CheckCircle2 className="h-7 w-7" />
              )}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-marica-ink">
              {notice.type === "error" ? "Ada masalah" : "Berhasil"}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-marica-ink-soft">
              {notice.text}
            </p>
            {notice.type === "success" && lastSaleId && (
              <button
                type="button"
                onClick={() => void printReceipt(lastSaleId)}
                className="mt-5 w-full rounded-xl border border-marica-amber-dark py-3 font-body text-sm font-bold text-marica-amber-text"
              >
                Cetak struk
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setLastSaleId(null);
              }}
              className={`mt-3 w-full rounded-xl py-3 font-body text-sm font-bold text-white ${notice.type === "error" ? "bg-marica-rose-deep hover:brightness-105" : "bg-marica-amber-dark hover:brightness-105"}`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {!shift ? (
        <form
          onSubmit={openShift}
          className="mb-6 flex flex-col gap-4 rounded-3xl border border-marica-amber/30 bg-linear-to-r from-marica-amber/20 via-white to-marica-rose/15 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-marica-amber-text">
              Mulai operasional
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
              Buka shift kasir
            </h2>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              Setorkan kas awal sebelum menerima transaksi.
            </p>
          </div>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="opening-cash">
              Kas awal
            </label>
            <input
              id="opening-cash"
              required
              min="0"
              type="number"
              value={openingCash}
              onChange={(event) => setOpeningCash(event.target.value)}
              placeholder="Kas awal"
              className="w-36 rounded-xl border border-black/10 bg-white px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark focus:ring-4 focus:ring-marica-amber/15"
            />
            <button className="rounded-xl bg-marica-amber-dark px-5 py-3 font-body text-sm font-bold text-white shadow-sm transition hover:brightness-105">
              Buka shift
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={closeShift}
          className="mb-6 flex flex-col gap-4 rounded-3xl border border-marica-green/25 bg-marica-green/10 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-green-700">
              Shift aktif
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
              Kas awal {money(shift.openingCash)}
            </h2>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              Dibuka {new Date(shift.openedAt).toLocaleString("id-ID")}. Tutup
              shift setelah kas dihitung.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="closing-cash">
              Kas akhir
            </label>
            <input
              id="closing-cash"
              required
              min="0"
              type="number"
              value={closingCash}
              onChange={(event) => setClosingCash(event.target.value)}
              placeholder="Kas akhir"
              className="w-36 rounded-xl border border-black/10 bg-white px-3 py-3 font-body text-sm outline-none focus:border-marica-green focus:ring-4 focus:ring-marica-green/15"
            />
            <button
              disabled={isClosing}
              className="rounded-xl bg-marica-ink px-5 py-3 font-body text-sm font-bold text-white shadow-sm transition hover:bg-black/80"
            >
              {isClosing ? "Menutup..." : "Akhiri shift"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="min-w-0 rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-marica-amber-text">
                Katalog
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
                Pilih item penjualan
              </h2>
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/60" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari produk atau paket..."
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/20 py-2.5 pl-9 pr-3 font-body text-sm outline-none focus:border-marica-amber-dark focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-black/5 pb-3">
            {(
              [
                ["PRODUCT", "Produk", Package],
                ["PLAYPASS", "Playpass", Ticket],
                ["TABLE_FEE", "Table Fee", LayoutGrid],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-body text-sm font-semibold transition ${tab === value ? "bg-marica-amber-dark text-white" : "text-marica-ink-soft hover:bg-marica-sky-light/60"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          {tab === "TABLE_FEE" && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-marica-amber/10 p-3">
              <LayoutGrid className="h-5 w-5 text-marica-amber-text" />
              <label
                className="flex-1 font-body text-sm font-semibold text-marica-ink"
                htmlFor="table-number"
              >
                Nomor meja
              </label>
              <input
                id="table-number"
                value={tableNumber}
                onChange={(event) => setTableNumber(event.target.value)}
                placeholder="A01"
                className="w-28 rounded-lg border border-marica-amber/30 bg-white px-3 py-2 font-body text-sm outline-none focus:border-marica-amber-dark"
              />
            </div>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p className="col-span-full py-12 text-center font-body text-sm text-marica-ink-soft">
                Memuat katalog...
              </p>
            ) : (
              filteredCatalog.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={
                    "stock" in item && (item.stock <= 0 || !item.isActive)
                  }
                  onClick={() => addItem(item)}
                  className="group overflow-hidden rounded-2xl border border-black/8 bg-white text-left transition hover:-translate-y-0.5 hover:border-marica-amber/60 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <div className="relative flex h-36 items-center justify-center bg-marica-cream/60">
                    {tab === "PRODUCT" &&
                    "images" in item &&
                    item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marica-amber/15 text-marica-amber-text">
                        {tab === "PRODUCT" ? (
                          <Package className="h-6 w-6" />
                        ) : tab === "PLAYPASS" ? (
                          <Ticket className="h-6 w-6" />
                        ) : (
                          <LayoutGrid className="h-6 w-6" />
                        )}
                      </span>
                    )}
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-marica-amber-text shadow-sm">
                      <Plus className="h-4 w-4 transition group-hover:scale-110" />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 min-h-10 font-body text-sm font-bold text-marica-ink">
                      {item.name}
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold text-marica-amber-text">
                      {money(item.price)}
                    </p>
                    {"stock" in item && (
                      <p className="mt-1 font-body text-xs text-marica-ink-soft">
                        Stok {item.stock}
                      </p>
                    )}
                    {"durationMinutes" in item && (
                      <p className="mt-1 font-body text-xs text-marica-ink-soft">
                        {item.durationMinutes} menit
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <aside className="flex min-h-150 flex-col rounded-3xl border border-black/5 bg-white shadow-sm">
          <div className="border-b border-black/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-marica-amber-text">
                  Pesanan aktif
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
                  Keranjang
                </h2>
              </div>
              <span className="rounded-full bg-marica-amber/15 px-2.5 py-1 font-body text-xs font-bold text-marica-amber-text">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} item
              </span>
            </div>
          </div>
          <div className="flex-1 p-5">
            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 py-12 text-center">
                  <ShoppingCart className="mx-auto h-8 w-8 text-marica-ink-soft/25" />
                  <p className="mt-3 font-body text-sm text-marica-ink-soft">
                    Keranjang masih kosong
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-xl bg-marica-sky-light/25 p-3"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-marica-ink">
                          {item.name}
                        </p>
                        <p className="mt-1 font-body text-xs text-marica-ink-soft">
                          {money(item.price)}
                          {item.tableNumber
                            ? ` · Meja ${item.tableNumber}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCart((current) =>
                            current.filter((line) => line.key !== item.key),
                          )
                        }
                        aria-label={`Hapus ${item.name}`}
                        className="text-marica-rose-deep"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, -1)}
                          aria-label="Kurangi jumlah"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-marica-ink-soft"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center font-body text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, 1)}
                          aria-label="Tambah jumlah"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-marica-ink-soft"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-body text-sm font-bold text-marica-ink">
                        {money(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 border-t border-black/5 pt-5">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-marica-amber-text" />
                <p className="font-body text-sm font-bold text-marica-ink">
                  Member
                </p>
                {member && (
                  <button
                    type="button"
                    onClick={() => setMember(null)}
                    className="ml-auto text-xs font-semibold text-marica-rose-deep"
                  >
                    Hapus
                  </button>
                )}
              </div>
              {member ? (
                <div className="mt-2 rounded-xl bg-marica-green/10 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm font-bold text-marica-ink">
                        {member.name ?? member.email}
                      </p>
                      <p className="font-body text-xs text-green-700">
                        {member.pointsBalance.toLocaleString("id-ID")} poin
                      </p>
                    </div>
                    <Check className="h-5 w-5 text-green-700" />
                  </div>
                  {member.vouchers && member.vouchers.length > 0 && (
                    <div className="mt-3 border-t border-green-700/10 pt-3">
                      <p className="font-body text-[11px] font-bold uppercase tracking-wide text-green-800">
                        Voucher tersedia
                      </p>
                      {member.vouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className="mt-1 flex items-center justify-between font-body text-xs text-green-800"
                        >
                          <span>
                            {voucher.voucher.code} · {voucher.voucher.title}
                          </span>
                          <span>{money(voucher.voucher.discountAmount)}</span>
                        </div>
                      ))}
                      <p className="mt-2 font-body text-[10px] text-green-800/70">
                        Voucher belum diterapkan pada mixed sale.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
                  <input
                    value={memberQuery}
                    onChange={(event) => setMemberQuery(event.target.value)}
                    placeholder="Cari nama, email, WhatsApp"
                    className="w-full rounded-xl border border-black/10 py-2.5 pl-9 pr-3 font-body text-xs outline-none focus:border-marica-amber-dark"
                  />
                  {members.length > 0 && (
                    <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl">
                      {members.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            setMember(item);
                            setMembers([]);
                            setMemberQuery("");
                          }}
                          className="flex w-full items-center justify-between border-b border-black/5 px-3 py-2.5 text-left last:border-0 hover:bg-marica-sky-light/50"
                        >
                          <span>
                            <span className="block font-body text-xs font-bold text-marica-ink">
                              {item.name ?? item.email}
                            </span>
                            <span className="block font-body text-[11px] text-marica-ink-soft">
                              {item.whatsapp ?? item.email}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-marica-ink-soft/50" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <form onSubmit={submitSale} className="border-t border-black/5 p-5">
            <div className="mb-4 flex items-end justify-between">
              <span className="font-body text-sm font-semibold text-marica-ink-soft">
                Total pembayaran
              </span>
              <strong className="font-display text-2xl text-marica-amber-text">
                {money(total)}
              </strong>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["CASH", "Tunai", Banknote],
                  ["CARD", "Kartu", CreditCard],
                  ["QRIS", "QRIS", QrCode],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => {
                    setPaymentMethod(value);
                    if (value !== "CASH") setPaidAmount(String(total));
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 font-body text-xs font-bold ${paymentMethod === value ? "border-marica-amber-dark bg-marica-amber/10 text-marica-amber-text" : "border-black/10 text-marica-ink-soft"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <label
              className="mt-3 block font-body text-xs font-semibold text-marica-ink-soft"
              htmlFor="paid-amount"
            >
              Nominal dibayar
            </label>
            <input
              id="paid-amount"
              required
              min={total}
              type="number"
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
              placeholder={money(total)}
              className="mt-1 w-full rounded-xl border border-marica-amber/50 px-3 py-3 font-body text-base font-bold outline-none focus:ring-4 focus:ring-marica-amber/15"
            />
            <div className="mt-3 flex justify-between font-body text-sm">
              <span className="text-marica-ink-soft">Kembalian</span>
              <span className="font-bold text-marica-green">
                {money(change)}
              </span>
            </div>
            <button
              disabled={isSubmitting || !shift || cart.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-marica-amber-dark py-3.5 font-body text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting ? (
                "Memproses..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Selesaikan pembayaran
                </>
              )}
            </button>
          </form>
        </aside>
      </div>

      <section className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-marica-amber-text">
              Validasi akses
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
              Check-in QR
            </h2>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              Scan tiket workshop atau Playpass sebelum pengunjung masuk.
            </p>
          </div>
          <div className="flex gap-2">
            {(
              [
                ["EVENT", "Event / Workshop"],
                ["PLAYPASS", "Playpass"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCheckInMode(value)}
                className={`rounded-xl px-3 py-2 font-body text-xs font-bold ${checkInMode === value ? "bg-marica-amber-dark text-white" : "bg-marica-sky-light/50 text-marica-ink-soft"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <form
          onSubmit={submitCheckIn}
          className="mt-5 flex flex-col gap-3 lg:flex-row"
        >
          <div className="flex flex-1 gap-2">
            <label className="sr-only" htmlFor="kasir-qr-token">
              Kode QR
            </label>
            <input
              id="kasir-qr-token"
              value={checkInToken}
              onChange={(event) => setCheckInToken(event.target.value)}
              placeholder="Scan atau masukkan kode QR"
              className="min-w-0 flex-1 rounded-xl border border-black/10 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark focus:ring-4 focus:ring-marica-amber/15"
            />
            <button
              type="submit"
              disabled={!checkInToken.trim()}
              className="rounded-xl bg-marica-amber-dark px-5 py-3 font-body text-sm font-bold text-white disabled:opacity-40"
            >
              Check-in
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsCameraActive((active) => !active)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-marica-amber-dark px-4 py-3 font-body text-sm font-bold text-marica-amber-text"
          >
            <QrCode className="h-4 w-4" />
            {isCameraActive ? "Tutup kamera" : "Buka kamera"}
          </button>
        </form>
        {isCameraActive && (
          <div
            id="kasir-qr-reader"
            className="mt-4 max-w-sm overflow-hidden rounded-2xl border border-black/10"
          />
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-marica-amber-text">
              Operasional area
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
              Table Fee aktif
            </h2>
          </div>
          <span className="rounded-full bg-marica-amber/15 px-3 py-1 font-body text-xs font-bold text-marica-amber-text">
            {activeTables.length} meja
          </span>
        </div>
        {activeTables.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-black/10 py-8 text-center font-body text-sm text-marica-ink-soft">
            Belum ada sesi meja aktif.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeTables.map((table) => (
              <div
                key={table.id}
                className="rounded-2xl bg-marica-amber/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-semibold text-marica-amber-text">
                    Meja {table.tableNumber}
                  </p>
                  <LayoutGrid className="h-5 w-5 text-marica-amber-text" />
                </div>
                <p className="mt-2 font-body text-sm font-semibold text-marica-ink">
                  {table.package.name}
                </p>
                <p className="mt-1 font-body text-xs text-marica-ink-soft">
                  Selesai{" "}
                  {new Date(table.endsAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-marica-amber-text">
              Kontrol transaksi
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
              Riwayat transaksi
            </h2>
          </div>
          <span className="rounded-full bg-marica-sky-light/60 px-3 py-1 font-body text-xs font-bold text-marica-ink-soft">
            {sales.length} transaksi
          </span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-180 text-left">
            <thead>
              <tr className="border-b border-black/5 font-body text-xs uppercase tracking-wide text-marica-ink-soft/60">
                <th className="pb-3">Transaksi</th>
                <th className="pb-3">Item</th>
                <th className="pb-3">Pembayaran</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center font-body text-sm text-marica-ink-soft"
                  >
                    Belum ada transaksi pada akun ini.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-4">
                      <p className="font-body text-sm font-bold text-marica-ink">
                        {sale.transactionNumber}
                      </p>
                      <p className="font-body text-xs text-marica-ink-soft">
                        {new Date(sale.createdAt).toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="max-w-64 py-4 font-body text-sm text-marica-ink-soft">
                      {sale.items
                        .map((item) => `${item.itemName} x${item.quantity}`)
                        .join(", ")}
                    </td>
                    <td className="py-4 font-body text-sm text-marica-ink-soft">
                      {sale.paymentMethod}
                    </td>
                    <td className="py-4 font-body text-sm font-bold text-marica-ink">
                      {money(sale.total)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${sale.status === "VOIDED" ? "bg-marica-rose-deep/10 text-marica-rose-deep" : "bg-marica-green/10 text-green-700"}`}
                      >
                        {sale.status === "VOIDED" ? "Void" : "Selesai"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void printReceipt(sale.id)}
                          title="Cetak struk"
                          aria-label="Cetak struk"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-marica-ink-soft hover:bg-marica-sky-light/50"
                        >
                          <ReceiptText className="h-4 w-4" />
                        </button>
                        {sale.status === "COMPLETED" && (
                          <button
                            type="button"
                            disabled={isVoiding === sale.id}
                            onClick={() => void voidSale(sale)}
                            className="rounded-lg border border-marica-rose-deep/30 px-2.5 py-1.5 font-body text-xs font-bold text-marica-rose-deep hover:bg-marica-rose-deep/10 disabled:opacity-50"
                          >
                            {isVoiding === sale.id ? "..." : "Void"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
