import type { ReactNode } from "react";

type FontProviderProps = {
  children: ReactNode;
};

/**
 * Satu titik pembungkus font aplikasi.
 *
 * Jika font ingin diganti nanti, cukup ubah token font di globals.css dan
 * import font di app/layout.tsx. Seluruh halaman akan ikut berubah.
 */
export default function FontProvider({ children }: FontProviderProps) {
  return <div className="contents font-poppins">{children}</div>;
}
