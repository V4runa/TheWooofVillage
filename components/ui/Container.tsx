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
        "mx-auto w-full px-4 sm:px-6 lg:px-10",
        size === "md" && "max-w-4xl",
        size === "lg" && "max-w-6xl",
        // Wider, boutique landing feel (not SaaS column)
        size === "xl" && "max-w-[1400px] 2xl:max-w-[1600px]",
        className
      )}
    />
  );
}
