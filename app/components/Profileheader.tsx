"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src={company?.logoUrl || "/images/logo.png"}
            alt={company?.name || "Marica"}
            width={434}
            height={145}
            priority
            className="h-7 w-auto object-contain sm:h-9"
          />
        </Link>
      </div>
    </header>
  );
}
