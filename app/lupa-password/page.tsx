import type { Metadata } from "next";
import ForgotPasswordForm from "../components/Forgotpasswordform";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Atur ulang password akun Marica kamu.",
};

export default function LupaPasswordPage() {
  return <ForgotPasswordForm />;
}