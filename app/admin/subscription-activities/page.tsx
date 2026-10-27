"use client";

import { useEffect, useState } from "react";

type Activity = { id: string; slug: string; title: string; description: string; contentType: string; videoUrl: string | null; guideUrl: string | null; isPublished: boolean };
type FormState = Omit<Activity, "id" | "isPublished"> & { isPublished: boolean };
const emptyForm: FormState = { slug: "", title: "", description: "", contentType: "VIDEO", videoUrl: "", guideUrl: "", isPublished: false };

export default function AdminSubscriptionActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [message, setMessage] = useState("Memuat...");
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/subscription-activities", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Gagal memuat activity");
    setItems(data); setMessage("");
  }
  useEffect(() => { void load().catch((error) => setMessage(error instanceof Error ? error.message : "Gagal memuat activity")); }, []);
  function startEdit(item: Activity) { setEditing(item); setForm({ slug: item.slug, title: item.title, description: item.description, contentType: item.contentType, videoUrl: item.videoUrl ?? "", guideUrl: item.guideUrl ?? "", isPublished: item.isPublished }); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch(editing ? `/api/admin/subscription-activities/${editing.id}` : "/api/admin/subscription-activities", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan activity");
      setEditing(null); setForm(emptyForm); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan activity"); } finally { setSaving(false); }
  }
  async function remove(id: string) { if (!window.confirm("Hapus activity ini?")) return; const response = await fetch(`/api/admin/subscription-activities/${id}`, { method: "DELETE" }); if (!response.ok) { const data = await response.json().catch(() => ({})); setMessage(data.error ?? "Gagal menghapus activity"); return; } await load(); }
  return <section className="mx-auto max-w-6xl pb-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-3xl font-bold text-marica-ink">Activity Subscription</h1><p className="mt-2 text-sm text-marica-ink-soft">Kelola konten eksklusif pelanggan subscription aktif.</p></div><button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-full bg-marica-amber-dark px-4 py-2.5 text-sm font-semibold text-white">Activity baru</button></div>{message && <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{message}</p>}<form onSubmit={save} className="mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2"><input required placeholder="Judul activity" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><input required placeholder="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><input required placeholder="Tipe konten, contoh VIDEO" value={form.contentType} onChange={(event) => setForm({ ...form, contentType: event.target.value })} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><input placeholder="URL video (opsional)" value={form.videoUrl ?? ""} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><input placeholder="URL panduan (opsional)" value={form.guideUrl ?? ""} onChange={(event) => setForm({ ...form, guideUrl: event.target.value })} className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" /><label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Publish sekarang</label><textarea required placeholder="Deskripsi activity" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 rounded-xl border border-black/10 px-3 py-2.5 text-sm md:col-span-2" /><div className="flex gap-2 md:col-span-2"><button disabled={saving} className="rounded-xl bg-marica-amber-dark px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{editing ? "Simpan perubahan" : "Simpan activity"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl border border-black/10 px-4 py-2.5 text-sm">Batal edit</button>}</div></form><div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-marica-cream/60 text-xs uppercase"><tr><th className="p-4">Judul</th><th className="p-4">Tipe</th><th className="p-4">Slug</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-black/5"><td className="p-4 font-bold">{item.title}<br /><span className="text-xs font-normal text-marica-ink-soft">{item.description}</span></td><td className="p-4">{item.contentType}</td><td className="p-4">{item.slug}</td><td className="p-4"><span className="rounded-full bg-marica-cream px-3 py-1 text-xs font-bold">{item.isPublished ? "Published" : "Draft"}</span></td><td className="p-4 text-right"><button type="button" onClick={() => startEdit(item)} className="mr-2 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold">Edit</button><button type="button" onClick={() => void remove(item.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Hapus</button></td></tr>)}</tbody></table></div></section>;
}
