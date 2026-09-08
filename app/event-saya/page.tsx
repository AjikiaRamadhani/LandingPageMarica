"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { CalendarDays, Ticket } from "lucide-react";

type Booking = {
  bookingNumber: string;
  status: string;
  quantity: number;
  totalPrice: number;
  event: { title: string; eventDate: string; locationName: string };
  tickets: { ticketCode: string }[];
};

const statusLabel: Record<string, string> = {
  PAID: "Berhasil",
  PENDING_PAYMENT: "Menunggu pembayaran",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export default function MyEventsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/event-bookings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 401)
          throw new Error("Silakan login untuk melihat booking event.");
        if (!response.ok) throw new Error(data.error ?? "Gagal memuat booking");
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat booking",
        ),
      );
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-marica-sky-light/20 font-body">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-marica-ink">
          Event Saya
        </h1>
        <p className="mt-2 text-sm text-marica-ink-soft">
          Lihat status booking dan tiket event kamu.
        </p>
        {error && (
          <p className="mt-6 rounded-xl bg-marica-rose-deep/10 px-4 py-3 text-sm text-marica-rose-deep">
            {error}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-4">
          {bookings.map((booking) => (
            <article
              key={booking.bookingNumber}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-marica-amber-dark">
                    {booking.bookingNumber}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-marica-ink">
                    {booking.event.title}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-marica-ink-soft">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(booking.event.eventDate).toLocaleDateString(
                      "id-ID",
                    )}{" "}
                    · {booking.event.locationName}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-marica-amber/20 px-3 py-1 text-xs font-semibold text-marica-amber-dark">
                  {statusLabel[booking.status] ?? booking.status}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-sm text-marica-ink-soft">
                <span className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  {booking.tickets?.length ?? booking.quantity} tiket
                </span>
                <Link
                  href={`/event/tiket/${booking.bookingNumber}`}
                  className="rounded-full bg-marica-amber-dark px-4 py-2 font-semibold text-white"
                >
                  Buka detail booking
                </Link>
              </div>
            </article>
          ))}
          {!error && bookings.length === 0 && (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-marica-ink-soft">
              Belum ada booking event.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
