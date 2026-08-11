import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.marica.id";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        // Tambahin route lain di sini kalau nanti ada halaman baru,
        // misal /login, /register, atau halaman program terpisah:
        // {
        //   url: `${siteUrl}/login`,
        //   lastModified: new Date(),
        //   changeFrequency: "monthly",
        //   priority: 0.5,
        // },
    ];
}