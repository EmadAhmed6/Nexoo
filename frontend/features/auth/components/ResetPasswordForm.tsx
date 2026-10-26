"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "../schemas/auth.schema";
import { useResetPassword } from "../hooks/useAuth";
import { Input, Button, Text } from "@/_components/shared";
import { useTranslations } from "next-intl";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: ResetPasswordSchemaType) => {
    if (!token || !email) {
      setServerError("Invalid or missing password reset link. Please request a new one.");
      return;
    }

    setServerError(null);

    resetPassword(
      {
        email,
        token,
        newPassword: data.password,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Password has been reset successfully!");
          setTimeout(() => {
            router.push("/auth/login");
          }, 2500);
        },
        onError: (err) => {
          const msg =
            err.message || "Failed to reset password. The link may have expired.";
          setServerError(msg);
          toast.error(msg);
        },
      }
    );
  };

  const isInvalidLink = !token || !email;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-borderPrimary bg-bgSecondary shadow-xl"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <Text as="h1" size="3xl" font="black" className="tracking-tight">
          {t("resetPasswordTitle")}
        </Text>
        <Text size="sm" color="secondary" className="mt-1.5 leading-relaxed">
          {email ? (
            <>
              {t("resetPasswordFor")}{" "}
              <span className="font-semibold text-textPrimary">{email}</span>.
            </>
          ) : (
            t("resetPasswordSubtitle")
          )}
        </Text>
      </div>

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

        {isInvalidLink ? (
          <motion.div
            key="invalid-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 py-2"
          >
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">{t("invalidLink")}</span>
                {t("invalidLinkDesc")}
              </div>
            </div>

            <Link href="/auth/forgot-password">
              <Button variant="primary" size="md" fullWidth>
                {t("requestNewLink")}
              </Button>
            </Link>
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 py-3 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <Text as="h3" size="lg" font="bold">
                {t("passwordResetSuccess")}
              </Text>
              <Text size="sm" color="secondary">
                {t("passwordResetSuccessDesc")}
              </Text>
            </div>

            <div className="pt-2">
              <Link href="/auth/login">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t("signInNow")}
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* New Password */}
            <Input
              label={t("newPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              hint={t("passwordHint")}
              {...register("password", {
                onChange: () => clearErrors("password"),
              })}
            />

            {/* Confirm Password */}
            <Input
              label={t("confirmNewPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                onChange: () => clearErrors("confirmPassword"),
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isPending}
              loadingText={t("updatingPassword")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-2"
            >
              {t("resetPasswordBtn")}
            </Button>

            <div className="pt-2 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("backToSignIn")}
              </Link>
            </div>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
