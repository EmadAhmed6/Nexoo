"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useChangePassword } from "../hooks/useUser";
import {
  changePasswordSchema,
  ChangePasswordSchemaType,
} from "@/features/auth/schemas/auth.schema";
import { Button, Input, Text } from "@/_components/shared";

interface ChangePasswordSectionProps {
  userId: string;
}

export function ChangePasswordSection({ userId }: ChangePasswordSectionProps) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: changePassword, isPending } = useChangePassword(userId);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: ChangePasswordSchemaType) => {
    setServerError(null);
    setIsSuccess(false);

    changePassword(
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (res) => {
          setIsSuccess(true);
          reset();
          const message = res?.message || "Password changed successfully!";
          toast.success(message);
        },
        onError: (err: any) => {
          const message =
            err?.message || "Failed to change password. Please check your current password.";
          setServerError(message);
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-borderPrimary pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <Text as="h3" size="lg" font="bold" className="text-textPrimary">
                Security & Password
              </Text>
              <Text size="xs" color="secondary" className="mt-0.5">
                Update your account password to maintain optimal security.
              </Text>
            </div>
          </div>
        </div>
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
            className="p-3.5 rounded-xl bg-textError/10 border border-textError/20 text-textError text-xs flex items-start gap-2.5 overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </motion.div>
        )}

        {isSuccess && (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-start gap-2.5 overflow-hidden"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">Your password has been changed successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Current Password */}
        <div>
          <div className="relative">
            <Input
              label="Current Password"
              type={showOldPassword ? "text" : "password"}
              placeholder="Enter current password"
              autoComplete="current-password"
              disabled={isPending}
              icon={<Lock className="w-4 h-4" />}
              error={errors.oldPassword?.message}
              {...register("oldPassword", {
                onChange: () => {
                  clearErrors("oldPassword");
                  if (serverError) setServerError(null);
                  if (isSuccess) setIsSuccess(false);
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-[38px] text-textSecondary hover:text-textPrimary transition-colors"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Min. 6 chars (Aa1...)"
              autoComplete="new-password"
              disabled={isPending}
              icon={<Lock className="w-4 h-4" />}
              error={errors.newPassword?.message}
              {...register("newPassword", {
                onChange: () => {
                  clearErrors("newPassword");
                  if (serverError) setServerError(null);
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-[38px] text-textSecondary hover:text-textPrimary transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              disabled={isPending}
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                onChange: () => clearErrors("confirmPassword"),
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-[38px] text-textSecondary hover:text-textPrimary transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            loadingText="Updating Password..."
            disabled={!isDirty || isPending}
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
