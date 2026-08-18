"use client";

import { useEffect, useState } from "react";

type CompanyProfile = {
  phone: string | null;
};

const WhatsAppIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.11.82.83-3.03-.2-.31A8.09 8.09 0 1 1 20.1 12a8.1 8.1 0 0 1-8.08 8.1Zm4.44-6.06c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
  </svg>
);

// "+62 822 2149 1429" -> "6282221491429" (format yang dibutuhkan wa.me)
function toWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
}

export default function WhatsAppButton() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/company")
      .then((res) => res.json())
      .then((data: CompanyProfile) => {
        if (data?.phone) setPhone(data.phone);
      })
      .catch((err) => console.error("Failed to load company profile", err));
  }, []);

  const href = phone ? `https://wa.me/${toWhatsAppNumber(phone)}` : "https://wa.me/6285870459329";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi kami via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-marica-green shadow-lg shadow-black/20 transition hover:brightness-105 hover:scale-105 lg:bottom-8 lg:right-8 lg:h-14 lg:w-14"
    >
      <WhatsAppIcon />
    </a>
  );
}