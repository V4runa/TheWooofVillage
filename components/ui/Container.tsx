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
        "mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-14",

        // Widths
        size === "md" && "max-w-4xl",
        size === "lg" && "max-w-6xl",

        // XL: use more width on desktop / 2xl
        size === "xl" &&
          "max-w-[min(1680px,96vw)] 2xl:max-w-[min(1840px,94vw)]",

        className
      )}
    />
  );
}
