"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primaryHover text-white dark:text-black font-bold shadow-sm",
  outline:
    "border border-borderPrimary bg-transparent text-textPrimary hover:border-primary hover:text-primary",
  ghost:
    "bg-transparent text-textSecondary hover:text-textPrimary hover:bg-bgSecondary",
  danger:
    "bg-textError/10 border border-textError/20 text-textError hover:bg-textError/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold",
          "transition-colors duration-200 cursor-pointer select-none",
          "focus:outline-none focus:ring-2 focus:ring-ringPrimary focus:ring-offset-1",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        )}

        {/* Left Icon (hidden during loading) */}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}

        {/* Label */}
        <span>
          {isLoading && loadingText ? loadingText : children}
        </span>

        {/* Right Icon (hidden during loading) */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { Button };
