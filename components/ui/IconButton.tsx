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

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      aria-label={label}
      title={label}
      className={clsx(
        // layout
        "group relative inline-flex items-center justify-center rounded-2xl",
        // icon tone control (prevents harsh contrast)
        "text-ink-muted hover:text-ink-secondary",
        // motion
        "transition-[transform,box-shadow,background-color,border-color,opacity,color,filter] duration-200 ease-out",
        // focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10",
        // disabled
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",

        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",

        variant === "soft" &&
          [
            // photo-friendly definition
            "border border-line/10 ring-1 ring-line/10",
            // clean glass surface
            "bg-white/72 backdrop-blur-md",
            "shadow-soft",

            // hover: clarity + gentle lift
            "hover:shadow-medium hover:-translate-y-[1px]",
            "hover:border-line/16 hover:ring-line/14",
            "hover:bg-white/78",
            "hover:saturate-[1.03] hover:brightness-[1.01]",

            // active: settle
            "active:translate-y-0 active:shadow-soft",
          ].join(" "),

        variant === "ghost" &&
          [
            "border border-transparent ring-0",
            "bg-transparent shadow-none",
            // clean mist hover (not beige)
            "hover:bg-white/22 hover:border-line/12 hover:ring-1 hover:ring-line/10",
            "active:bg-white/18",
          ].join(" "),

        className
      )}
    >
      {/* subtle inner sheen so icons feel integrated */}
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_62%)]",
          variant === "ghost" ? "opacity-18" : "opacity-42"
        )}
      />

      {/* organic corner sparkle — brand (no brown) */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full",
            "opacity-65 group-hover:opacity-90 transition-opacity duration-200",
            "bg-[radial-gradient(circle,rgba(255,255,255,0.75),rgba(79,156,255,0.20),rgba(63,161,126,0.14),transparent_72%)]",
            corner === "tr" && "right-1.5 top-1.5",
            corner === "tl" && "left-1.5 top-1.5",
            corner === "br" && "right-1.5 bottom-1.5",
            corner === "bl" && "left-1.5 bottom-1.5"
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
