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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        "border",
        variant === "neutral" && "bg-black/5 text-black/80 border-black/10",
        variant === "primary" && "bg-primary/15 text-black border-primary/30",
        variant === "secondary" &&
          "bg-secondary/15 text-black border-secondary/30",
        variant === "warning" && "bg-amber-100 text-amber-900 border-amber-200",
        variant === "success" && "bg-emerald-100 text-emerald-900 border-emerald-200",
        className
      )}
    />
  );
}
