"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type Video = { id: string; title: string; slug: string; excerpt: string | null; coverImageUrl: string | null; videoUrl: string; videoProvider: string | null; videoDurationSeconds: number | null; category: { name: string } | null };

export default function VideoShowcasePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/articles/videos?limit=24", { cache: "no-store" }).then(async (response) => {
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data.error ?? "Video gagal dimuat");
      setVideos(Array.isArray(data) ? data : []);
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Video gagal dimuat")).finally(() => setLoading(false));
  }, []);

  return <div className="min-h-screen bg-[#fff9f3] text-marica-ink"><Navbar /><main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-marica-amber-dark"><ArrowLeft className="h-4 w-4" /> Beranda</Link><h1 className="mt-6 font-display text-4xl font-bold">Video Showcase</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-marica-ink-soft">Cerita, aktivitas, dan inspirasi belajar Marica dalam format video.</p>{loading ? <p className="mt-10 text-sm text-marica-ink-soft">Memuat video...</p> : error ? <p className="mt-10 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : videos.length === 0 ? <p className="mt-10 rounded-xl bg-white p-8 text-center text-sm text-marica-ink-soft">Belum ada video yang dipublikasikan.</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{videos.map((video) => <article key={video.id} className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="relative flex aspect-video items-center justify-center bg-marica-cream">{video.coverImageUrl ? <Image src={video.coverImageUrl} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" /> : <PlayCircle className="h-14 w-14 text-marica-amber-dark" />}<a href={video.videoUrl} target="_blank" rel="noreferrer" aria-label={`Putar ${video.title}`} className="absolute rounded-full bg-white/90 p-3 text-marica-amber-dark shadow"><PlayCircle className="h-6 w-6" /></a></div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-marica-amber-dark">{video.category?.name ?? "Video Marica"}{video.videoDurationSeconds ? ` · ${Math.ceil(video.videoDurationSeconds / 60)} menit` : ""}</p><h2 className="mt-2 font-display text-xl font-bold">{video.title}</h2>{video.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-marica-ink-soft">{video.excerpt}</p>}<a href={video.videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-marica-amber-dark">Tonton video →</a></div></article>)}</div>}</main><Footer /></div>;
}
