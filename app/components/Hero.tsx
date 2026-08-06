import Image from "next/image";

const ArrowIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <path
      d="M1 7H17M17 7L11 1M17 7L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-marica-orange">
      {/* decorative flag + dashed trail, top-left */}
      <Image
        src="/images/hero-flag.png"
        alt=""
        aria-hidden
        width={139}
        height={677}
        className="pointer-events-none absolute left-0 top-8 h-[85%] w-auto max-w-[70px] select-none opacity-95 sm:max-w-[90px]"
      />

      {/* soft sparkle accent, top-right of copy */}
      <svg
        className="absolute right-[8%] top-10 hidden text-white/40 sm:block"
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
      >
        <path
          d="M17 0c1.2 8 6 12.8 14 14-8 1.2-12.8 6-14 14-1.2-8-6-12.8-14-14 8-1.2 12.8-6 14-14Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-10 lg:grid-cols-2 lg:gap-6 lg:px-10 lg:pb-20 lg:pt-14">
        {/* Left: copy */}
        <div className="relative z-10 max-w-xl">
          <h1 className="font-display text-[2.15rem] font-semibold leading-[1.15] text-white sm:text-5xl lg:text-[3.15rem]">
            Ciptakan Momen Belajar Ceria dan{" "}
            <span className="text-marica-teal-light underline decoration-4 underline-offset-4">
              Bermakna
            </span>{" "}
            Bersama
            <br />
            Si Kecil Setiap Hari
          </h1>

          <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-white/90 sm:text-base">
            Bingung mencari aktivitas bermanfaat untuk anak? Dari area
            bermain fisik, workshop akhir pekan, hingga Edu-Kit bulanan,
            Marica hadir menemani perjalanan belajar keluarga.
          </p>

          <a
            href="#"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-marica-maroon px-7 py-3.5 font-display text-base font-medium text-white shadow-lg shadow-marica-maroon/30 transition hover:bg-marica-maroon-dark"
          >
            Gabung Sekarang
            <ArrowIcon />
          </a>
        </div>

        {/* Right: character illustration with review bubbles (pre-composited image) */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <Image
            src="/images/hero-character.png"
            alt="Anak-anak senang belajar bersama Marica, ditemani ulasan orang tua yang puas"
            width={593}
            height={529}
            priority
            className="h-auto w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px]"
          />
        </div>
      </div>
    </section>
  );
}
