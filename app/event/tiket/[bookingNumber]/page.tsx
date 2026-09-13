"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import FeedbackPopup from "@/app/components/FeedbackPopup";

type TicketItem = {
  ticketCode: string;
  qrToken: string;
  participantName: string;
  status: string;
  checkedInAt: string | null;
};
type Booking = {
  bookingNumber: string;
  status: string;
  event: {
    title: string;
    eventDate: string;
    locationName: string;
    locationAddress?: string | null;
  };
  tickets: TicketItem[];
};

export default function TicketPage() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/event-bookings/${encodeURIComponent(bookingNumber)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 401)
          throw new Error("Silakan login untuk melihat tiket.");
        if (!response.ok)
          throw new Error(data.error ?? "Booking tidak ditemukan");
        setBooking(data);
      })
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Booking tidak ditemukan",
        ),
      );
  }, [bookingNumber]);
  return (
    <div className="flex min-h-screen flex-col bg-marica-sky-light/20 font-body">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link
          href="/event-saya"
          className="inline-flex items-center gap-2 text-sm font-semibold text-marica-ink-soft"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Event Saya
        </Link>
        {booking && (
          <>
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-marica-amber-dark">
                {booking.bookingNumber} · {booking.status}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-marica-ink">
                {booking.event.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-marica-ink-soft">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(booking.event.eventDate).toLocaleDateString(
                    "id-ID",
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {booking.event.locationName}
                  {booking.event.locationAddress
                    ? `, ${booking.event.locationAddress}`
                    : ""}
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {booking.tickets.map((ticket) => (
                <article
                  key={ticket.ticketCode}
                  className="rounded-2xl bg-white p-5 text-center shadow-sm"
                >
                  <div className="mx-auto flex aspect-square max-w-[220px] items-center justify-center rounded-xl border-4 border-marica-ink bg-white p-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket.qrToken)}`}
                      alt={`QR tiket ${ticket.ticketCode}`}
                      className="h-full w-full"
                    />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold text-marica-ink">
                    {ticket.participantName}
                  </h2>
                  <p className="mt-1 text-xs text-marica-ink-soft">
                    {ticket.ticketCode}
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${ticket.status === "CHECKED_IN" ? "bg-marica-green/15 text-marica-green" : "bg-marica-amber/20 text-marica-amber-dark"}`}
                  >
                    {ticket.status === "CHECKED_IN"
                      ? "Sudah check-in"
                      : "Belum check-in"}
                  </span>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
      <FeedbackPopup message={error} onClose={() => setError(null)} />
    </div>
  );
}
