"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useVerifyOtp, useResendOtp } from "../hooks/useAuth";
import { Button, Text } from "@/_components/shared";

const RESEND_COOLDOWN = 60;

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const t = useTranslations("auth");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setServerError(null);

    // Move to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const otpValue = otp.join("");
  const isComplete = otpValue.length === 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || !email) return;

    setServerError(null);
    verifyOtp(
      { email, otp: otpValue },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Verified successfully! Logging in...");
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        },
        onError: (err) => {
          const msg = err.message || "Invalid or expired OTP. Please try again.";
          setServerError(msg);
          toast.error(msg);
          // Clear inputs on error
          setOtp(Array(6).fill(""));
          inputRefs.current[0]?.focus();
        },
      }
    );
  };

  const handleClear = () => {
    setOtp(Array(6).fill(""));
    setServerError(null);
    inputRefs.current[0]?.focus();
  };

  const handleResend = () => {
    if (!email || cooldown > 0 || isResending) return;

    resendOtp(
      { email },
      {
        onSuccess: () => {
          toast.success("A new OTP has been sent to your email.");
          startCooldown();
          // Clear current OTP inputs
          setOtp(Array(6).fill(""));
          setServerError(null);
          inputRefs.current[0]?.focus();
        },
        onError: (err) => {
          const msg = err.message || "Failed to resend OTP. Please try again.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-borderPrimary bg-bgSecondary shadow-xl"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <Text as="h1" size="3xl" font="black" className="tracking-tight">
          {t("verifyEmailTitle")}
        </Text>
        <Text size="sm" color="secondary" className="mt-1.5 leading-relaxed">
          {email ? (
            <>
              {t("verifyOtpSubtitle")}{" "}
              <span className="font-semibold text-textPrimary">{email}</span>.
            </>
          ) : (
            "Enter the 6-digit code we sent to your email address."
          )}
        </Text>
      </div>

      <AnimatePresence mode="wait">
        {/* Error Alert */}
        {serverError && (
          <motion.div
            key="server-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 p-3.5 rounded-xl bg-textError/10 border border-textError/20 text-textError text-xs flex items-start gap-2.5 overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <Text as="span" size="xs" color="error" className="leading-relaxed">
              {serverError}
            </Text>
          </motion.div>
        )}

        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 py-3 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <Text as="h3" size="lg" font="bold">
                Email Verified!
              </Text>
              <Text size="sm" color="secondary">
                Your account is now active. Redirecting you...
              </Text>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            {/* OTP Inputs */}
            <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200
                    bg-bgPrimary text-textPrimary caret-primary
                    ${digit
                      ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.2)]"
                      : "border-borderPrimary hover:border-borderSecondary"
                    }
                    focus:border-primary focus:bg-primary/5 focus:shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.2)]
                    ${serverError ? "border-textError/50 bg-textError/5" : ""}
                  `}
                  disabled={isPending}
                  aria-label={`OTP digit ${index + 1}`}
                  id={`otp-digit-${index + 1}`}
                />
              ))}
            </div>

            {/* Clear button */}
            {otp.some((d) => d) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors"
                  disabled={isPending}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isPending}
              loadingText="Verifying..."
              rightIcon={<ArrowRight className="w-4 h-4" />}
              disabled={!isComplete}
            >
              {t("verifyCode")}
            </Button>

            {/* Resend OTP */}
            <p className="text-center text-xs text-textSecondary">
              Didn&apos;t receive the code?{" "}
              {cooldown > 0 ? (
                <span className="text-textSecondary font-medium">
                  {t("codeExpiresIn")}{" "}
                  <span className="tabular-nums text-primary">{cooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="inline-flex items-center gap-1 text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  id="resend-otp-btn"
                >
                  {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {isResending ? "Sending..." : t("resendCode")}
                </button>
              )}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
