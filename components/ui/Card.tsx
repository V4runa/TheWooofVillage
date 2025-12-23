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
        // Base: make text readable by default and increase border contrast slightly
        "rounded-2xl border text-gray-900 transition-shadow",

        // Variants
        variant === "surface" && "bg-white border-black/10",
        variant === "elevated" &&
          "bg-white border-black/10 shadow-sm hover:shadow-md",
        variant === "ghost" && "bg-transparent border-transparent",

        className
      )}
    />
  );
}

type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div {...props} className={clsx("p-5 pb-3", className)} />;
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div {...props} className={clsx("p-5 pt-0", className)} />;
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  return <div {...props} className={clsx("p-5 pt-3", className)} />;
}
