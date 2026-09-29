"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import FeedbackPopup from "@/app/components/FeedbackPopup";
import BookingExtras, { BookingParticipant, FnbSelection } from "@/app/components/BookingExtras";
import { CalendarDays, Clock3, Loader2, Ticket } from "lucide-react";

type PackageItem = { id: string; name: string; durationMinutes: number; price: number; maxParticipants: number; slotCapacity: number | null };
type Slot = { value: string; label: string; remaining: number; available: boolean };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function PlaypassPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packageId, setPackageId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [participants, setParticipants] = useState<BookingParticipant[]>([]);
  const [fnbItems, setFnbItems] = useState<FnbSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }), []);
  const selectedPackage = packages.find((item) => item.id === packageId);

  useEffect(() => { fetch("/api/playpass", { cache: "no-store" }).then((response) => response.json()).then((data) => { setPackages(Array.isArray(data) ? data : []); if (Array.isArray(data) && data[0]) setPackageId(data[0].id); }).catch(() => setError("Paket Playpass gagal dimuat")).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!packageId || !date) return;
    fetch(`/api/playpass?packageId=${encodeURIComponent(packageId)}&date=${encodeURIComponent(date)}`, { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; }).then((data) => setSlots(Array.isArray(data.slots) ? data.slots : [])).catch((loadError) => { setSlots([]); setError(loadError instanceof Error ? loadError.message : "Slot gagal dimuat"); });
  }, [packageId, date]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError(null);
    try {
      const response = await fetch("/api/playpass-bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId, date, startTime, quantity, customerPhone: phone, participants, fnbItems }) });
      const result = await response.json();
      if (response.status === 401) { window.location.href = `/login?callbackUrl=${encodeURIComponent("/playpass")}`; return; }
      if (!response.ok) throw new Error(result.error ?? "Booking Playpass gagal dibuat");
      if (result.redirectUrl) window.location.href = result.redirectUrl; else window.location.href = `/playpass/tiket/${result.booking.bookingNumber}`;
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Booking Playpass gagal dibuat"); setSubmitting(false); }
  };
  return <div className="flex min-h-screen flex-col bg-marica-sky-light/20 font-body"><Navbar /><main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:px-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-marica-amber-dark">Marica Experience Store</p><h1 className="mt-2 font-display text-4xl font-bold text-marica-ink">Booking Playpass</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-marica-ink-soft">Pilih paket dan slot kunjungan area bermain. E-tiket QR akan dikirim setelah pembayaran berhasil.</p></div><Link href="/profil/playpass" className="text-sm font-semibold text-marica-amber-dark">Booking saya →</Link></div><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]"><section className="space-y-4">{loading ? <div className="rounded-2xl bg-white p-8 text-sm text-marica-ink-soft">Memuat paket...</div> : packages.map((item) => <button type="button" key={item.id} onClick={() => { setPackageId(item.id); setSlots([]); setStartTime(""); }} className={`w-full rounded-2xl border p-5 text-left transition ${packageId === item.id ? "border-marica-amber-dark bg-marica-amber/10" : "border-black/5 bg-white"}`}><div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-xl font-bold text-marica-ink">{item.name}</h2><p className="mt-2 text-sm text-marica-ink-soft">{item.durationMinutes} menit · maksimal {item.maxParticipants} orang</p></div><strong className="text-sm text-marica-amber-dark">{money(item.price)}</strong></div></button>)}</section><form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-marica-ink"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Tanggal kunjungan</span><input required type="date" min={today} value={date} onChange={(event) => { setDate(event.target.value); setSlots([]); setStartTime(""); }} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-marica-amber-dark" /></label><label className="text-sm font-semibold text-marica-ink"><span className="flex items-center gap-2"><Ticket className="h-4 w-4" />Jumlah tiket</span><input required type="number" min={1} max={selectedPackage?.maxParticipants ?? 1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-marica-amber-dark" /></label></div><label className="mt-5 block text-sm font-semibold text-marica-ink"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Slot waktu</span><select required disabled={!date || slots.length === 0} value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-marica-amber-dark"><option value="">Pilih slot</option>{slots.map((slot) => <option key={slot.value} value={slot.value} disabled={!slot.available}>{slot.label} · {slot.available ? `${slot.remaining} tersisa` : "Penuh"}</option>)}</select></label><label className="mt-5 block text-sm font-semibold text-marica-ink">Nomor WhatsApp (opsional)<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-marica-amber-dark" /></label><BookingExtras maxParticipants={selectedPackage?.maxParticipants ?? 1} participants={participants} setParticipants={setParticipants} fnbItems={fnbItems} setFnbItems={setFnbItems} /><div className="mt-6 rounded-xl bg-marica-sky-light/40 p-4 text-sm text-marica-ink-soft">Akun wajib login. Pembayaran diproses melalui Midtrans dan tiket dapat dibuka dari halaman Booking Saya.</div><button disabled={submitting || !selectedPackage || !startTime} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-3 font-semibold text-white disabled:opacity-50">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}Lanjut ke pembayaran</button></form></div></main><Footer /><FeedbackPopup message={error} onClose={() => setError(null)} /></div>;
}
