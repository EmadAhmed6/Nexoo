import { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account - Nexo",
  description: "Create a new Nexo account to start shopping premium items.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
