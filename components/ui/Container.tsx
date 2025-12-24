import * as React from "react";
import clsx from "clsx";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "md" | "lg" | "xl";
};

export function Container({ size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      {...props}
      className={clsx(
        // Center + predictable side padding
        // - tighter on phones
        // - comfortable on laptops
        // - generous on wide screens without feeling like “miles of air”
        "mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-12",

        // Widths
        size === "md" && "max-w-4xl",
        size === "lg" && "max-w-6xl",

        // XL: boutique landing feel with a smooth ramp (not a sudden jump)
        // Clamp prevents it from feeling too narrow at 1280–1440
        size === "xl" && "max-w-[min(1400px,94vw)] 2xl:max-w-[min(1600px,92vw)]",

        className
      )}
    />
  );
}
