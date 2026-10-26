import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password - Nexo",
  description: "Set a new password for your Nexo account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-bgPrimary text-textPrimary">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-borderPrimary bg-bgSecondary text-center">
            <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-textSecondary">Loading reset form...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
