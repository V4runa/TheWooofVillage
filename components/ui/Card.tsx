import * as React from "react";
import clsx from "clsx";

type CardVariant = "surface" | "elevated" | "ghost";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  cornerAccent?: "auto" | "none" | "tl" | "tr" | "bl" | "br";
  accentSeed?: string;
};

export function Card({
  variant = "surface",
  cornerAccent = "none",
  accentSeed,
  className,
  ...props
}: CardProps) {
  const base =
    "relative rounded-3xl text-ink-primary " +
    "transition-[transform,box-shadow,background-color,border-color,opacity] duration-200 ease-out";

  const variants = {
    surface: clsx(
      "bg-white/58 backdrop-blur-md",
      "border border-black/5",
      "shadow-soft"
    ),

    elevated: clsx(
      "bg-white/62 backdrop-blur-md",
      "border border-black/6",
      "shadow-medium",
      "hover:shadow-large",
      "hover:-translate-y-[1px]",
      "active:translate-y-0"
    ),

    ghost: "bg-transparent border-transparent shadow-none",
  } as const;

  const corner = React.useMemo(() => {
    if (cornerAccent === "none") return "none";
    if (cornerAccent !== "auto") return cornerAccent;

    const seed =
      accentSeed ||
      (typeof (props as any)["data-accent"] === "string"
        ? String((props as any)["data-accent"])
        : "") ||
      (typeof props.id === "string" ? props.id : "") ||
      (typeof className === "string" ? className : "");

    const sum = Array.from(String(seed)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const corners = ["tr", "tl", "br", "bl"] as const;
    return corners[sum % corners.length];
  }, [cornerAccent, accentSeed, props, className]);

  return (
    <div
      {...props}
      className={clsx(
        base,
        variant !== "ghost" && "overflow-hidden",
        variants[variant],
        className
      )}
    >
      {corner !== "none" && variant !== "ghost" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full opacity-40",
            "bg-[radial-gradient(circle,rgba(63,161,126,0.18),rgba(79,156,255,0.10),transparent_70%)]",
            corner === "tr" && "right-1.5 top-1.5",
            corner === "tl" && "left-1.5 top-1.5",
            corner === "br" && "right-1.5 bottom-1.5",
            corner === "bl" && "left-1.5 bottom-1.5"
          )}
        />
      ) : null}

      <div className="relative">{props.children}</div>
    </div>
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
