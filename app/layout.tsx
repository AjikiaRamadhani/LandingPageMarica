import type { Metadata } from "next";
import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.marica.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Marica - Platform Edukasi Calistung untuk Anak Indonesia",
    template: "%s | Marica",
  },
  description:
    "Marica menghadirkan pengalaman belajar keluarga berbasis phygital - area bermain edukatif, workshop akhir pekan, dan Edu-Kit bulanan untuk anak usia 2-12 tahun.",
  keywords: [
    "Marica",
    "edukasi anak",
    "calistung",
    "belajar sambil bermain",
    "playpass anak",
    "edu-kit",
    "workshop anak",
    "phygital learning",
  ],
  authors: [{ name: "PT Sebangku Jaya Abadi" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Marica",
    title: "Marica - Platform Edukasi Calistung untuk Anak Indonesia",
    description:
      "Ciptakan momen belajar ceria dan bermakna bersama si kecil setiap hari, bersama Marica.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Marica - Belajar Ceria Bersama Si Kecil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marica - Platform Edukasi Calistung untuk Anak Indonesia",
    description:
      "Ciptakan momen belajar ceria dan bermakna bersama si kecil setiap hari, bersama Marica.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased ">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}

