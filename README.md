# Marica Web

Website Marica untuk katalog dan transaksi retail, printable anak, artikel
parenting, event/workshop, Playpass, reservasi meja, F&B, loyalty points, dan
operasional POS.

## Menjalankan project

Pastikan Node.js dan PostgreSQL tersedia, lalu siapkan environment pada bagian
berikut.

```bash
npm install
npx prisma generate
npm run dev
```

Buka `http://localhost:3000`.

Perintah penting:

```bash
npm run build             # build production
npm run lint              # pemeriksaan lint
npx tsc --noEmit          # pemeriksaan TypeScript
npx prisma migrate deploy
npx prisma db seed
```

## Environment

Gunakan `.env` lokal atau secret manager pada hosting. Jangan commit nilai
rahasia ke repository.

### Database dan autentikasi

```text
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...                 # opsional
AUTH_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...                        # opsional
GOOGLE_CLIENT_SECRET=...                    # opsional
```

### Pembayaran

```text
PAYMENT_PROVIDER=midtrans                   # midtrans atau winpay
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...

WINPAY_API_KEY=...
WINPAY_SECRET_KEY=...
WINPAY_BASE_URL=https://sandbox-checkout.winpay.id
WINPAY_IS_PRODUCTION=false
WINPAY_INVOICE_EXPIRY_MINUTES=120
WINPAY_DISABLE_WHATSAPP_FALLBACK=false
MARICA_WHATSAPP_NUMBER=628...
```

Webhook pembayaran:

- Midtrans: `/api/webhooks/midtrans`
- WinPay: `/api/webhooks/winpay`

Jika checkout WinPay gagal, aplikasi dapat menggunakan fallback WhatsApp.

### Supabase Storage

```text
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Bucket `printables` digunakan untuk file printable. Service role key hanya boleh
digunakan di server.

### Email SMTP

Untuk akun email cPanel, ambil nilai host dan port dari menu **Connect Devices**
di cPanel. Port `465` memakai SSL, sedangkan port `587` memakai STARTTLS.

```text
SMTP_HOST=mail.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=...
SMTP_FROM=no-reply@example.com
```

Konfigurasi Gmail lama tetap didukung jika `SMTP_*` tidak diisi:

```text
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
```

Digunakan untuk email printable, tiket event, Playpass, reservasi, dan pesanan.

### WhatsApp Cloud API (opsional)

```text
WHATSAPP_CLOUD_ACCESS_TOKEN=...
WHATSAPP_CLOUD_PHONE_NUMBER_ID=...
WHATSAPP_GRAPH_API_VERSION=vXX.X
WHATSAPP_PRINTABLE_TEMPLATE_NAME=...
WHATSAPP_PRINTABLE_TEMPLATE_LANGUAGE=id
```

Jika belum dikonfigurasi, link WhatsApp manual dan direct download printable
tetap tersedia. Template Meta harus sudah disetujui dan menerima parameter nama,
judul printable, serta URL download. Access token tidak boleh dikirim ke
browser.

`GAME_VISIT_POINTS` tidak perlu ditambahkan ke `.env`. Nilai poin kunjungan game
dikontrol langsung oleh backend.

## Database dan inventaris

Terapkan migration sebelum deploy:

```bash
npx prisma migrate deploy
```

Stok dipisah menjadi dua lokasi:

- `ONLINE_WAREHOUSE`: stok untuk checkout website.
- `MARICA_STORE`: stok Experience Store untuk POS.

Perpindahan stok dilakukan melalui Admin > Inventaris. Jangan mengubah stok
gabungan secara manual. `Product.stock` tetap menjadi salinan stok gudang online
untuk kompatibilitas katalog dan checkout.

## Fitur utama backend

- Autentikasi credentials dan Google OAuth.
- Katalog produk, keranjang, checkout, pembayaran, webhook, voucher, dan poin.
- POS, shift kasir, transaksi retail, Playpass, F&B, dan stok Experience Store.
- Event, booking tiket, QR check-in, kalender, dan email tiket.
- Reservasi meja/space dan pre-order F&B.
- Printable yang membutuhkan login, signed download URL, email, dan link WhatsApp.
- Edugames eksternal dengan pencatatan kunjungan dan batas 20 poin per hari.
- Artikel SEO, kategori, komentar, video, dan produk terkait.
- Subscription, child profile, B2B inquiry, quotation, serta dashboard admin.

## Swagger API

Dokumentasi API tersedia pada:

- UI Swagger: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api/swagger`

Setiap endpoint baru yang berhubungan dengan fitur backend perlu ditambahkan ke
dokumentasi Swagger.

## Smoke test backend

Smoke test dijalankan terhadap server lokal dan database khusus testing. Test ini
bersifat opt-in agar tidak mengubah data ketika project hanya dibuild.

Terminal pertama:

```bash
npm run dev
```

Terminal kedua, PowerShell:

```powershell
$env:SMOKE_TEST="true"
$env:SMOKE_BASE_URL="http://localhost:3000"
$env:SMOKE_EMAIL="smoke@example.com"
$env:SMOKE_PASSWORD="SmokeTest!123"
$env:SMOKE_NAME="Marica Smoke Test"
$env:SMOKE_PHONE="081234567890"
$env:SMOKE_PRODUCT_ID="<id produk gudang online>"
$env:MIDTRANS_SERVER_KEY="<server key sandbox>"
$env:SMOKE_ADMIN_EMAIL="<email admin atau kasir>"
$env:SMOKE_ADMIN_PASSWORD="<password admin atau kasir>"
$env:SMOKE_POS_PRODUCT_ID="<id produk dengan stok Experience Store>"
$env:SMOKE_FREE_EVENT_SLUG="<slug event gratis aktif>"
$env:SMOKE_PRINTABLE_ID="<id printable gratis aktif>"
npm run test:smoke
```

Smoke test mencakup register/login, checkout dan webhook Midtrans, pengurangan
stok POS, booking event dan QR check-in, printable dan link WhatsApp, serta
idempotensi dan batas poin game harian. Gunakan akun, produk, event, printable,
dan database khusus testing; jangan arahkan test ke production.

## Struktur penting

```text
app/api/          API route backend
app/              halaman Next.js dan route UI
lib/              service pembayaran, auth, email, storage, poin, dan inventory
prisma/           schema, migration, dan seed database
tests/            unit test dan smoke test backend
```
