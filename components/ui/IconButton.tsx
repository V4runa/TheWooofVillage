"use client";

import * as React from "react";
import clsx from "clsx";

type IconButtonVariant = "soft" | "ghost";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string; // required for accessibility + tooltip
  variant?: IconButtonVariant;
  size?: "sm" | "md";
};

export function IconButton({
  label,
  variant = "soft",
  size = "md",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex items-center justify-center rounded-2xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",

        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",

        variant === "soft" &&
          "bg-white/70 border border-black/5 hover:bg-white active:scale-[0.98]",
        variant === "ghost" &&
          "bg-transparent hover:bg-black/5 active:scale-[0.98]",

        className
      )}
    >
      {children}
    </button>
  );
}
