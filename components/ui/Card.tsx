import * as React from "react";
import clsx from "clsx";

type CardVariant = "surface" | "elevated" | "ghost";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;

  /**
   * Tiny corner detail. Default "auto" (deterministic by data-accent/id).
   * Set "none" to disable.
   */
  cornerAccent?: "auto" | "none" | "tl" | "tr" | "bl" | "br";

  /**
   * Optional seed for deterministic corner selection (useful for lists).
   * If not provided, we try data-accent, then id, then className.
   */
  accentSeed?: string;
};

export function Card({
  variant = "surface",
  cornerAccent = "auto",
  accentSeed,
  className,
  ...props
}: CardProps) {
  const base =
    "relative rounded-3xl text-ink-primary " +
    "transition-[transform,box-shadow,background-color,border-color,opacity] duration-200 ease-out";

  // Photo-friendly definition: soft line + subtle ring
  const definition = "border border-line/10 ring-1 ring-line/10";

  // Gentle top sheen (keeps it premium on bright photos)
  const topSheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.70),transparent_60%)] " +
    "before:opacity-60";

  // Edge quieting (NOT a dark vignette — just calms outlines)
  const edgeSoftener =
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl " +
    "after:bg-[radial-gradient(1200px_700px_at_50%_15%,rgba(255,255,255,0.65)_0%,transparent_55%,rgba(0,0,0,0.035)_100%)] " +
    "after:opacity-70";

  const variants = {
    surface: clsx(
      definition,
      topSheen,
      edgeSoftener,
      // clean glassy white (works over photo)
      "bg-white/72 backdrop-blur-md",
      "shadow-soft"
    ),

    elevated: clsx(
      "border border-line/12 ring-1 ring-line/12",
      topSheen,
      edgeSoftener,
      "bg-white/78 backdrop-blur-md",
      "shadow-medium",
      "hover:shadow-large hover:-translate-y-[1px]",
      "hover:border-line/18 hover:ring-line/18",
      "active:translate-y-0"
    ),

    ghost: "bg-transparent border-transparent ring-0 shadow-none",
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
      {/* micro corner accent — moved to brand (sky/meadow), not warm brown */}
      {corner !== "none" && variant !== "ghost" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full",
            "opacity-60",
            // small “alive” sparkle: meadow->sky, very subtle
            "bg-[radial-gradient(circle,rgba(63,161,126,0.22),rgba(79,156,255,0.12),transparent_70%)]",
            corner === "tr" && "right-1.5 top-1.5",
            corner === "tl" && "left-1.5 top-1.5",
            corner === "br" && "right-1.5 bottom-1.5",
            corner === "bl" && "left-1.5 bottom-1.5"
          )}
        />
      )}

      {/* content wrapper so pseudo-elements don’t mess with stacking */}
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
