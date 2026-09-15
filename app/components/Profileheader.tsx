"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ApiCompany = {
  name: string;
  logoUrl: string | null;
};

// Header khusus untuk halaman akun (/profil dan turunannya).
// Sengaja tidak memakai <Navbar /> yang penuh menu — di halaman akun,
// satu-satunya aksi navigasi yang relevan adalah kembali ke beranda.
export default function ProfileHeader() {
  const [company, setCompany] = useState<ApiCompany | null>(null);

  useEffect(() => {
    fetch("/api/company")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setCompany(data);
        }
      })
      .catch((err) => console.error("Failed to load company profile", err));
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-marica-ink/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src={company?.logoUrl || "/images/logo.png"}
            alt={company?.name || "Marica"}
            width={434}
            height={145}
            priority
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-marica-amber to-marica-amber-dark px-4 py-2.5 font-body text-xs font-semibold text-white shadow-[0_6px_16px_rgba(222,143,12,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(222,143,12,0.45)] active:translate-y-0"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 transition-transform duration-200 group-hover:-translate-x-0.5">
            <ArrowLeft className="h-3 w-3" />
          </span>
          Kembali ke Beranda
        </Link>
      </div>
    </header>
  );
}