import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "../components/Resetpasswordform";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Atur password baru untuk akun Marica kamu.",
};
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}