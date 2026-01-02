"use client";

import * as React from "react";
import clsx from "clsx";

type IconButtonVariant = "soft" | "ghost";
type IconButtonSize = "sm" | "md";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string; // required for accessibility + tooltip
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /**
   * Small, organic corner detail to keep things boutique.
   * - "auto": deterministic position based on label (default)
   * - "none": disables the accent
   * - specific corner: forces placement
   */
  cornerAccent?: "auto" | "none" | "tl" | "tr" | "bl" | "br";
};

export function IconButton({
  label,
  variant = "soft",
  size = "md",
  cornerAccent = "auto",
  className,
  children,
  ...props
}: IconButtonProps) {
  const corner = React.useMemo(() => {
    if (cornerAccent === "none") return "none";
    if (cornerAccent !== "auto") return cornerAccent;

    const sum = Array.from(label).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const corners = ["tr", "tl", "br", "bl"] as const;
    return corners[sum % corners.length];
  }, [cornerAccent, label]);

  const base = clsx(
    // silhouette (make it read like a “control”, not a badge)
    "group relative inline-flex items-center justify-center",
    "rounded-xl", // IMPORTANT: less pill-like than 2xl
    // icon tone (warm theme)
    "text-amber-900/75 hover:text-amber-950",
    // motion
    "transition-[transform,box-shadow,background-color,border-color,opacity,color] duration-200 ease-out",
    // focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.22)]",
    // disabled
    "disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed"
  );

  const sizing = clsx(size === "sm" && "h-10 w-10", size === "md" && "h-12 w-12");

  const soft = clsx(
    /**
     * Soft = main icon control
     * - clear plate
     * - clear elevation
     * - clear press
     */
    "bg-[rgba(255,240,225,0.72)]",
    "border border-amber-950/20",
    "ring-1 ring-inset ring-white/14",
    "shadow-[0_14px_34px_-20px_rgba(17,24,39,0.46)]",
    "hover:-translate-y-[1px]",
    "hover:bg-[rgba(255,240,225,0.82)] hover:border-amber-950/28",
    "hover:shadow-[0_22px_52px_-26px_rgba(17,24,39,0.56)]",
    // press feels like a control: no “float”, it settles in
    "active:translate-y-[1px]",
    "active:bg-[rgba(255,240,225,0.70)]",
    "active:shadow-[0_10px_24px_-18px_rgba(17,24,39,0.32)]"
  );

  const ghost = clsx(
    /**
     * Ghost = minimal icon control
     * - NO border at rest (avoid badge confusion)
     * - hover shows plate + outline
     */
    "bg-transparent",
    "border border-transparent",
    "shadow-none",
    "hover:-translate-y-[1px]",
    "hover:bg-[rgba(255,240,225,0.28)]",
    "hover:border-amber-950/18",
    "hover:shadow-[0_14px_34px_-22px_rgba(17,24,39,0.26)]",
    "active:translate-y-[1px]",
    "active:bg-[rgba(255,240,225,0.22)]"
  );

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      aria-label={label}
      title={label}
      className={clsx(base, sizing, variant === "soft" ? soft : ghost, className)}
    >
      {/* control polish: subtle top highlight (helps it read as “button”) */}
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-xl",
          "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.42),transparent_70%)]",
          variant === "ghost" ? "opacity-22" : "opacity-55"
        )}
      />

      {/* tiny corner detail (kept subtle so it doesn’t read “badge”) */}
      {corner !== "none" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full",
            "opacity-30 group-hover:opacity-45 transition-opacity duration-200",
            "bg-[radial-gradient(circle,rgba(255,255,255,0.60),rgba(96,140,255,0.14),rgba(255,176,122,0.14),transparent_72%)]",
            corner === "tr" && "right-1.5 top-1.5",
            corner === "tl" && "left-1.5 top-1.5",
            corner === "br" && "right-1.5 bottom-1.5",
            corner === "bl" && "left-1.5 bottom-1.5"
          )}
        />
      ) : null}

      <span className="relative inline-flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
