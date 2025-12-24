import * as React from "react";
import clsx from "clsx";

type BadgeVariant = "neutral" | "primary" | "secondary" | "warning" | "success";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold",
        "border shadow-soft",
        "transition-all duration-200 ease-out",

        // Neutral: paper-on-clay, not white
        variant === "neutral" &&
          [
            "bg-surface/85 text-ink-secondary border-black/12",
            "hover:bg-surface hover:border-black/16 hover:shadow-medium hover:-translate-y-px",
          ].join(" "),

        // Primary: soft green wash, still grounded
        variant === "primary" &&
          [
            "bg-linear-to-r from-primary/28 to-primary/15",
            "text-ink-primary border-primary/35",
            "hover:shadow-ambient hover:border-primary/45",
            "hover:-translate-y-px",
          ].join(" "),

        // Secondary: warm orange wash
        variant === "secondary" &&
          [
            "bg-linear-to-r from-secondary/28 to-secondary/15",
            "text-ink-primary border-secondary/35",
            "hover:shadow-ambient hover:border-secondary/45",
            "hover:-translate-y-px",
          ].join(" "),

        // Warning: warm sand (no bright yellow-white)
        variant === "warning" &&
          [
            "bg-linear-to-r from-[#e6d7b8]/70 to-[#e6d7b8]/40",
            "text-ink-primary border-black/14",
          ].join(" "),

        // Success: muted “sage” success (not mint-white)
        variant === "success" &&
          [
            "bg-linear-to-r from-[#b9d8c9]/70 to-[#b9d8c9]/40",
            "text-ink-primary border-black/14",
          ].join(" "),

        className
      )}
    />
  );
}
