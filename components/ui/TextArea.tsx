"use client";

import * as React from "react";
import clsx from "clsx";

type TextareaVariant = "glass" | "ghost";
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: TextareaVariant;
  decor?: "dot" | "notch" | "none";
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = "glass", decor = "dot", className, disabled, ...props }, ref) => {
    return (
      <div className={clsx("relative w-full", disabled && "opacity-60")}>
        {decor !== "none" && variant !== "ghost" && (
          <span
            aria-hidden="true"
            className={clsx(
              "pointer-events-none absolute -right-1 -top-1 z-10",
              decor === "dot" &&
                "h-4 w-4 rounded-full bg-[linear-gradient(to_br,rgba(208,140,96,0.35),rgba(127,175,155,0.22))] blur-[0.2px]",
              decor === "notch" &&
                "h-4 w-4 rounded-[6px] rotate-12 bg-[linear-gradient(to_br,rgba(127,175,155,0.24),rgba(0,0,0,0.03))]"
            )}
          />
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          {...props}
          className={clsx(
            "w-full rounded-2xl px-5 py-4",
            "text-base text-ink-primary placeholder:text-ink-muted/80",
            "transition-[box-shadow,border-color,background-color] duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-white/10",
            "disabled:cursor-not-allowed",
            "min-h-[120px] resize-y",

            variant === "glass" &&
              [
                "border border-black/5 ring-1 ring-black/5",
                "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.70),rgba(250,242,232,0.55))]",
                "backdrop-blur-md shadow-soft",
                "hover:shadow-medium hover:border-black/8 hover:ring-black/8",
              ].join(" "),

            variant === "ghost" &&
              [
                "border border-transparent ring-0 shadow-none",
                "bg-transparent",
                "hover:bg-white/14",
                "focus-visible:bg-white/14",
              ].join(" "),

            className
          )}
        />

        {variant !== "ghost" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45),transparent_60%)] opacity-55"
          />
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
