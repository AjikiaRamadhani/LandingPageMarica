export type EventCategory = "workshop" | "parenting";

export type EventItem = {
  slug: string;
  category: EventCategory;
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  quota: number;
  quotaLeft: number;
  price: string;
  shortDescription: string;
  description: string[];
  agenda: { time: string; item: string }[];
  facilitator: {
    name: string;
    role: string;
  };
};

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  workshop: "Weekend Workshop",
  parenting: "Sesi Parenting",
};

export const CATEGORY_STYLE: Record<
  EventCategory,
  { bg: string; text: string; dot: string }
> = {
  workshop: {
    bg: "bg-marica-amber-dark",
    text: "text-white",
    dot: "bg-marica-amber-dark",
  },
  parenting: {
    bg: "bg-marica-teal",
    text: "text-white",
    dot: "bg-marica-teal",
  },
};

export const DAY_LABELS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const MONTH_LABELS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatLongDateID(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return `${days[date.getDay()]}, ${date.getDate()} ${MONTH_LABELS_ID[date.getMonth()]} ${date.getFullYear()}`;
}
