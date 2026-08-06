const stats = [
  { value: "5000+", label: "Anak Belajar" },
  { value: "2500+", label: "Orang Tua Puas" },
  { value: "4.9/5", label: "Rating Review" },
];

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.11.82.83-3.03-.2-.31A8.09 8.09 0 1 1 20.1 12a8.1 8.1 0 0 1-8.08 8.1Zm4.44-6.06c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
  </svg>
);

export default function StatsBar() {
  return (
    <div className="relative z-20 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-6 py-8 sm:justify-evenly lg:px-10">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-2xl font-semibold text-[#2b2b2b] sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 font-body text-xs text-[#6b6b6b] sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}

        <a
          href="https://wa.me/"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marica-green shadow-md transition hover:brightness-105 lg:h-12 lg:w-12"
          aria-label="Hubungi kami via WhatsApp"
        >
          <WhatsAppIcon />
        </a>
      </div>
    </div>
  );
}
