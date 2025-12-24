import * as React from "react";
import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "surface" | "elevated" | "ghost";
};

export function Card({ variant = "surface", className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        // Base: softer contrast, warmer default surface, no pure white panels
        "rounded-3xl border text-text-primary",
        "backdrop-blur-sm",
        "transition-all duration-300 ease-out",

        // Variants
        variant === "surface" &&
          [
            // warm parchment glass with subtle texture
            "bg-[#F4EFE7]/80",
            "border-black/10",
            "shadow-soft",
            "backdrop-blur-md",
          ].join(" "),

        variant === "elevated" &&
          [
            // slightly brighter, still warm (NOT white) with enhanced depth
            "bg-[#F7F1EA]/85",
            "border-black/12",
            "shadow-medium",
            "backdrop-blur-md",
            "hover:shadow-large",
            "hover:-translate-y-1",
            "hover:border-black/16",
            "hover:bg-[#F7F1EA]/90",
          ].join(" "),

        variant === "ghost" && "bg-transparent border-transparent shadow-none",

        className
      )}
    />
  );
}

type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div {...props} className={clsx("p-6 pb-4", className)} />;
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div {...props} className={clsx("p-6 pt-0", className)} />;
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  return <div {...props} className={clsx("p-6 pt-4", className)} />;
}
