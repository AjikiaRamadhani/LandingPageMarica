-- Marica event and printable seed data
-- Run this in Supabase SQL Editor after creating the `printables` Storage bucket.
-- Re-running this script updates records by slug instead of duplicating them.

INSERT INTO public.events (
  id, title, slug, category, description, benefits, price, "eventDate",
  "startTime", "endTime", "locationName", "locationAddress", quota, "isActive", "updatedAt"
)
VALUES
(
  'evt_workshop_kreasi_board_game',
  'Workshop Kreasi Board Game',
  'workshop-kreasi-board-game',
  'Workshop',
  'Anak-anak merancang dan membuat board game sederhana dari kertas, sambil belajar konsep aturan main dan strategi dasar. Di akhir sesi, setiap anak mencoba memainkan board game buatan teman-temannya.',
  ARRAY['Pembukaan dan perkenalan tema', 'Mendesain papan dan karakter', 'Menyusun aturan main', 'Sesi coba-main bersama', 'Penutupan dan foto bersama'],
  75000,
  '2026-09-05 10:00:00+07',
  '10:00',
  '12:00',
  'Marica Experience Store, Lt. 2',
  'Marica Experience Store',
  20,
  true,
  now()
),
(
  'evt_mendampingi_anak_belajar_tanpa_drama',
  'Mendampingi Anak Belajar Tanpa Drama',
  'mendampingi-anak-belajar-tanpa-drama',
  'Parenting',
  'Sesi diskusi untuk orang tua tentang cara mendampingi anak belajar di rumah tanpa berujung tantrum atau tarik urat.',
  ARRAY['Registrasi dan pembukaan', 'Mengenali pemicu drama belajar', 'Latihan komunikasi bersama fasilitator', 'Sesi tanya jawab'],
  0,
  '2026-09-06 10:00:00+07',
  '10:00',
  '11:30',
  'Ruang Parenting, Marica Experience Store',
  'Marica Experience Store',
  30,
  true,
  now()
),
(
  'evt_workshop_eksperimen_sains_seru',
  'Workshop Eksperimen Sains Seru',
  'workshop-eksperimen-sains-seru',
  'Workshop',
  'Eksperimen sains sederhana dan aman untuk anak, dari reaksi kimia dapur sampai membuat lampu lava mini. Semua bahan mudah ditemukan di rumah.',
  ARRAY['Pembukaan dan pengenalan alat', 'Eksperimen reaksi warna', 'Membuat lampu lava mini', 'Diskusi kenapa ini bisa terjadi'],
  85000,
  '2026-09-12 10:00:00+07',
  '10:00',
  '12:00',
  'Marica Experience Store, Lt. 2',
  'Marica Experience Store',
  20,
  true,
  now()
),
(
  'evt_membangun_kebiasaan_membaca',
  'Membangun Kebiasaan Membaca',
  'membangun-kebiasaan-membaca',
  'Parenting',
  'Strategi praktis membangun kebiasaan membaca pada anak, dari memilih buku yang tepat sampai rutinitas harian yang realistis.',
  ARRAY['Registrasi dan pembukaan', 'Memilih buku sesuai usia dan minat', 'Menyusun rutinitas membaca harian', 'Sesi tanya jawab'],
  0,
  '2026-09-20 10:00:00+07',
  '10:00',
  '11:30',
  'Ruang Parenting, Marica Experience Store',
  'Marica Experience Store',
  30,
  true,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  price = EXCLUDED.price,
  "eventDate" = EXCLUDED."eventDate",
  "startTime" = EXCLUDED."startTime",
  "endTime" = EXCLUDED."endTime",
  "locationName" = EXCLUDED."locationName",
  "locationAddress" = EXCLUDED."locationAddress",
  quota = EXCLUDED.quota,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = now();

INSERT INTO public.printables (
  id, title, slug, description, subject, "ageMin", "ageMax", "fileUrl",
  price, "isFeatured", "isActive", "updatedAt"
)
VALUES
(
  'prt_mewarnai_karakter_marica',
  'Mewarnai Karakter Marica',
  'mewarnai-karakter-marica',
  'Lembar mewarnai karakter-karakter Marica bersama teman belajarnya di taman. Dirancang untuk melatih motorik halus dan kreativitas anak.',
  'Motorik Halus',
  3,
  5,
  'mewarnai-karakter-marica.pdf',
  0,
  true,
  true,
  now()
),
(
  'prt_labirin_sederhana',
  'Labirin Sederhana',
  'labirin-sederhana',
  'Bantu si beruang menemukan jalan pulang lewat labirin yang seru untuk melatih logika dan kesabaran anak.',
  'Logika',
  4,
  6,
  'labirin-sederhana.pdf',
  0,
  false,
  true,
  now()
),
(
  'prt_mencari_pasangan',
  'Mencari Pasangan',
  'mencari-pasangan',
  'Lembar aktivitas mencocokkan gambar untuk melatih daya ingat, ketelitian, dan kemampuan observasi anak.',
  'Kognitif',
  3,
  5,
  'mencari-pasangan.pdf',
  0,
  false,
  true,
  now()
),
(
  'prt_hubungkan_titik_dino',
  'Hubungkan Titik (Dino)',
  'hubungkan-titik-dino',
  'Sambungkan titik-titik bernomor 1 sampai 35 untuk mengungkap wujud Dino sambil melatih pengenalan angka dan motorik halus.',
  'Motorik Halus',
  4,
  6,
  'hubungkan-titik-dino.pdf',
  0,
  false,
  true,
  now()
),
(
  'prt_mahkota_kertas',
  'Kerajinan: Mahkota Kertas',
  'mahkota-kertas',
  'Panduan kerajinan tangan lengkap untuk membuat mahkota kertas berkilau dengan pola potong dan hiasan permata warna-warni.',
  'Kreativitas',
  5,
  7,
  'mahkota-kertas.pdf',
  0,
  false,
  true,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  "ageMin" = EXCLUDED."ageMin",
  "ageMax" = EXCLUDED."ageMax",
  "fileUrl" = EXCLUDED."fileUrl",
  price = EXCLUDED.price,
  "isFeatured" = EXCLUDED."isFeatured",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = now();

-- Storage files expected by Printable.fileUrl:
-- printables/mewarnai-karakter-marica.pdf
-- printables/labirin-sederhana.pdf
-- printables/mencari-pasangan.pdf
-- printables/hubungkan-titik-dino.pdf
-- printables/mahkota-kertas.pdf
