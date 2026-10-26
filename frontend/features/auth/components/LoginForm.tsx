"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { loginSchema, LoginSchemaType } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { Input, Button, Text } from "@/_components/shared";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: LoginSchemaType) => {
    setServerError(null);

    login(data, {
      onSuccess: () => {
        toast.success(t("loginSuccess"));
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Invalid email or password";
        setServerError(msg);

        // If account is unverified, backend sends an OTP and returns "Please verify your email first"
        if (msg.toLowerCase().includes("verify")) {
          toast.info(t("pleaseVerifyEmail"), {
            description: t("verificationCodeSent"),
          });
          setTimeout(() => {
            router.push(
              `/auth/verify-otp?email=${encodeURIComponent(data.email)}`
            );
          }, 1200);
        } else {
          toast.error(t("loginFailed"));
        }
      },
    });
  };

  const onInvalid = (fieldErrors: FieldErrors<LoginSchemaType>) => {
    console.warn("⚠️ Form validation failed with errors:", fieldErrors);
    const firstErrorMessage =
      fieldErrors.email?.message || fieldErrors.password?.message;
    if (firstErrorMessage) {
      toast.error(firstErrorMessage);
    }
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
          {t("welcomeBack")}
        </Text>
        <Text size="sm" color="secondary" className="mt-1.5">
          {t("signInSubtitle")}
        </Text>
      </div>

      {/* Server-level banners (submit only) */}
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

      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
        {/* Email */}
        <Input
          label={t("email")}
          type="email"
          autoComplete="email"
          placeholder="alex@nexo.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password */}
        <div>
          <Input
            label={t("password")}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:underline font-medium transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isPending || isSubmitting}
          loadingText={t("signingIn")}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          {t("signIn")}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-borderPrimary" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bgSecondary px-3 text-textSecondary font-medium">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <GoogleLoginButton text={t("signInWithGoogle")} />

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-borderPrimary text-center">
        <Text size="xs" color="secondary">
          {t("dontHaveAccount")}{" "}
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-bold transition-colors"
          >
            {t("createAccount")}
          </Link>
        </Text>
      </div>
    </motion.div>
  );
}
