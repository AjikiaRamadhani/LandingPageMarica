import Image from "next/image";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#", active: true },
  { label: "Program", href: "#" },
  { label: "Aktivitas", href: "#" },
  { label: "Event", href: "#" },
  { label: "FAQ", href: "#" },
];

export default function Navbar() {
  return (
    <header className="relative z-30">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Marica"
            width={500}
            height={500}
            priority
            className="h-15 w-20 object-contain"
          />
          {/* <span className="font-display text-base font-semibold text-marica-amber-text lg:text-xl">
            Marica
          </span> */}
        </a>

        {/* Nav links */}
        <div className="hidden items-center gap-8 font-body text-[15px] font-medium text-marica-ink-soft lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "relative pb-1 text-marica-amber-text after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-marica-amber-dark"
                  : "transition hover:text-marica-ink"
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth button */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <a
            href="#"
            className="rounded-full bg-gradient-to-b from-marica-amber to-marica-amber-dark px-7 py-2.5 font-display text-[15px] font-medium text-white shadow-sm shadow-marica-amber-dark/30 transition hover:brightness-105"
          >
            Masuk
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Buka menu"
          className="flex shrink-0 items-center justify-center rounded-full p-1 text-marica-ink lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>
    </header>
  );
}
