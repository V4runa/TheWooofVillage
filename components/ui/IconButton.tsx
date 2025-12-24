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
        "inline-flex items-center justify-center rounded-2xl",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",

        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",

        variant === "soft" &&
          [
            "bg-surface border border-black/12 shadow-soft",
            "hover:bg-surface/95 hover:border-black/18 hover:shadow-medium hover:-translate-y-0.5 hover:scale-105",
            "active:translate-y-0 active:scale-100",
          ].join(" "),

        variant === "ghost" &&
          [
            "bg-transparent border border-transparent",
            "hover:bg-surface/60 hover:border-black/12",
            "active:scale-[0.99]",
          ].join(" "),

        className
      )}
    >
      {children}
    </button>
  );
}
