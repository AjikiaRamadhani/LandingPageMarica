import type { Metadata } from "next";
import AuthShell from "../components/Authshell";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Marica untuk melanjutkan perjalanan belajar si kecil.",
};

export default function LoginPage() {
  return <AuthShell mode="login" />;
}