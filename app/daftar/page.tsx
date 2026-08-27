import type { Metadata } from "next";
import AuthShell from "../components/Authshell";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun Marica dan mulai belajar ceria bersama si kecil hari ini.",
};

export default function DaftarPage() {
  return <AuthShell mode="daftar" />;
}
