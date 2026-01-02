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

  /**
   * Warm indoor tuning:
   * - reduce “white lift” so cards don’t feel washed
   * - add edge clarity via inner stroke (not brighter fill)
   * - add a tiny bottom vignette to preserve contrast while staying airy
   * - avoid backdrop-blur (global film already handles atmosphere)
   */
  const variants = {
    surface: clsx(
      // slightly deeper + warmer than before (less washed)
      "bg-[rgba(255,246,238,0.72)]",
      // warm border (no harsh gray)
      "border border-amber-950/14",
      // tighter, cleaner shadow
      "shadow-[0_12px_34px_-22px_rgba(17,24,39,0.34)]"
    ),

    elevated: clsx(
      // a touch brighter than surface, still warm
      "bg-[rgba(255,248,242,0.78)]",
      "border border-amber-950/16",
      "shadow-[0_18px_52px_-26px_rgba(17,24,39,0.40)]",
      "hover:shadow-[0_26px_74px_-32px_rgba(17,24,39,0.46)]",
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
      {/* Inner stroke (edge clarity) — prevents “muddled wash” without brightening */}
      {variant !== "ghost" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-3xl",
            "ring-1 ring-inset ring-white/12"
          )}
        />
      ) : null}

      {/* Top sheen — very controlled (more on elevated, minimal on surface) */}
      {variant !== "ghost" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-0",
            variant === "elevated" ? "opacity-55" : "opacity-30",
            "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),transparent_62%)]"
          )}
        />
      ) : null}

      {/* Bottom vignette — adds contrast so content doesn’t feel washed */}
      {variant !== "ghost" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute inset-0 opacity-45",
            "bg-[radial-gradient(1200px_520px_at_50%_120%,rgba(17,24,39,0.14),transparent_62%)]"
          )}
        />
      ) : null}

      {/* Tiny corner accent (warm + subtle) */}
      {corner !== "none" && variant !== "ghost" ? (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full opacity-28",
            "bg-[radial-gradient(circle,rgba(255,206,160,0.22),rgba(96,140,255,0.10),transparent_72%)]",
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
