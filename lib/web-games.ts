/**
 * Katalog game eksternal milik Marica.
 *
 * Data ini sengaja statis karena game dijalankan di situs/aplikasi lain dan
 * tidak dikelola melalui database toko.marica.id.
 */
export const WEB_GAMES = {
  "pacu-jalur": {
    title: "Marica Pacu Jalur",
    url: "https://pacujalur.marica.id/",
  },
  "panjat-pinang": {
    title: "Panjat Pinang",
    url: "https://panjatpinang.marica.id/",
  },
  "dino-escape": {
    title: "Dino Escape",
    url: "https://dino.marica.id/",
  },
  "angkasa-rasa": {
    title: "Marica Angkasa Rasa",
    url: "https://angkarasa.marica.id/",
  },
} as const;

export type WebGameId = keyof typeof WEB_GAMES;
