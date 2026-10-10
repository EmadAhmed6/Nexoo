"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Error } from "./Error";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, icon, error, hint, type = "text", className, id, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : type;
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-textPrimary2 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative flex items-center">
          {/* Left Icon */}
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none flex items-center">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              "w-full py-2.5 rounded-xl border bg-bgPrimary text-textPrimary text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ringPrimary",
              "placeholder:text-textSecondary/60",
              "transition-all duration-200",
              icon ? "pl-10" : "pl-3.5",
              isPassword ? "pr-10" : "pr-3.5",
              error
                ? "border-textError focus:ring-textError/30"
                : "border-borderPrimary hover:border-primary/40",
              className,
            )}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Animated Field Error */}
        <Error message={error} />

        {/* Hint (only when no error) */}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-textSecondary leading-snug">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
