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
    // Silhouette + affordance (more “control”, less “chip”)
    "group relative inline-flex items-center justify-center gap-2 rounded-xl " +
    "font-extrabold tracking-[-0.01em] " +
    "select-none whitespace-nowrap " +
    "transition-[transform,box-shadow,background-color,border-color,opacity,filter,color] duration-200 ease-out " +
    // tactile press (buttons only)
    "active:translate-y-[1px] " +
    // focus (warm)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.22)] " +
    // disabled
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const sizes = clsx(
    size === "sm" && "h-10 px-4 text-sm",
    size === "md" && "h-12 px-6 text-base",
    size === "lg" && "h-14 px-8 text-lg"
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

  /**
   * Button-only “hardware”:
   * - inset highlight + inner stroke reads as a physical control
   * - chips/badges should NOT carry this combo
   */
  const hardware =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.34),transparent_70%)] before:opacity-60 " +
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-xl " +
    "after:ring-1 after:ring-inset after:ring-white/14";

  const variants = {
    primary: clsx(
      "text-white",
      // CTA fill (warm-friendly, premium)
      "bg-[linear-gradient(90deg,rgba(63,161,126,1)_0%,rgba(96,140,255,0.86)_60%,rgba(255,176,122,0.92)_118%)]",
      // unmistakable “button depth”
      "shadow-[0_20px_52px_-26px_rgba(17,24,39,0.78)]",
      "ring-1 ring-white/18",
      hardware,
      // hover
      "hover:-translate-y-[1px]",
      "hover:shadow-[0_30px_78px_-34px_rgba(17,24,39,0.86)]",
      "hover:saturate-[1.06] hover:brightness-[1.02]",
      // active settles (still tactile)
      "active:brightness-[0.98]"
    ),

    secondary: clsx(
      // warm ink (avoid “black on warm bg”)
      "text-amber-950/86",
      /**
       * Distinction vs chips:
       * - heavier fill
       * - clearer border
       * - stronger depth
       */
      "bg-[rgba(255,240,225,0.78)]",
      "border border-amber-950/22",
      "shadow-[0_18px_42px_-24px_rgba(17,24,39,0.52)]",
      hardware,
      // hover
      "hover:-translate-y-[1px]",
      "hover:bg-[rgba(255,240,225,0.86)]",
      "hover:border-amber-950/30",
      "hover:shadow-[0_26px_60px_-30px_rgba(17,24,39,0.58)]",
      // active
      "active:bg-[rgba(255,240,225,0.74)]"
    ),

    ghost: clsx(
      // ghost should feel like a button *when you interact*, not a badge at rest
      "text-amber-950/82",
      "bg-transparent",
      "border border-transparent",
      "shadow-none",
      // hover turns into a light plate + outline
      "hover:-translate-y-[1px]",
      "hover:bg-[rgba(255,240,225,0.26)]",
      "hover:border-amber-950/18",
      "hover:shadow-[0_14px_34px_-22px_rgba(17,24,39,0.26)]",
      // active
      "active:bg-[rgba(255,240,225,0.20)]"
    ),
  } as const;

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(base, sizes, variants[variant], className)}
    >
      {/* tiny corner detail — subtle (not badge-like) */}
      {corner !== "none" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2 w-2 rounded-full",
            "opacity-35 transition-opacity duration-200 group-hover:opacity-55",
            "bg-[radial-gradient(circle,rgba(255,255,255,0.70),rgba(96,140,255,0.14),rgba(255,176,122,0.14),transparent_72%)]",
            corner === "tr" && "right-1 top-1",
            corner === "tl" && "left-1 top-1",
            corner === "br" && "right-1 bottom-1",
            corner === "bl" && "left-1 bottom-1"
          )}
        />
      ) : null}

      <span className="relative inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
