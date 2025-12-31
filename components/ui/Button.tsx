"use client";

import * as React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Tiny detail. Default "auto" (deterministic by label/text).
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
    "group relative inline-flex items-center justify-center rounded-2xl font-extrabold " +
    "overflow-hidden select-none " +
    "transition-[transform,box-shadow,background-color,border-color,opacity,filter] duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const sizes = clsx(
    size === "sm" && "h-9 px-4 text-sm",
    size === "md" && "h-11 px-6 text-base",
    size === "lg" && "h-12 px-8 text-lg"
  );

  const corner = React.useMemo(() => {
    if (cornerAccent === "none") return "none";
    if (cornerAccent !== "auto") return cornerAccent;

    const label =
      (typeof children === "string" ? children : "") ||
      (typeof props["aria-label"] === "string" ? props["aria-label"] : "") ||
      (typeof props.title === "string" ? props.title : "");

    const sum = Array.from(String(label)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const corners = ["tr", "tl", "br", "bl"] as const;
    return corners[sum % corners.length];
  }, [cornerAccent, children, props["aria-label"], props.title]);

  // Light sheen overlay to make it feel “finished”
  const sheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),transparent_62%)] " +
    "before:opacity-70";

  const variants = {
    primary: clsx(
      // IMPORTANT: high-contrast text so “Text” never disappears
      "text-white",

      // lively brand gradient (meadow + sky + sun hint)
      "bg-[linear-gradient(90deg,rgba(63,161,126,1)_0%,rgba(79,156,255,0.95)_55%,rgba(255,141,74,0.95)_115%)]",

      // definition + depth
      "shadow-medium ring-1 ring-white/20",
      sheen,

      // hover: glow + clarity
      "hover:shadow-large hover:-translate-y-[1px]",
      "hover:saturate-[1.08] hover:brightness-[1.03]",
      "active:translate-y-0 active:brightness-100"
    ),

    secondary: clsx(
      // photo-friendly “soft surface” button
      "text-ink-primary",
      "bg-white/80 backdrop-blur-md",
      "border border-line/12 ring-1 ring-line/10",
      "shadow-soft",
      sheen,

      "hover:shadow-medium hover:-translate-y-[1px]",
      "hover:border-line/18 hover:ring-line/18",
      "active:translate-y-0 active:shadow-soft"
    ),

    ghost: clsx(
      "text-ink-primary",
      "bg-transparent",
      "border border-transparent ring-0 shadow-none",
      "hover:bg-white/22 hover:border-line/12 hover:ring-1 hover:ring-line/10",
      "active:bg-white/18"
    ),
  } as const;

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(base, sizes, variants[variant], className)}
    >
      {/* tiny corner detail — brand-tinted (no brown) */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2 w-2 rounded-full",
            "opacity-65 transition-opacity duration-200 group-hover:opacity-85",
            "bg-[radial-gradient(circle,rgba(255,255,255,0.70),rgba(255,255,255,0.00)_70%)]",
            corner === "tr" && "right-1 top-1",
            corner === "tl" && "left-1 top-1",
            corner === "br" && "right-1 bottom-1",
            corner === "bl" && "left-1 bottom-1"
          )}
        />
      )}

      <span className="relative inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
