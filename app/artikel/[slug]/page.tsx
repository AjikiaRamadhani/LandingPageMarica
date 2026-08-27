import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Share2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import ArticleComments from "../../components/Articlecomments";
import Footer from "../../components/Footer";
import { getArticleBySlug, getRelatedArticles, categories, categoryColorClasses } from "@/lib/artikel-data";
// Sesuaikan path ini kalau file config next-auth kamu tidak persis di
// project root sebagai `auth.ts` (mis. jadi `@/lib/auth` atau `@/auth/config`).
import { auth } from "@/lib/auth";

// Next.js 15: `params` di halaman adalah Promise, bukan objek biasa —
// ini yang bikin halaman kamu 404 sebelumnya (params.slug selalu undefined
// karena belum di-`await`, jadi getArticleBySlug tidak pernah ketemu
// artikelnya dan notFound() langsung kepanggil).
type Params = Promise<{ slug: string }>;

export default async function ArtikelDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const session = await auth();
  const commentUser = session?.user?.name ? { name: session.user.name } : null;

  const related = getRelatedArticles(article.slug, 3);
  const category = categories.find((c) => c.slug === article.categorySlug);
  const colors = category ? categoryColorClasses[category.color] : null;

  return (
    <div className="min-h-screen bg-marica-cream">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 pb-6 pt-6 lg:px-10">
        <nav className="font-body text-sm text-marica-ink-soft">
          <Link href="/artikel" className="hover:text-marica-ink">Artikel</Link>
          <span className="mx-2">/</span>
          {category && <span>{category.label}</span>}
        </nav>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 lg:grid-cols-[1fr_300px] lg:px-10">
        {/* Main article column */}
        <article>
          {colors && category && (
            <span className={`inline-block rounded-full px-3 py-1 font-body text-xs font-semibold ${colors.bg} ${colors.text}`}>
              {category.label}
            </span>
          )}

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-marica-ink sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 flex items-center justify-between border-b border-marica-ink/10 pb-5">
            <span className="inline-flex items-center gap-2 font-body text-sm text-marica-ink-soft">
              <CalendarDays className="h-4 w-4" />
              {article.date}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-body text-sm font-medium text-marica-ink-soft shadow-sm hover:text-marica-ink"
            >
              <Share2 className="h-4 w-4" /> Bagikan
            </button>
          </div>

          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority />
          </div>

          <div className="prose prose-neutral mt-8 max-w-none font-body text-marica-ink">
            {article.content.map((section) => (
              <div key={section.heading} className="mb-8">
                <h2 className="font-display text-xl font-bold text-marica-ink">{section.heading}</h2>
                {section.body.map((paragraph, i) => (
                  <p key={i} className="mt-3 leading-relaxed text-marica-ink-soft">
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex gap-2 leading-relaxed text-marica-ink-soft">
                        <span className="mt-1 text-marica-amber-text">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Komentar hanya bisa ditulis oleh user yang sudah login —
              ditangani di dalam komponen client ini. */}
          <ArticleComments initialComments={article.comments} user={commentUser} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-4">
          <h3 className="font-display text-base font-bold text-marica-ink">Artikel Lainnya</h3>
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/artikel/${item.slug}`}
              className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
              </div>
              <div>
                <span className="font-body text-xs font-semibold text-rose-500">
                  {categories.find((c) => c.slug === item.categorySlug)?.label}
                </span>
                <p className="line-clamp-2 font-body text-sm font-medium leading-snug text-marica-ink">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </aside>
      </div>

      {/* Newsletter CTA */}
      <section className="bg-marica-amber px-6 py-14 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl font-bold text-marica-ink sm:text-3xl">
            Jangan Ketinggalan Info Seru!
          </h2>
          <p className="max-w-md font-body text-sm text-marica-ink/80">
            Dapatkan update artikel terbaru, tips parenting, dan info event langsung di inbox Anda.
          </p>
          <form className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Email kamu..."
              className="w-full flex-1 rounded-full border-none px-5 py-3 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-marica-ink px-6 py-3 font-body text-sm font-semibold text-white transition hover:brightness-110"
            >
              Langganan
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}