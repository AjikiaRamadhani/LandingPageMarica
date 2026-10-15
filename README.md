This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Inventaris Omni-channel

Stok produk dipisah menjadi `ONLINE_WAREHOUSE` dan `MARICA_STORE`. Migration
`20261015140000_add_location_inventory_and_article_products` memindahkan seluruh
stok lama ke Gudang Online dan memulai Experience Store dari nol. Terapkan
migration database sebelum deploy aplikasi baru:

```bash
npx prisma migrate deploy
```

Checkout web memakai stok Gudang Online; transaksi retail POS memakai stok
Experience Store. Perpindahan stok harus dicatat sebagai transfer melalui menu
Admin > Inventaris, bukan dengan mengubah jumlah stok gabungan. `Product.stock`
tetap menjadi salinan stok Gudang Online untuk kompatibilitas checkout dan
katalog. Laporan Admin > Analytics memasukkan pesanan online yang dibayar dan
item retail POS dari transaksi `COMPLETED`; transaksi POS `VOIDED` dikecualikan.

Admin dapat memilih hingga delapan produk aktif pada form artikel. Widget
produk tersebut tampil di bawah konten artikel publik. Detail kontrak API
inventaris dan artikel tersedia pada dokumentasi Swagger di `/api/swagger`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
