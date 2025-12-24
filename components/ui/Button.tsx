"use client";

import * as React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        // Base
        "inline-flex items-center justify-center rounded-2xl font-semibold",
        "relative overflow-hidden",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",

        // Sizes
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-6 text-base",
        size === "lg" && "h-12 px-8 text-lg",

        // Variants
        variant === "primary" &&
          [
            // Boutique "ink button" with subtle gradient
            "bg-linear-to-r from-[#2f2a26] to-[#3a3430]",
            "text-[#f4efe8]",
            "shadow-medium",
            "hover:shadow-large hover:-translate-y-0.5 hover:scale-[1.02]",
            "active:translate-y-0 active:scale-100",
            "hover:bg-linear-to-r hover:from-[#2f2a26] hover:to-[#3a3430] hover:brightness-110",
          ].join(" "),

        variant === "secondary" &&
          [
            // Warm paper button with enhanced depth
            "bg-surface text-ink-primary",
            "border border-black/12",
            "shadow-soft",
            "hover:bg-surface/95 hover:border-black/16 hover:shadow-medium hover:-translate-y-0.5 hover:scale-[1.01]",
            "active:translate-y-0 active:scale-100",
          ].join(" "),

        variant === "ghost" &&
          [
            // Quiet interactive chip-style
            "bg-transparent text-ink-primary",
            "border border-transparent",
            "hover:bg-surface/70 hover:border-black/12",
            "active:scale-[0.99]",
          ].join(" "),

        className
      )}
    />
  );
}
