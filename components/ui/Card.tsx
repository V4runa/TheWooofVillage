import * as React from "react";
import clsx from "clsx";

type CardVariant = "surface" | "elevated" | "ghost";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;

  /**
   * Tiny boutique corner detail. Default "auto" (deterministic by data-accent/id).
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
    "relative rounded-3xl text-text-primary " +
    "backdrop-blur-md " +
    "transition-[transform,box-shadow,background-color,border-color,opacity] duration-300 ease-out";

  // Softer definition everywhere, but we’ll vary strength per variant.
  const definition = "border border-black/5 ring-1 ring-black/5";

  // Top sheen, but lighter + less “template”
  const topSheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.50),transparent_58%)] " +
    "before:opacity-55";

  // A gentle vignette to calm borders + reduce harsh contrast around edges
  const vignette =
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl " +
    "after:bg-[radial-gradient(1200px_700px_at_50%_25%,transparent_55%,rgba(0,0,0,0.06)_100%)] " +
    "after:opacity-70";

  const variants = {
    surface: clsx(
      definition,
      topSheen,
      vignette,
      "bg-[linear-gradient(to_bottom,rgba(255,250,242,0.82),rgba(250,242,232,0.72))]",
      "shadow-soft"
    ),

    elevated: clsx(
      // slightly stronger definition so it reads “hero container”
      "border border-black/6 ring-1 ring-black/6",
      topSheen,
      vignette,
      "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.86),rgba(251,244,234,0.76))]",
      "shadow-medium",

      // Hover: less “lift”, more “clarity + depth”
      "hover:shadow-large",
      "hover:border-black/8 hover:ring-black/8",
      "hover:bg-[linear-gradient(to_bottom,rgba(255,252,246,0.90),rgba(252,246,238,0.80))]"
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

    const sum = Array.from(String(seed)).reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );

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
      {/* micro corner accent — subtle, organic, not always same spot */}
      {corner !== "none" && variant !== "ghost" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2.5 w-2.5 rounded-full",
            "opacity-45",
            "bg-[radial-gradient(circle,rgba(208,140,96,0.22),transparent_66%)]",

            // placement
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
