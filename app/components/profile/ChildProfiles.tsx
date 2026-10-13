"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";

type Child = {
  id: string;
  name: string;
  birthDate: string | null;
  gender: string | null;
  learningLevel: string | null;
  learningStyle: string | null;
  interests: string[];
  favoriteThemes: string[];
};

type FormState = {
  name: string;
  birthDate: string;
  gender: string;
  learningLevel: string;
  learningStyle: string;
  interests: string;
  favoriteThemes: string;
};

const emptyForm: FormState = { name: "", birthDate: "", gender: "", learningLevel: "", learningStyle: "", interests: "", favoriteThemes: "" };
const genderOptions = [["MALE", "Laki-laki"], ["FEMALE", "Perempuan"], ["NOT_SPECIFIED", "Tidak ingin menyebutkan"]] as const;
const learningLevelOptions = [["EARLY_CHILDHOOD", "Usia dini (3–5 tahun)"], ["KINDERGARTEN", "TK (5–6 tahun)"], ["ELEMENTARY_EARLY", "SD awal (6–8 tahun)"], ["ELEMENTARY", "SD (8 tahun ke atas)"]] as const;
const learningStyleOptions = [["VISUAL", "Visual — lebih mudah memahami lewat gambar dan warna"], ["AUDITORY", "Auditori — lebih mudah memahami lewat suara dan cerita"], ["KINESTHETIC", "Kinestetik — lebih mudah memahami lewat praktik dan gerak"], ["MIXED", "Campuran — nyaman dengan beberapa cara belajar"]] as const;

