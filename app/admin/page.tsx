"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Newspaper,
  FileEdit,
  CheckCircle2,
  Tags,
  ArrowRight,
  ArrowUpRight,
  Plus,
  ImageOff,
  Package,
  FileDown,
  ShoppingCart,
  CalendarDays,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { categoryBadgeStyle } from "@/lib/category-color";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  colorTag: string | null;
};
type ApiArticle = {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  category: ApiCategory | null;
};

type Stats = {
  totalArticles: number;
  published: number;
  draft: number;
  categories: number;
  products: number;
  activePrintables: number;
  orders: number;
  activeEvents: number;
};

type DashboardMode = "content" | "commerce";
type ApiProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
};
type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string | null } | null;
  items: { productName: string; quantity: number }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const [mode, setMode] = useState<DashboardMode>("content");
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentArticles, setRecentArticles] = useState<ApiArticle[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [
          publishedRes,
          draftRes,
          recentRes,
          categoriesRes,
          productsRes,
          printablesRes,
          ordersRes,
          eventsRes,
        ] = await Promise.all([
          fetch("/api/admin/articles?status=PUBLISHED&limit=1", {
            cache: "no-store",
          }),
          fetch("/api/admin/articles?status=DRAFT&limit=1", {
            cache: "no-store",
          }),
          fetch("/api/admin/articles?limit=5", { cache: "no-store" }),
          fetch("/api/admin/article-categories", { cache: "no-store" }),
          fetch("/api/admin/products?limit=5", { cache: "no-store" }),
          fetch("/api/admin/printables", { cache: "no-store" }),
          fetch("/api/admin/orders?limit=1", { cache: "no-store" }),
          fetch("/api/admin/events", { cache: "no-store" }),
        ]);

        if (
          !publishedRes.ok ||
          !draftRes.ok ||
          !recentRes.ok ||
          !categoriesRes.ok ||
          !productsRes.ok ||
          !printablesRes.ok ||
          !ordersRes.ok ||
          !eventsRes.ok
        ) {
          throw new Error("Gagal memuat ringkasan dashboard");
        }

        const [
          published,
          draft,
          recent,
          categories,
          products,
          printables,
          orders,
          events,
        ] = await Promise.all([
          publishedRes.json(),
          draftRes.json(),
          recentRes.json(),
          categoriesRes.json(),
          productsRes.json(),
          printablesRes.json(),
          ordersRes.json(),
          eventsRes.json(),
        ]);

        if (cancelled) return;

        setStats({
          totalArticles:
            (published.pagination?.total ?? 0) + (draft.pagination?.total ?? 0),
          published: published.pagination?.total ?? 0,
          draft: draft.pagination?.total ?? 0,
          categories: Array.isArray(categories) ? categories.length : 0,
          products: products.pagination?.total ?? 0,
          activePrintables: Array.isArray(printables)
            ? printables.filter((item) => item.isActive).length
            : 0,
          orders: orders.pagination?.total ?? 0,
          activeEvents: Array.isArray(events)
            ? events.filter((item) => item.isActive).length
            : 0,
        });
        setRecentArticles(
          Array.isArray(recent.articles) ? recent.articles : [],
        );
        setProducts(Array.isArray(products.products) ? products.products : []);
        setRecentOrders(Array.isArray(orders.orders) ? orders.orders : []);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat ringkasan dashboard",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const contentCards = [
    {
      label: "Total Artikel",
      value: stats?.totalArticles,
      icon: Newspaper,
      accent: "bg-marica-blue/15 text-marica-blue",
    },
    {
      label: "Published",
      value: stats?.published,
      icon: CheckCircle2,
      accent: "bg-marica-green/15 text-marica-green",
    },
    {
      label: "Draft",
      value: stats?.draft,
      icon: FileEdit,
      accent: "bg-marica-amber/15 text-marica-amber-dark",
    },
    {
      label: "Kategori",
      value: stats?.categories,
      icon: Tags,
      accent: "bg-marica-violet-deep/15 text-marica-violet-deep",
    },
  ];

  const commerceCards = [
    {
      label: "Total produk",
      value: stats?.products,
      icon: Package,
      accent: "bg-marica-blue/15 text-marica-blue",
    },
    {
      label: "Pesanan",
      value: stats?.orders,
      icon: ShoppingCart,
      accent: "bg-marica-amber/15 text-marica-amber-dark",
    },
    {
      label: "Event aktif",
      value: stats?.activeEvents,
      icon: CalendarDays,
      accent: "bg-marica-violet-deep/15 text-marica-violet-deep",
    },
    {
      label: "Printable aktif",
      value: stats?.activePrintables,
      icon: FileDown,
      accent: "bg-marica-green/15 text-marica-green",
    },
  ];
  const activeCards = mode === "content" ? contentCards : commerceCards;
  const lowStockProducts = products.filter(
    (product) => product.isActive && product.stock <= 5,
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-marica-ink">
              {mode === "content"
                ? "Ringkasan Artikel & Blog"
                : "Ringkasan Belanja"}
            </h1>
            <p className="mt-2 font-body text-sm text-marica-ink-soft">
              {mode === "content"
                ? "Kelola performa konten dan aktivitas editorial Marica."
                : "Pantau produk, pesanan, stok, dan event Marica."}
            </p>
          </div>
          <div className="inline-flex w-fit rounded-2xl border border-black/5 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setMode("content")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-body text-sm font-semibold transition ${mode === "content" ? "bg-marica-amber-dark text-white shadow-sm" : "text-marica-ink-soft hover:text-marica-ink"}`}
            >
              <Newspaper className="h-4 w-4" /> Artikel / Blog
            </button>
            <button
              type="button"
              onClick={() => setMode("commerce")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-body text-sm font-semibold transition ${mode === "commerce" ? "bg-marica-amber-dark text-white shadow-sm" : "text-marica-ink-soft hover:text-marica-ink"}`}
            >
              <ShoppingCart className="h-4 w-4" /> Belanja
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <p className="mt-6 rounded-xl bg-marica-rose-deep/10 px-4 py-2.5 font-body text-sm text-marica-rose-deep">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {activeCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="min-h-40 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_12px_32px_rgba(80,50,10,0.07)] sm:p-7"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}
            >
              <card.icon className="h-6 w-6" />
            </div>
            <p className="mt-5 font-display text-4xl font-semibold text-marica-ink">
              {isLoading ? (
                <span className="inline-block h-7 w-10 animate-pulse rounded bg-black/5 align-middle" />
              ) : (
                (card.value ?? 0)
              )}
            </p>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              {card.label}
            </p>
          </motion.div>
        ))}
      </div>

      {mode === "content" ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-2 lg:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-marica-amber-text">
                  Aktivitas konten
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-marica-ink">
                  Artikel terbaru
                </h2>
              </div>
              <Link
                href="/admin/artikel"
                className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 font-body text-xs font-semibold text-marica-ink-soft transition hover:border-marica-amber/40 hover:bg-marica-sky-light/40 hover:text-marica-ink"
              >
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-15 animate-pulse rounded-xl bg-black/5"
                  />
                ))}

              {!isLoading && recentArticles.length === 0 && (
                <p className="py-6 text-center font-body text-sm text-marica-ink-soft">
                  Belum ada artikel. Yuk tulis yang pertama!
                </p>
              )}

              {!isLoading &&
                recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/admin/artikel/${article.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition hover:border-black/5 hover:bg-marica-sky-light/40"
                  >
                    <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-marica-sky-light/60">
                      {article.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={article.coverImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff className="h-4 w-4 text-marica-ink-soft/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-sm font-medium text-marica-ink">
                        {article.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        {article.category && (
                          <span
                            className="rounded-full px-2 py-0.5 font-body text-[11px] font-medium"
                            style={categoryBadgeStyle(
                              article.category.colorTag,
                              article.category.slug,
                            )}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <span className="font-body text-xs text-marica-ink-soft">
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 font-body text-xs font-semibold ${
                        article.status === "PUBLISHED"
                          ? "bg-marica-green/15 text-marica-green"
                          : "bg-black/5 text-marica-ink-soft"
                      }`}
                    >
                      {article.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                    <ArrowUpRight className="hidden h-4 w-4 text-marica-ink-soft/50 transition group-hover:block" />
                  </Link>
                ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:p-7"
          >
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-marica-amber-text">
              Rekomendasi
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-marica-ink">
              Prioritas hari ini
            </h2>
            <div className="mt-4 rounded-xl bg-marica-amber/10 p-3.5">
              <p className="font-body text-sm font-semibold text-marica-ink">
                Jaga konten tetap aktif
              </p>
              <p className="mt-1 font-body text-xs leading-relaxed text-marica-ink-soft">
                {stats?.draft ?? 0} draft artikel menunggu ditinjau. Pastikan
                konten yang siap sudah dipublikasikan.
              </p>
              <Link
                href="/admin/artikel?status=DRAFT"
                className="mt-3 inline-flex items-center gap-1 font-body text-xs font-semibold text-marica-amber-text hover:underline"
              >
                Tinjau draft <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 border-t border-black/5 pt-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                Akses cepat
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/admin/artikel/baru"
                  className="flex items-center justify-between rounded-xl bg-marica-amber-dark px-4 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                >
                  <span className="flex items-center gap-3">
                    <Plus className="h-4 w-4" /> Tulis artikel baru
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/kategori"
                  className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 font-body text-sm font-semibold text-marica-ink transition hover:bg-marica-sky-light/40"
                >
                  <span className="flex items-center gap-3">
                    <Tags className="h-4 w-4" /> Kelola kategori
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-marica-ink-soft" />
                </Link>
                <Link
                  href="/admin/printables"
                  className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 font-body text-sm font-semibold text-marica-ink transition hover:bg-marica-sky-light/40"
                >
                  <span className="flex items-center gap-3">
                    <FileDown className="h-4 w-4" /> Kelola printable
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-marica-ink-soft" />
                </Link>
                <Link
                  href="/admin/belanja/baru"
                  className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 font-body text-sm font-semibold text-marica-ink transition hover:bg-marica-sky-light/40"
                >
                  <span className="flex items-center gap-3">
                    <Package className="h-4 w-4" /> Tambah produk
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-marica-ink-soft" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-2 lg:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-marica-amber-text">
                  Operasional belanja
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
                  Pesanan terbaru
                </h2>
              </div>
              <Link
                href="/admin/pesanan"
                className="font-body text-sm font-semibold text-marica-blue"
              >
                Lihat semua
              </Link>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-140 text-left">
                <thead>
                  <tr className="border-b border-black/5 font-body text-xs uppercase tracking-wide text-marica-ink-soft/60">
                    <th className="pb-3">Pesanan</th>
                    <th className="pb-3">Pelanggan</th>
                    <th className="pb-3">Item</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={5} className="py-5">
                            <div className="h-8 animate-pulse rounded-lg bg-black/5" />
                          </td>
                        </tr>
                      ))
                    : recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-black/5 last:border-0"
                        >
                          <td className="py-4 font-body text-sm font-semibold text-marica-ink">
                            #{order.orderNumber}
                          </td>
                          <td className="py-4 font-body text-sm text-marica-ink-soft">
                            {order.user?.name ??
                              order.user?.email ??
                              "Pelanggan"}
                          </td>
                          <td className="py-4 font-body text-sm text-marica-ink-soft">
                            {order.items[0]?.productName ?? "-"}
                          </td>
                          <td className="py-4 font-body text-sm text-marica-ink">
                            Rp {order.total.toLocaleString("id-ID")}
                          </td>
                          <td className="py-4">
                            <span className="rounded-full bg-marica-amber/20 px-2.5 py-1 font-body text-xs font-semibold text-marica-amber-text">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {!isLoading && recentOrders.length === 0 && (
                <p className="py-8 text-center font-body text-sm text-marica-ink-soft">
                  Belum ada pesanan.
                </p>
              )}
            </div>
          </motion.div>
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-marica-rose-deep" />
                <h2 className="font-display text-xl font-semibold text-marica-ink">
                  Peringatan stok
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {lowStockProducts.length === 0 ? (
                  <p className="font-body text-sm text-marica-ink-soft">
                    Tidak ada stok kritis.
                  </p>
                ) : (
                  lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl bg-marica-rose-deep/5 px-4 py-3"
                    >
                      <div>
                        <p className="font-body text-sm font-semibold text-marica-ink">
                          {product.name}
                        </p>
                        <p className="font-body text-xs text-marica-rose-deep">
                          Sisa {product.stock} unit
                        </p>
                      </div>
                      <Link
                        href={`/admin/belanja/${product.id}`}
                        className="font-body text-xs font-semibold text-marica-rose-deep"
                      >
                        Restock
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-marica-amber-text" />
                <h2 className="font-display text-xl font-semibold text-marica-ink">
                  Aksi cepat
                </h2>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/admin/belanja/baru"
                  className="rounded-xl bg-marica-amber-dark px-4 py-3 text-center font-body text-sm font-semibold text-white"
                >
                  Tambah produk
                </Link>
                <Link
                  href="/admin/event/baru"
                  className="rounded-xl border border-marica-amber-dark px-4 py-3 text-center font-body text-sm font-semibold text-marica-amber-text"
                >
                  Buat event
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
