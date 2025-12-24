import * as React from "react";
import clsx from "clsx";

type BadgeVariant = "neutral" | "primary" | "secondary" | "warning" | "success";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  /**
   * Tiny boutique detail. Default is "auto" (deterministic by content),
   * set "none" to disable.
   */
  cornerAccent?: "auto" | "none" | "tl" | "tr" | "bl" | "br";
};

export function Badge({
  variant = "neutral",
  cornerAccent = "auto",
  className,
  children,
  ...props
}: BadgeProps) {
  const corner = React.useMemo(() => {
    if (cornerAccent === "none") return "none";
    if (cornerAccent !== "auto") return cornerAccent;

    const text =
      typeof children === "string" ? children : (props["aria-label"] ?? "");
    const sum = Array.from(String(text)).reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );
    const corners = ["tr", "tl", "br", "bl"] as const;
    return corners[sum % corners.length];
  }, [cornerAccent, children, props]);

  const base =
    "group relative inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold " +
    "transition-[box-shadow,background-color,border-color,opacity,transform] duration-200 ease-out " +
    "shadow-soft";

  const definition = "border border-black/5 ring-1 ring-black/5";

  const sheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-full " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.52),transparent_70%)] " +
    "before:opacity-35";

  // Palette-correct tints (no neon)
  const variants = {
    neutral: clsx(
      definition,
      sheen,
      "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.76),rgba(250,242,232,0.58))]",
      "text-ink-secondary",
      "hover:shadow-medium hover:border-black/8 hover:ring-black/8"
    ),

    primary: clsx(
      // use a *primary-tinted* ring instead of black ring + primary ring fighting
      "border border-primary/16 ring-1 ring-primary/14",
      sheen,
      "bg-[linear-gradient(to_right,rgba(127,175,155,0.22),rgba(127,175,155,0.10))]",
      "text-ink-primary",
      "hover:shadow-ambient hover:border-primary/22 hover:ring-primary/20"
    ),

    secondary: clsx(
      "border border-secondary/16 ring-1 ring-secondary/14",
      sheen,
      "bg-[linear-gradient(to_right,rgba(208,140,96,0.22),rgba(208,140,96,0.10))]",
      "text-ink-primary",
      "hover:shadow-ambient hover:border-secondary/22 hover:ring-secondary/20"
    ),

    warning: clsx(
      definition,
      sheen,
      "bg-[linear-gradient(to_right,rgba(230,215,184,0.70),rgba(230,215,184,0.44))]",
      "text-ink-primary",
      "hover:shadow-medium hover:border-black/8 hover:ring-black/8"
    ),

    success: clsx(
      definition,
      sheen,
      // muted sage success (not mint/bright)
      "bg-[linear-gradient(to_right,rgba(185,216,201,0.66),rgba(185,216,201,0.40))]",
      "text-ink-primary",
      "hover:shadow-medium hover:border-black/8 hover:ring-black/8"
    ),
  } as const;

  return (
    <span {...props} className={clsx(base, variants[variant], className)}>
      {/* subtle corner detail (tiny + organic, not always same corner) */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2 w-2 rounded-full",
            "opacity-60",
            // warm accent, very quiet
            "bg-[radial-gradient(circle,rgba(208,140,96,0.28),transparent_65%)]",
            "group-hover:opacity-80 transition-opacity duration-200",
            corner === "tr" && "right-1 top-1",
            corner === "tl" && "left-1 top-1",
            corner === "br" && "right-1 bottom-1",
            corner === "bl" && "left-1 bottom-1"
          )}
        />
      )}

      <span className="relative inline-flex items-center">{children}</span>
    </span>
  );
}
