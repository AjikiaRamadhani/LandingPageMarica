"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type Booking = { bookingNumber: string; status: string; quantity: number; visitDate: string; startTime: string; endTime: string; package: { name: string }; tickets: { ticketNumber: string; qrToken: string }[] };
export default function PlaypassTicketPage() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>(); const [booking, setBooking] = useState<Booking | null>(null); const [qr, setQr] = useState(""); const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/playpass-bookings/${encodeURIComponent(bookingNumber)}`, { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setBooking(data); if (data.tickets?.[0]?.qrToken) setQr(await QRCode.toDataURL(data.tickets[0].qrToken)); }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "E-tiket gagal dimuat")); }, [bookingNumber]);
  return <div className="flex min-h-screen flex-col bg-marica-sky-light/20 font-body"><Navbar /><main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10"><Link href="/profil/playpass" className="text-sm font-semibold text-marica-amber-dark">← Kembali ke Booking Saya</Link>{error ? <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : booking && <article className="mt-6 rounded-3xl bg-white p-6 text-center shadow-sm sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-marica-amber-dark">E-Tiket Playpass</p><h1 className="mt-3 font-display text-3xl font-bold text-marica-ink">{booking.package.name}</h1><p className="mt-3 text-sm text-marica-ink-soft">{new Date(booking.visitDate).toLocaleDateString("id-ID", { dateStyle: "full" })}<br />{new Date(booking.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - {new Date(booking.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</p><p className="mt-5 text-sm font-semibold text-marica-ink">{booking.bookingNumber} · {booking.quantity} tiket</p>{booking.status === "PAID" && qr ? <img src={qr} alt="QR e-tiket Playpass" className="mx-auto mt-6 h-64 w-64" /> : <p className="mt-8 rounded-xl bg-marica-sky-light/40 p-4 text-sm text-marica-ink-soft">Tiket QR akan muncul setelah pembayaran berhasil.</p>}<p className="mt-5 text-xs text-marica-ink-soft">Tunjukkan QR ini kepada kasir saat check-in.</p></article>}</main><Footer /></div>;
}
