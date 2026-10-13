"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LockKeyhole, PlayCircle } from "lucide-react";

type Activity = { id: string; title: string; description: string; contentType: string; videoUrl: string | null; guideUrl: string | null; thumbnailUrl: string | null; ageMin: number | null; ageMax: number | null };

export default function SubscriptionActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/subscriptions/activities", { cache: "no-store" }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "Konten hanya tersedia untuk pelanggan aktif"); setActivities(d.activities ?? []); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <main className="min-h-screen bg-[#fff9f3] px-5 py-12 text-marica-ink"><div className="mx-auto max-w-6xl"><Link href="/subscription" className="text-sm font-semibold text-marica-amber-dark">← Subscription</Link><h1 className="mt-5 font-display text-4xl font-bold">Aktivitas Eksklusif</h1><p className="mt-2 text-sm text-marica-ink-soft">Konten bermain dan belajar khusus pelanggan Edu-Kit aktif.</p>{loading ? <p className="mt-10">Memuat aktivitas...</p> : error ? <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm"><LockKeyhole className="mx-auto h-12 w-12 text-marica-amber-dark" /><h2 className="mt-4 font-display text-xl font-bold">Konten khusus pelanggan aktif</h2><p className="mt-2 text-sm text-marica-ink-soft">{error}</p><Link href="/subscription" className="mt-5 inline-flex rounded-full bg-marica-amber-dark px-5 py-3 text-sm font-bold text-white">Lihat Paket Subscription</Link></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{activities.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">{item.thumbnailUrl ? <div className="relative h-40"><Image src={item.thumbnailUrl} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" /></div> : <div className="flex h-40 items-center justify-center bg-marica-cream"><PlayCircle className="h-12 w-12 text-marica-amber-dark" /></div>}<div className="p-5"><p className="text-xs font-bold uppercase text-marica-amber-dark">{item.contentType}</p><h2 className="mt-2 font-display text-xl font-bold">{item.title}</h2><p className="mt-2 text-sm text-marica-ink-soft">{item.description}</p>{item.videoUrl && <a href={item.videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-marica-amber-dark">Tonton aktivitas →</a>}</div></article>)}</div>}</div></main>;
}
