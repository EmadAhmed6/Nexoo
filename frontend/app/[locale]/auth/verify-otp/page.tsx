import { Metadata } from "next";
import { Suspense } from "react";
import { VerifyOtpForm } from "@/features/auth/components/VerifyOtpForm";

export const metadata: Metadata = {
  title: "Verify Email - Nexoo",
  description: "Verify your email address with the OTP code we sent you.",
};

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-borderPrimary bg-bgSecondary text-center">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-textSecondary">Loading...</p>
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
