"use client";

import * as React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Tiny boutique detail. Default "auto" (deterministic by label/text).
   * Set "none" to disable.
   */
  cornerAccent?: "auto" | "none" | "tl" | "tr" | "bl" | "br";
};

export function Button({
  variant = "primary",
  size = "md",
  cornerAccent = "auto",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center rounded-2xl font-semibold " +
    "overflow-hidden " +
    "transition-[transform,box-shadow,background-color,border-color,opacity,filter] duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const sizes = clsx(
    size === "sm" && "h-9 px-4 text-sm",
    size === "md" && "h-11 px-6 text-base",
    size === "lg" && "h-12 px-8 text-lg"
  );

  // Deterministic corner so it feels organic but not random/flickery.
  const corner = React.useMemo(() => {
    if (cornerAccent === "none") return "none";
    if (cornerAccent !== "auto") return cornerAccent;

    const label =
      (typeof children === "string" ? children : "") ||
      (typeof props["aria-label"] === "string" ? props["aria-label"] : "") ||
      (typeof props.title === "string" ? props.title : "");

    const sum = Array.from(String(label)).reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );

    const corners = ["tr", "tl", "br", "bl"] as const;
    return corners[sum % corners.length];
  }, [cornerAccent, children, props["aria-label"], props.title]);

  const sheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),transparent_60%)] " +
    "before:opacity-60";

  const variants = {
    primary: clsx(
      "text-[#f6f1ea]",
      "bg-[linear-gradient(to_right,#2f2a26,#3a3430)]",
      "shadow-medium",
      sheen,

      // subtle inner edge so it feels “made”, not flat
      "ring-1 ring-white/8",
      "hover:ring-white/10",

      "hover:shadow-large hover:-translate-y-[1px] hover:brightness-[1.06]",
      "active:translate-y-0 active:brightness-100"
    ),

    secondary: clsx(
      "border border-black/5 ring-1 ring-black/5",
      "text-ink-primary",
      "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.78),rgba(250,242,232,0.62))]",
      "backdrop-blur-md",
      "shadow-soft",
      sheen,

      "hover:shadow-medium hover:-translate-y-[1px]",
      "hover:border-black/8 hover:ring-black/8",
      "hover:bg-[linear-gradient(to_bottom,rgba(255,252,246,0.86),rgba(252,246,238,0.72))]",
      "active:translate-y-0 active:shadow-soft"
    ),

    ghost: clsx(
      "border border-transparent ring-0",
      "bg-transparent",
      "text-ink-primary",
      "hover:bg-white/18",
      "hover:border-black/5 hover:ring-1 hover:ring-black/5",
      "active:bg-white/14",
      "shadow-none"
    ),
  } as const;

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(base, sizes, variants[variant], className)}
    >
      {/* tiny corner detail (subtle + organic, not always same spot) */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2 w-2 rounded-full",
            "opacity-55 transition-opacity duration-200 group-hover:opacity-75",
            // warm boutique accent; stays quiet on primary too
            "bg-[radial-gradient(circle,rgba(208,140,96,0.26),transparent_65%)]",
            corner === "tr" && "right-1 top-1",
            corner === "tl" && "left-1 top-1",
            corner === "br" && "right-1 bottom-1",
            corner === "bl" && "left-1 bottom-1"
          )}
        />
      )}

      {/* content */}
      <span className="relative inline-flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