function StyledSelect({ label, value, placeholder, options, onChange }: { label: string; value: string; placeholder: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(([optionValue]) => optionValue === value)?.[1];

  return (
    <label className="block">
      <span className="text-xs font-semibold">{label}</span>
      <span className="relative mt-1 block min-w-0">
        <button type="button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className={`flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border bg-[#fffdfa] px-3 py-2 text-left text-xs outline-none transition sm:px-3.5 sm:py-2.5 sm:text-sm ${isOpen ? "border-marica-amber-dark ring-4 ring-marica-amber/15" : "border-marica-ink/15 hover:border-marica-amber/60"} ${value ? "text-marica-ink" : "text-marica-ink-soft"}`}>
          <span className="min-w-0 whitespace-normal break-words">{selectedLabel ?? placeholder}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-marica-amber-dark transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && <div role="listbox" className="absolute left-0 right-0 z-20 mt-2 max-w-full overflow-hidden rounded-xl border border-marica-amber/25 bg-white p-1.5 shadow-[0_14px_30px_rgba(120,60,10,0.16)]">
          <button type="button" role="option" aria-selected={!value} onClick={() => { onChange(""); setIsOpen(false); }} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${!value ? "bg-marica-cream font-semibold text-marica-amber-dark" : "text-marica-ink-soft hover:bg-marica-cream/70"}`}>{placeholder}</button>
          {options.map(([optionValue, optionLabel]) => <button type="button" role="option" aria-selected={value === optionValue} key={optionValue} onClick={() => { onChange(optionValue); setIsOpen(false); }} className={`flex w-full min-w-0 items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${value === optionValue ? "bg-marica-amber/15 font-semibold text-marica-amber-dark" : "text-marica-ink hover:bg-marica-cream/70"}`}><span className="min-w-0 whitespace-normal break-words">{optionLabel}</span>{value === optionValue && <Check className="mt-0.5 h-4 w-4 shrink-0" />}</button>)}
        </div>}
      </span>
    </label>
  );
}

export default function ChildProfiles() {
  const [items, setItems] = useState<Child[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/children", { cache: "no-store" });
    const data = await response.json().catch(() => []);
    if (!response.ok) throw new Error(data.error ?? "Gagal memuat profil anak");
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch((error) => setMessage(error instanceof Error ? error.message : "Gagal memuat profil anak")).finally(() => setLoading(false));
  }, []);

  function edit(child: Child) {
    setEditingId(child.id);
    setForm({ name: child.name, birthDate: child.birthDate?.slice(0, 10) ?? "", gender: child.gender ?? "", learningLevel: child.learningLevel ?? "", learningStyle: child.learningStyle ?? "", interests: child.interests.join(", "), favoriteThemes: child.favoriteThemes.join(", ") });
    setOpen(true);
    setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = { name: form.name, birthDate: form.birthDate || null, gender: form.gender || null, learningLevel: form.learningLevel || null, learningStyle: form.learningStyle || null, interests: form.interests.split(",").map((value) => value.trim()).filter(Boolean), favoriteThemes: form.favoriteThemes.split(",").map((value) => value.trim()).filter(Boolean) };
    try {
      const response = await fetch(editingId ? `/api/children/${editingId}` : "/api/children", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Profil anak gagal disimpan");
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profil anak gagal disimpan");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus profil anak ini?")) return;
    const response = await fetch(`/api/children/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "Profil anak gagal dihapus");
      return;
    }
    await load();
  }

  return (
    <section className="rounded-xl bg-[#fffdfa] p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-marica-ink/10 pb-4">
        <div><h2 className="font-display text-xl text-marica-ink">Profil anak</h2><p className="mt-1 text-xs text-marica-ink-soft">Gunakan profil anak untuk personalisasi subscription Edu-Kit.</p></div>
        <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setOpen(true); setMessage(""); }} className="inline-flex items-center gap-1.5 rounded-full bg-marica-amber-dark px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> Tambah anak</button>
      </div>
      {message && <p className="mt-4 rounded-lg bg-marica-rose-deep/10 px-3 py-2 text-xs text-marica-rose-deep">{message}</p>}
      {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? <div className="py-8 text-center text-sm text-marica-ink-soft"><UsersRound className="mx-auto h-8 w-8 text-marica-amber-dark" /><p className="mt-2">Belum ada profil anak.</p></div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map((child) => <div key={child.id} className="rounded-xl border border-marica-ink/10 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-marica-ink">{child.name}</h3><p className="mt-1 text-xs text-marica-ink-soft">{child.learningLevel ?? "Level belajar belum diatur"}{child.learningStyle ? ` · ${child.learningStyle}` : ""}</p></div><div className="flex gap-1"><button type="button" onClick={() => edit(child)} aria-label={`Edit ${child.name}`} className="rounded-md p-1.5 text-marica-amber-dark hover:bg-marica-cream"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => void remove(child.id)} aria-label={`Hapus ${child.name}`} className="rounded-md p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></div></div><p className="mt-3 text-xs text-marica-ink-soft">{child.interests.length ? `Minat: ${child.interests.join(", ")}` : "Minat belum diatur"}</p></div>)}</div>}
      {open && <div className="fixed inset-0 z-50 flex min-w-0 items-center justify-center overflow-x-hidden bg-black/30 p-2 sm:p-4"><form onSubmit={submit} className="max-h-[92dvh] min-w-0 w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="min-w-0 break-words font-display text-lg font-bold sm:text-xl">{editingId ? "Edit profil anak" : "Tambah profil anak"}</h3><button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="shrink-0"><X className="h-5 w-5" /></button></div><div className="mt-4 grid min-w-0 gap-3 sm:mt-5 sm:grid-cols-2">
        <label className="min-w-0 sm:col-span-2"><span className="text-xs font-semibold">Nama anak</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 h-10 w-full min-w-0 rounded-lg border border-marica-ink/15 px-3 py-2 text-sm outline-none focus:border-marica-amber-dark" /></label>
        <label className="min-w-0"><span className="text-xs font-semibold">Tanggal lahir</span><input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} className="mt-1 h-10 w-full min-w-0 appearance-none rounded-lg border border-marica-ink/15 px-3 py-2 text-xs outline-none focus:border-marica-amber-dark sm:text-sm" /></label>
        <StyledSelect label="Jenis kelamin" value={form.gender} placeholder="Pilih jenis kelamin" options={genderOptions} onChange={(value) => setForm({ ...form, gender: value })} />
        <StyledSelect label="Level belajar" value={form.learningLevel} placeholder="Pilih level belajar" options={learningLevelOptions} onChange={(value) => setForm({ ...form, learningLevel: value })} />
        <StyledSelect label="Gaya belajar" value={form.learningStyle} placeholder="Pilih gaya belajar" options={learningStyleOptions} onChange={(value) => setForm({ ...form, learningStyle: value })} />
        <div className="min-w-0 rounded-lg bg-marica-cream/60 p-3 text-[10px] leading-4 text-marica-ink-soft sm:col-span-2 sm:text-[11px] sm:leading-5"><p><strong className="text-marica-ink">Level belajar</strong> adalah tahap atau rentang kemampuan anak saat ini, sehingga rekomendasi aktivitas bisa disesuaikan.</p><p className="mt-1"><strong className="text-marica-ink">Gaya belajar</strong> adalah cara yang biasanya paling nyaman bagi anak untuk memahami sesuatu, misalnya melalui gambar, suara, atau praktik langsung.</p></div>
        <label className="min-w-0 sm:col-span-2"><span className="text-xs font-semibold">Minat (pisahkan koma)</span><input value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Contoh: sains, menggambar, hewan" className="mt-1 h-10 w-full min-w-0 rounded-lg border border-marica-ink/15 px-3 py-2 text-sm outline-none focus:border-marica-amber-dark" /></label>
        <label className="min-w-0 sm:col-span-2"><span className="text-xs font-semibold">Tema favorit (pisahkan koma)</span><input value={form.favoriteThemes} onChange={(event) => setForm({ ...form, favoriteThemes: event.target.value })} placeholder="Contoh: luar angkasa, laut" className="mt-1 h-10 w-full min-w-0 rounded-lg border border-marica-ink/15 px-3 py-2 text-sm outline-none focus:border-marica-amber-dark" /></label>
      </div><button type="submit" disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-full bg-marica-amber-dark px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:mt-5 sm:px-5 sm:text-sm">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan Profil</button></form></div>}
    </section>
  );
}
