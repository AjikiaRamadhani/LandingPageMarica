"use client";

import { useEffect, useState } from "react";

type Activity = { id: string; slug: string; title: string; description: string; contentType: string; isPublished: boolean };
export default function AdminSubscriptionActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]); const [message, setMessage] = useState("Memuat...");
  useEffect(() => { fetch("/api/admin/subscription-activities", { cache: "no-store" }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "Gagal memuat activity"); setItems(d); setMessage(""); }).catch((e) => setMessage(e.message)); }, []);
  return <section><h1 className="font-display text-3xl font-bold">Activity Subscription</h1><p className="mt-2 text-sm text-marica-ink-soft">Kelola konten eksklusif pelanggan.</p>{message ? <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{message}</p> : <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-marica-cream/60 text-xs uppercase"><tr><th className="p-4">Judul</th><th className="p-4">Tipe</th><th className="p-4">Slug</th><th className="p-4">Status</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-black/5"><td className="p-4 font-bold">{item.title}<br /><span className="text-xs font-normal text-marica-ink-soft">{item.description}</span></td><td className="p-4">{item.contentType}</td><td className="p-4">{item.slug}</td><td className="p-4">{item.isPublished ? "Published" : "Draft"}</td></tr>)}</tbody></table></div>}</section>;
}
