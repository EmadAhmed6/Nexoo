"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { loginSchema, LoginSchemaType } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { Input, Button, Text } from "@/_components/shared";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: LoginSchemaType) => {
    setServerError(null);
    setSuccessMessage(null);

    login(data, {
      onSuccess: () => {
        const msg = "Logged in successfully! Redirecting...";
        setSuccessMessage(msg);
        toast.success("Welcome back!", {
          description: "You have successfully logged in to Nexo.",
        });
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      },
      onError: (err) => {
        const msg =
          err.message || "Failed to log in. Please check your credentials.";
        setServerError(msg);
        toast.error("Login failed", {
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
          Welcome back
        </Text>
        <Text size="sm" color="secondary" className="mt-1.5">
          Sign in to your Nexo account to continue.
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="alex@nexo.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email", { onChange: () => clearErrors("email") })}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password", { onChange: () => clearErrors("password") })}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isPending}
          loadingText="Signing in..."
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-borderPrimary text-center">
        <Text size="xs" color="secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-bold transition-colors"
          >
            Create an account
          </Link>
        </Text>
      </div>
    </motion.div>
  );
}
