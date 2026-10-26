"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { registerSchema, RegisterSchemaType } from "../schemas/auth.schema";
import { useRegister } from "../hooks/useAuth";
import { Input, Button, Text } from "@/_components/shared";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: RegisterSchemaType) => {
    setServerError(null);
    setSuccessMessage(null);

    registerUser(data, {
      onSuccess: () => {
        const msg = "Account created! Please verify your email.";
        setSuccessMessage(msg);
        toast.success("Account created successfully!", {
          description: "A verification code has been sent to your email.",
        });
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
        }, 1200);
      },
      onError: (err) => {
        const msg =
          err.message || "Failed to create account. Please check your inputs.";
        setServerError(msg);
        toast.error("Registration failed", {
          description: msg,
        });
      },
    });
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
          {t("createAccount")}
        </Text>
        <Text size="sm" color="secondary" className="mt-1.5">
          {t("signUpSubtitle")}
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

        {successMessage && (
          <motion.div
            key="success"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2.5 overflow-hidden"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3.5"
        noValidate
      >
        <Input
          label={t("fullName")}
          type="text"
          autoComplete="name"
          placeholder="Alex Morgan"
          icon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register("fullName", {
            onChange: () => clearErrors("fullName"),
          })}
        />

        <Input
          label={t("username")}
          type="text"
          autoComplete="username"
          placeholder="alex_nexo"
          icon={<span className="text-xs font-mono leading-none">@</span>}
          error={errors.username?.message}
          {...register("username", {
            onChange: () => clearErrors("username"),
          })}
        />

        <Input
          label={t("email")}
          type="email"
          autoComplete="email"
          placeholder="alex@nexo.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email", {
            onChange: () => clearErrors("email"),
          })}
        />

        <Input
          label={t("phone")}
          type="tel"
          autoComplete="tel"
          placeholder="01012345678"
          icon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          hint="Egyptian mobile number — 11 digits starting with 010 / 011 / 012 / 015"
          {...register("phone", {
            onChange: () => clearErrors("phone"),
          })}
        />

        {/* type="password" auto-enables show/hide toggle */}
        <Input
          label={t("password")}
          type="password"
          autoComplete="new-password"
          placeholder="Min 6 chars, 1 uppercase & 1 number"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password", {
            onChange: () => clearErrors("password"),
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isPending}
          loadingText="Creating account..."
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-3"
        >
          {t("signUp")}
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
      <GoogleLoginButton text={t("signUpWithGoogle")} />

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-borderPrimary text-center">
        <Text size="xs" color="secondary">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-bold transition-colors"
          >
            {t("signIn")}
          </Link>
        </Text>
      </div>
    </motion.div>
  );
}
