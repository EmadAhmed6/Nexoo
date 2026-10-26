import { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password - Nexo",
  description: "Reset your Nexo account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
