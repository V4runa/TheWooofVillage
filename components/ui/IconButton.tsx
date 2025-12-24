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

    // Deterministic "organic" placement: stable per label (no random flicker)
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
        "text-ink-muted",
        "hover:text-ink-secondary",
        // motion
        "transition-[transform,box-shadow,background-color,border-color,opacity,color] duration-200 ease-out",
        // focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/28 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        // disabled
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",

        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",

        variant === "soft" &&
          [
            // softer definition: ring + faint border
            "border border-black/5 ring-1 ring-black/5",
            // warm glass surface
            "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.68),rgba(250,242,232,0.52))]",
            "backdrop-blur-md",
            "shadow-soft",

            // hover: premium lift, not “pop”
            "hover:shadow-medium hover:-translate-y-[1px]",
            "hover:border-black/8 hover:ring-black/8",
            // slightly clearer surface on hover (not brighter/whiter)
            "hover:bg-[linear-gradient(to_bottom,rgba(255,252,246,0.74),rgba(252,246,238,0.58))]",

            // active: settle
            "active:translate-y-0 active:shadow-soft",
          ].join(" "),

        variant === "ghost" &&
          [
            "border border-transparent ring-0",
            "bg-transparent",
            "hover:border-black/5 hover:ring-1 hover:ring-black/5",
            // warm “mist” hover (avoid stark white)
            "hover:bg-[linear-gradient(to_bottom,rgba(255,252,246,0.28),rgba(250,242,232,0.18))]",
            "active:bg-[linear-gradient(to_bottom,rgba(255,252,246,0.22),rgba(250,242,232,0.14))]",
          ].join(" "),

        className
      )}
    >
      {/* subtle inner sheen so icons feel integrated */}
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.50),transparent_60%)]",
          variant === "ghost" ? "opacity-18" : "opacity-38"
        )}
      />

      {/* organic corner accent — very subtle, not flashy */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full",
            "opacity-70 blur-[0.2px]",
            // warm accent that doesn't shout
            "bg-[radial-gradient(circle,rgba(208,140,96,0.35),transparent_60%)]",
            "group-hover:opacity-90",
            "transition-opacity duration-200",
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
