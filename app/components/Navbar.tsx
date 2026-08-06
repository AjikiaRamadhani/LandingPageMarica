import Image from "next/image";

const ChevronDown = () => (
  <svg
    width="12"
    height="8"
    viewBox="0 0 12 8"
    fill="none"
    className="ml-1 inline-block"
  >
    <path
      d="M1 1.5L6 6.5L11 1.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Navbar() {
  return (
    <header className="relative z-30 bg-marica-orange">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        {/* Logo */}
        <a href="/" className="shrink-0">
          <Image
            src="/images/logo-marica.png"
            alt="Marica - Math with a Smile"
            width={140}
            height={46}
            priority
            className="h-10 w-auto lg:h-11"
          />
        </a>

        {/* Nav links */}
        <div className="hidden items-center gap-7 font-display text-[15px] font-medium text-[#3a2a12] lg:flex">
          <a
            href="#"
            className="rounded-full bg-marica-teal px-5 py-2 text-white shadow-sm transition hover:brightness-105"
          >
            Beranda
          </a>
          <a href="#" className="transition hover:opacity-70">
            Jadi KLC
          </a>
          <a href="#" className="flex items-center transition hover:opacity-70">
            Informasi dan Berita
            <ChevronDown />
          </a>
          <a href="#" className="flex items-center transition hover:opacity-70">
            Tentang Kami
            <ChevronDown />
          </a>
          <a href="#" className="transition hover:opacity-70">
            Kontak
          </a>
          <button className="flex items-center transition hover:opacity-70" aria-label="Pilih bahasa">
            <span className="text-lg leading-none">🇮🇩</span>
            <ChevronDown />
          </button>
        </div>

        {/* Auth buttons */}
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="#"
            className="rounded-full bg-white px-6 py-2 font-display text-[15px] font-medium text-marica-orange-dark shadow-sm transition hover:brightness-95"
          >
            Masuk
          </a>
          <a
            href="#"
            className="rounded-full bg-white px-6 py-2 font-display text-[15px] font-medium text-marica-orange-dark shadow-sm transition hover:brightness-95"
          >
            Daftar
          </a>
        </div>
      </nav>
    </header>
  );
}
