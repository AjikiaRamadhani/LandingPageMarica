"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Plus,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

type EventRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  benefits: string[];
  price: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress?: string | null;
  quota: number;
  isActive: boolean;
  paidQuantity?: number;
};
type Booking = {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  event: { title: string };
  tickets: {
    ticketCode: string;
    participantName: string;
    status: string;
    checkedInAt?: string | null;
  }[];
};
type FormState = {
  title: string;
  category: string;
  description: string;
  benefits: string;
  price: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress: string;
  quota: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  title: "",
  category: "Workshop",
  description: "",
  benefits: "",
  price: 0,
  eventDate: "",
  startTime: "09:00",
  endTime: "12:00",
  locationName: "",
  locationAddress: "",
  quota: 20,
  isActive: true,
};
const inputClass =
  "mt-1 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-marica-ink outline-none transition placeholder:text-marica-ink-soft/60 focus:border-marica-amber-dark focus:ring-4 focus:ring-marica-amber/15";

function formatCheckInDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminEventPage() {
  const [tab, setTab] = useState<"events" | "participants" | "scanner">(
    "events",
  );
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const checkInRef = useRef<((scannedToken: string) => Promise<void>) | null>(
    null,
  );

  async function loadData() {
    setIsLoading(true);
    try {
      const [eventsResponse, bookingsResponse] = await Promise.all([
        fetch("/api/admin/events", { cache: "no-store" }),
        fetch("/api/admin/event-bookings?limit=50", { cache: "no-store" }),
      ]);
      const eventsData = await eventsResponse.json();
      const bookingsData = await bookingsResponse.json();
      if (!eventsResponse.ok || !bookingsResponse.ok)
        throw new Error(
          eventsData.error ?? bookingsData.error ?? "Gagal memuat data event",
        );
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setBookings(
        Array.isArray(bookingsData.bookings) ? bookingsData.bookings : [],
      );
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error ? error.message : "Gagal memuat data event",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, []);

  useEffect(() => {
    if (tab !== "scanner") return;

    const scanner = new Html5Qrcode("event-ticket-qr-reader");
    scannerRef.current = scanner;
    queueMicrotask(() => setCameraError(null));
    void scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setIsCameraActive(false);
          void scanner.stop().catch(() => undefined);
          void checkInRef.current?.(decodedText);
        },
        () => undefined,
      )
      .then(() => setIsCameraActive(true))
      .catch(() => {
        setCameraError(
          "Kamera tidak dapat diakses. Izinkan akses kamera untuk melakukan check-in.",
        );
      });

    return () => {
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => undefined);
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, [tab]);

  async function saveEvent(event: FormEvent) {
    event.preventDefault();
    setNotice(null);
    setIsSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      quota: Number(form.quota),
      benefits: form.benefits
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    try {
      const response = await fetch(
        editingId ? `/api/admin/events/${editingId}` : "/api/admin/events",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(
          data.error ??
            (response.status === 404
              ? "API event belum tersedia di server."
              : "Gagal menyimpan event"),
        );
      setNotice({
        type: "success",
        text: editingId
          ? "Event berhasil diperbarui."
          : "Event berhasil ditambahkan.",
      });
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal menyimpan event",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function editEvent(event: EventRecord) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      category: event.category,
      description: event.description,
      benefits: event.benefits.join("\n"),
      price: event.price,
      eventDate: event.eventDate.slice(0, 10),
      startTime: event.startTime,
      endTime: event.endTime,
      locationName: event.locationName,
      locationAddress: event.locationAddress ?? "",
      quota: event.quota,
      isActive: event.isActive,
    });
    setTab("events");
  }

  async function resendTicket(bookingNumber: string) {
    const response = await fetch(
      `/api/admin/event-bookings/${bookingNumber}/resend-email`,
      { method: "POST" },
    );
    const data = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      text: data.message ?? data.error ?? "Gagal mengirim ulang tiket",
    });
  }

  async function checkIn(scannedToken: string) {
    const response = await fetch("/api/event-tickets/scan/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: scannedToken }),
    });
    const data = await response.json();
    setNotice({
      type: response.ok ? "success" : "error",
      text: response.ok
        ? `${data.message}: ${data.ticket?.participantName ?? ""}`
        : (data.error ?? "Check-in gagal"),
    });
    if (response.ok) {
      await loadData();
    }
  }

  useEffect(() => {
    checkInRef.current = checkIn;
  });

  const tabs = [
    { id: "events", label: "Event", icon: Plus },
    { id: "participants", label: "Peserta", icon: ClipboardList },
    { id: "scanner", label: "Scanner QR", icon: QrCode },
  ] as const;
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-marica-amber-dark">
            Manajemen acara
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-marica-ink">
            Event & Workshop
          </h1>
          <p className="mt-1 text-sm text-marica-ink-soft">
            Kelola jadwal, peserta, tiket, dan check-in.
          </p>
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void loadData()}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-marica-ink shadow-sm transition hover:bg-marica-sky-light/40 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> Muat ulang
        </button>
      </header>
      <nav className="mt-8 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === id ? "bg-marica-amber-dark text-white shadow-sm" : "text-marica-ink-soft hover:bg-marica-sky-light/50"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
      {notice && (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${notice.type === "error" ? "bg-red-50 text-red-700" : "bg-marica-green/10 text-marica-green"}`}
        >
          {notice.text}
        </p>
      )}

      {tab === "events" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
          <form
            onSubmit={saveEvent}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between border-b border-black/5 pb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-marica-ink">
                  {editingId ? "Edit event" : "Tambah event"}
                </h2>
                <p className="mt-1 text-xs text-marica-ink-soft">
                  Lengkapi informasi acara untuk ditampilkan di kalender.
                </p>
              </div>
              <Plus className="h-5 w-5 text-marica-amber-dark" />
            </div>
            <div className="mt-2 grid gap-x-3 sm:grid-cols-2">
              <Field
                label="Nama event"
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
                required
                className="sm:col-span-2"
              />
              <Field
                label="Kategori"
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value })}
                required
              />
              <Field
                label="Tanggal event"
                type="date"
                value={form.eventDate}
                onChange={(value) => setForm({ ...form, eventDate: value })}
                required
              />
              <Field
                label="Mulai"
                type="time"
                value={form.startTime}
                onChange={(value) => setForm({ ...form, startTime: value })}
                required
              />
              <Field
                label="Selesai"
                type="time"
                value={form.endTime}
                onChange={(value) => setForm({ ...form, endTime: value })}
                required
              />
              <Field
                label="Lokasi"
                value={form.locationName}
                onChange={(value) => setForm({ ...form, locationName: value })}
                required
                className="sm:col-span-2"
              />
              <Field
                label="Alamat lengkap (opsional)"
                value={form.locationAddress}
                onChange={(value) =>
                  setForm({ ...form, locationAddress: value })
                }
                className="sm:col-span-2"
              />
              <TextArea
                label="Deskripsi"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                required
                className="sm:col-span-2"
              />
              <TextArea
                label="Benefit (satu per baris)"
                value={form.benefits}
                onChange={(value) => setForm({ ...form, benefits: value })}
                className="sm:col-span-2"
              />
              <Field
                label="Harga per tiket (Rp)"
                type="number"
                min={0}
                value={String(form.price)}
                onChange={(value) => setForm({ ...form, price: Number(value) })}
                required
              />
              <Field
                label="Kuota peserta"
                type="number"
                min={1}
                value={String(form.quota)}
                onChange={(value) => setForm({ ...form, quota: Number(value) })}
                required
              />
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-marica-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm({ ...form, isActive: event.target.checked })
                }
              />{" "}
              Event aktif
            </label>
            <div className="mt-6 flex gap-2 border-t border-black/5 pt-5">
              <button
                disabled={isSaving}
                className="rounded-full bg-marica-amber-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan perubahan"
                    : "Tambah event"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-marica-ink">
                Daftar event
              </h2>
              <p className="mt-1 text-xs text-marica-ink-soft">
                {events.length} event terdaftar
              </p>
            </div>
            {isLoading && (
              <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
            )}
            {!isLoading && events.length === 0 && (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-marica-ink-soft">
                Belum ada event. Tambahkan event pertama dari form.
              </div>
            )}
            {!isLoading &&
              events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-marica-amber/20 px-2.5 py-1 text-[11px] font-semibold text-marica-amber-dark">
                        {event.category}
                      </span>
                      <h3 className="mt-3 font-display text-lg font-semibold text-marica-ink">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-sm text-marica-ink-soft">
                        {new Date(event.eventDate).toLocaleDateString("id-ID")}{" "}
                        · {event.locationName}
                      </p>
                    </div>
                    <span className="h-fit text-xs font-semibold text-marica-amber-dark">
                      {event.paidQuantity ?? 0}/{event.quota}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => editEvent(event)}
                    className="mt-4 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-marica-sky-light/40"
                  >
                    Edit event
                  </button>
                </article>
              ))}
          </section>
        </div>
      )}
      {tab === "participants" && (
        <section className="mt-6 flex flex-col gap-3">
          {bookings.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-marica-ink-soft">
              Belum ada peserta.
            </div>
          )}
          {bookings.map((booking) => (
            <article
              key={booking.bookingNumber}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-marica-amber-dark">
                    {booking.bookingNumber}
                  </p>
                  <h2 className="font-display text-lg font-semibold">
                    {booking.customerName}
                  </h2>
                  <p className="text-sm text-marica-ink-soft">
                    {booking.customerEmail} · {booking.event.title}
                  </p>
                </div>
                <span className="text-sm font-semibold">{booking.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-marica-ink-soft">
                {booking.tickets.map((ticket) => (
                  <span
                    key={ticket.ticketCode}
                    className={`rounded-full px-3 py-1 font-semibold ${ticket.status === "CHECKED_IN" ? "bg-marica-green/15 text-marica-green" : "bg-marica-rose-deep/10 text-marica-rose-deep"}`}
                    title={
                      ticket.status === "CHECKED_IN" && ticket.checkedInAt
                        ? `Check-in: ${formatCheckInDate(ticket.checkedInAt)}`
                        : undefined
                    }
                  >
                    {ticket.participantName} ·{" "}
                    {ticket.status === "CHECKED_IN"
                      ? "Sudah check-in"
                      : "Belum check-in"}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void resendTicket(booking.bookingNumber)}
                disabled={booking.status !== "PAID"}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Kirim ulang tiket
              </button>
            </article>
          ))}
        </section>
      )}
      {tab === "scanner" && (
        <section className="mt-6 max-w-2xl rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-marica-amber/20">
              <QrCode className="h-6 w-6 text-marica-amber-dark" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                Scan QR tiket
              </h2>
              <p className="mt-1 text-sm text-marica-ink-soft">
                Arahkan kamera ke QR pada e-ticket peserta.
              </p>
            </div>
          </div>
          <div
            id="event-ticket-qr-reader"
            className="mt-5 min-h-64 overflow-hidden rounded-2xl border border-black/10 bg-marica-ink/5"
          />
          {cameraError && (
            <p className="mt-3 rounded-xl bg-marica-rose-deep/10 px-4 py-3 text-sm text-marica-rose-deep">
              {cameraError}
            </p>
          )}
          {isCameraActive && (
            <p className="mt-3 text-center text-xs font-semibold text-marica-green">
              Kamera aktif, siap memindai
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  placeholder,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`mt-3 block text-sm font-medium text-marica-ink ${className}`}
    >
      {label}
      <input
        type={type}
        min={min}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`mt-3 block text-sm font-medium text-marica-ink ${className}`}
    >
      {label}
      <textarea
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={label.startsWith("Deskripsi") ? 4 : 3}
        className={inputClass}
      />
    </label>
  );
}
