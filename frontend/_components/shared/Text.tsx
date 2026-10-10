"use client";

import React, { ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("transition-colors", {
  variants: {
    font: {
      default: "font-normal",
      black: "font-black",
      extraBold: "font-extrabold",
      bold: "font-bold",
      semiBold: "font-semibold",
      normal: "font-normal",
      medium: "font-medium",
      light: "font-light",
      thin: "font-thin",
    },
    size: {
      default: "text-base",
      base: "text-base",
      xs: "text-xs",
      sm: "text-sm",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "32": "text-[32px]",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
    },
    color: {
      default: "text-textPrimary",
      primary: "text-textPrimary",
      primary2: "text-textPrimary2",
      secondary: "text-textSecondary",
      error: "text-textError",
      accent: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
      black: "text-black",
    },
  },
  defaultVariants: {
    font: "default",
    size: "default",
    color: "default",
  },
});

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
} & VariantProps<typeof textVariants> &
  Omit<React.ComponentPropsWithoutRef<T>, "as" | "color" | "className" | "children">;

function Text<T extends ElementType = "p">({
  as,
  className,
  font,
  color,
  size,
  children,
  ...props
}: TextProps<T>) {
  const Component = as || "p";

  return (
    <Component
      className={cn(textVariants({ font, color, size }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

Text.displayName = "Text";

export { Text, textVariants };
export type { TextProps };
