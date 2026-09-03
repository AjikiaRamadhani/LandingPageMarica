"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Plus,
  Home,
  Building2,
  MoreHorizontal,
  Check,
  Crosshair,
  Phone,
  User,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type AddressLabel = "Rumah" | "Kantor" | "Lainnya";

export interface ShippingAddress {
  id: string;
  label: AddressLabel;
  isPrimary: boolean;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  note?: string;
}

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  addresses: ShippingAddress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddAddress: (address: ShippingAddress) => void;
  /** Called when the user confirms the selected address and wants to proceed to payment. */
  onConfirm: (address: ShippingAddress) => void;
}

const LABEL_ICON: Record<AddressLabel, typeof Home> = {
  Rumah: Home,
  Kantor: Building2,
  Lainnya: MoreHorizontal,
};

// Trimmed list for the demo — swap for a full province/city dataset or API in production.
const PROVINCES = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Sumatera Utara",
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function AddressModal({
  open,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAddAddress,
  onConfirm,
}: AddressModalProps) {
  const [mode, setMode] = useState<"list" | "form">("list");

  // Portal target isn't available during SSR, so only render into
  // document.body once mounted on the client. This also guarantees the
  // modal always escapes any ancestor's `overflow-hidden`/transform (e.g.
  // ProductCard's rounded card container) instead of being clipped inside it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const selected = addresses.find((a) => a.id === selectedId) ?? null;

  const handleClose = () => {
    setMode("list");
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="address-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-marica-ink/40"
          />

          <motion.div
            key="address-modal"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-[0_-14px_35px_rgba(120,60,10,0.15)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[560px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            {/* Drag handle — mobile only */}
            <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-marica-ink/10 sm:hidden" />

            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-marica-ink sm:text-xl">
                {mode === "list" ? "Atur Alamat Pengiriman" : "Tambah Alamat Baru"}
              </h2>
              <button
                type="button"
                onClick={mode === "form" ? () => setMode("list") : handleClose}
                aria-label="Tutup"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-marica-cream text-marica-ink-soft transition hover:bg-marica-amber/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {mode === "list" ? (
              <AddressList
                addresses={addresses}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddNew={() => setMode("form")}
                onConfirm={() => selected && onConfirm(selected)}
              />
            ) : (
              <AddressForm
                onCancel={() => setMode("list")}
                onSave={(addr) => {
                  onAddAddress(addr);
                  setMode("list");
                }}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*  List view                                                                 */
/* -------------------------------------------------------------------------- */

function AddressList({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onConfirm,
}: {
  addresses: ShippingAddress[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-5">
      <p className="mb-3 font-body text-sm text-marica-ink-soft">
        Pilih alamat tujuan pengiriman untuk pesanan ini.
      </p>

      <div className="flex flex-col gap-3">
        {addresses.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-marica-ink/15 py-10 text-center">
            <MapPin className="h-8 w-8 text-marica-ink-soft/40" />
            <p className="font-body text-sm text-marica-ink-soft">
              Belum ada alamat tersimpan.
            </p>
          </div>
        )}

        {addresses.map((addr) => {
          const Icon = LABEL_ICON[addr.label];
          const isSelected = addr.id === selectedId;
          return (
            <button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr.id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-marica-amber-dark bg-marica-amber/10"
                  : "border-marica-ink/10 bg-white hover:bg-marica-cream"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isSelected ? "bg-marica-amber-dark text-white" : "bg-marica-cream text-marica-ink-soft"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-body text-sm font-semibold text-marica-ink">
                    {addr.recipientName}
                  </span>
                  <span className="rounded-full bg-marica-ink/5 px-2 py-0.5 font-body text-[11px] font-medium text-marica-ink-soft">
                    {addr.label}
                  </span>
                  {addr.isPrimary && (
                    <span className="rounded-full bg-marica-green/15 px-2 py-0.5 font-body text-[11px] font-medium text-marica-green">
                      Utama
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block font-body text-xs text-marica-ink-soft">
                  {addr.phone}
                </span>
                <span className="mt-1 block font-body text-xs leading-relaxed text-marica-ink-soft">
                  {addr.fullAddress}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}
                </span>
              </span>

              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-marica-amber-dark bg-marica-amber-dark" : "border-marica-ink/15"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-marica-amber-dark/50 py-3.5 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10"
        >
          <Plus className="h-4 w-4" />
          Tambah Alamat Baru
        </button>
      </div>

      <button
        type="button"
        disabled={!selectedId}
        onClick={onConfirm}
        className="mt-6 w-full rounded-full bg-marica-amber-dark py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Gunakan Alamat Ini &amp; Bayar
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Add-address form                                                          */
/* -------------------------------------------------------------------------- */

function AddressForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (address: ShippingAddress) => void;
}) {
  const [label, setLabel] = useState<AddressLabel>("Rumah");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [note, setNote] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const isValid =
    recipientName.trim() &&
    phone.trim() &&
    province &&
    city.trim() &&
    district.trim() &&
    postalCode.trim() &&
    fullAddress.trim();

  // Uses the browser Geolocation API to prefill coordinates as a note.
  // Swap in a reverse-geocoding provider (e.g. Google Maps Geocoding API)
  // to auto-fill province/city/district/postal code from lat/long.
  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Perangkat ini tidak mendukung deteksi lokasi.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setNote((prev) =>
          prev
            ? prev
            : `Lokasi terdeteksi: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (lengkapi detail alamat di atas)`
        );
        setLocating(false);
      },
      () => {
        setLocateError("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      id: `addr-${Date.now()}`,
      label,
      isPrimary,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      province,
      city: city.trim(),
      district: district.trim(),
      postalCode: postalCode.trim(),
      fullAddress: fullAddress.trim(),
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
      {/* Label chips */}
      <div>
        <span className="mb-1.5 block font-body text-xs font-medium text-marica-ink-soft">
          Label Alamat
        </span>
        <div className="flex gap-2">
          {(Object.keys(LABEL_ICON) as AddressLabel[]).map((opt) => {
            const Icon = LABEL_ICON[opt];
            const active = label === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setLabel(opt)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-body text-xs font-medium transition ${
                  active
                    ? "border-marica-amber-dark bg-marica-amber-dark text-white"
                    : "border-marica-ink/10 bg-white text-marica-ink-soft hover:bg-marica-cream"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Use current location */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="flex items-center justify-center gap-2 rounded-2xl border border-marica-blue/30 bg-marica-sky-light py-2.5 font-body text-xs font-semibold text-marica-ink transition hover:bg-marica-sky disabled:opacity-60"
      >
        <Crosshair className="h-3.5 w-3.5" />
        {locating ? "Mendeteksi lokasi..." : "Gunakan Lokasi Saat Ini"}
      </button>
      {locateError && (
        <p className="-mt-2 font-body text-xs text-marica-rose-deep">{locateError}</p>
      )}

      {/* Recipient + phone */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama Penerima" icon={User}>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="cth. Budi Santoso"
            className={inputClass}
          />
        </Field>
        <Field label="No. Telepon" icon={Phone}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className={inputClass}
          />
        </Field>
      </div>

      {/* Province + city */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Provinsi">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            <option value="">Pilih provinsi</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kota / Kabupaten">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="cth. Kota Magelang"
            className={inputClass}
          />
        </Field>
      </div>

      {/* District + postal code */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kecamatan">
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="cth. Magelang Tengah"
            className={inputClass}
          />
        </Field>
        <Field label="Kode Pos">
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="cth. 56117"
            inputMode="numeric"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Alamat Lengkap">
        <textarea
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <Field label="Catatan untuk Kurir (opsional)">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="cth. Pagar hijau, titip ke satpam"
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 font-body text-sm text-marica-ink-soft">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="h-4 w-4 rounded border-marica-ink/20 text-marica-amber-dark focus:ring-marica-amber-dark/40"
        />
        Jadikan sebagai alamat utama
      </label>

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border-2 border-marica-ink/10 py-3 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-marica-cream"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 rounded-full bg-marica-amber-dark py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Simpan Alamat
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-marica-ink/10 bg-white py-2.5 px-3.5 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/50 outline-none transition focus:border-marica-amber-dark/50";

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof User;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-medium text-marica-ink-soft">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      {children}
    </label>
  );
}