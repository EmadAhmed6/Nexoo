import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In - Nexo",
  description: "Sign in to your Nexo account to access your orders and wishlist.",
};

export default function LoginPage() {
  return <LoginForm />;
}
