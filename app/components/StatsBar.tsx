const stats = [
  { value: "5000+", label: "Anak Belajar" },
  { value: "2500+", label: "Orang Tua Puas" },
  { value: "4.9/5", label: "Rating Review" },
];

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
      </div>
    </div>
  );
}
