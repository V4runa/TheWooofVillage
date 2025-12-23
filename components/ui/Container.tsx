import * as React from "react";
import clsx from "clsx";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "md" | "lg" | "xl";
};

export function Container({
  size = "xl",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      {...props}
      className={clsx(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "md" && "max-w-4xl",
        size === "lg" && "max-w-6xl",
        size === "xl" && "max-w-7xl",
        className
      )}
    />
  );
}
