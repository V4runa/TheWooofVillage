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
        "inline-flex items-center justify-center rounded-2xl font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",

        // Sizes
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-base",
        size === "lg" && "h-12 px-6 text-lg",

        // Variants
        variant === "primary" &&
          "bg-black text-white hover:bg-neutral-800 active:scale-[0.98]",

        variant === "secondary" &&
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98]",

        variant === "ghost" &&
          "bg-transparent text-neutral-900 hover:bg-neutral-100 active:scale-[0.98]",

        className
      )}
    />
  );
}
