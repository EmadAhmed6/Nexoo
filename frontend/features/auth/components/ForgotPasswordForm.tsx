"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaType,
} from "../schemas/auth.schema";
import { useForgotPassword } from "../hooks/useAuth";
import { Input, Button, Text } from "@/_components/shared";
import { useTranslations } from "next-intl";

const RESEND_COOLDOWN = 60;

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastEmail, setLastEmail] = useState("");
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
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

  const sendResetLink = useCallback(
    (email: string, isResend = false) => {
      setServerError(null);

      forgotPassword(
        { email },
        {
          onSuccess: (res) => {
            setIsSubmitted(true);
            setLastEmail(email);
            const msg =
              res?.message ||
              "If an account with this email exists, a password reset link has been sent.";
            setSuccessMessage(msg);
            toast.success(isResend ? "Reset link resent!" : "Password reset link sent!");
            startCooldown();
          },
          onError: (err) => {
            const msg =
              err.message || "Failed to send reset link. Please try again.";
            setServerError(msg);
            toast.error(msg);
          },
        }
      );
    },
    [forgotPassword, startCooldown]
  );

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    if (isSubmitted) return;
    setSuccessMessage(null);
    sendResetLink(data.email);
  };

  const handleResend = () => {
    if (!lastEmail || cooldown > 0 || isPending) return;
    sendResetLink(lastEmail, true);
  };

  const handleResetForm = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setIsSubmitted(false);
    setSuccessMessage(null);
    setServerError(null);
    setCooldown(0);
    setLastEmail("");
    reset({ email: "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-borderPrimary bg-bgSecondary shadow-xl"
    >
      {/* Header */}
      <div className="mb-6">
        <Text as="h1" size="3xl" font="black" className="tracking-tight">
          {t("forgotPasswordTitle")}
        </Text>
        <Text size="sm" color="secondary" className="mt-1.5 leading-relaxed">
          {t("forgotPasswordSubtitle")}
        </Text>
      </div>

      {/* Alerts */}
      <AnimatePresence mode="wait">
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

        {successMessage && (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-start gap-2.5 overflow-hidden"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block mb-0.5">{t("linkSent")}</span>
              <span>{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form remains visible */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Input */}
        <div>
          <Input
            label={t("email")}
            type="email"
            autoComplete="email"
            placeholder="alex@nexo.com"
            disabled={isSubmitted || isPending}
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            className={
              isSubmitted
                ? "opacity-60 cursor-not-allowed bg-bgSecondary border-borderPrimary"
                : ""
            }
            {...register("email", { onChange: () => clearErrors("email") })}
          />
        </div>

        {/* Action Button */}
        {isSubmitted ? (
          <div className="space-y-2 pt-1">
            {/* Sent confirmation */}
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              disabled
              className="cursor-not-allowed border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t("emailSentSuccess")}
            </Button>

            {/* Cooldown / Resend row */}
            <AnimatePresence mode="wait">
              {cooldown > 0 ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-textSecondary"
                >
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {t("resendAvailableIn")}{" "}
                    <span className="tabular-nums font-semibold text-primary">
                      {cooldown}s
                    </span>
                  </span>
                </motion.div>
              ) : (
                <motion.button
                  key="resend-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  id="resend-forgot-password-btn"
                  onClick={handleResend}
                  disabled={isPending}
                  className="w-full text-center py-1.5 text-xs text-primary hover:underline font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {isPending ? t("sending") : t("resendEmail")}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Use different email */}
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full text-center py-1 text-xs text-textSecondary hover:text-textPrimary transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              {t("useDifferentEmail")}
            </button>
          </div>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isPending}
            loadingText={t("sendingResetLink")}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-2"
          >
            {t("sendResetLink")}
          </Button>
        )}

        {/* Back to Login */}
        <div className="pt-3 border-t border-borderPrimary text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("backToSignIn")}
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
