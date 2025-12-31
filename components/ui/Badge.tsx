import * as React from "react";
import clsx from "clsx";

type BadgeVariant = "neutral" | "primary" | "secondary" | "warning" | "success";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  /**
   * Tiny detail. Default is "auto" (deterministic by content),
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
    "select-none " +
    "transition-[box-shadow,background-color,border-color,opacity,transform] duration-200 ease-out";

  // Photo-friendly definition (uses theme token line)
  const definition = "border border-line/10 ring-1 ring-line/10";

  // Micro sheen (keeps pills feeling “made”)
  const sheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-full " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_70%)] " +
    "before:opacity-55";

  const variants = {
    neutral: clsx(
      definition,
      sheen,
      "bg-white/70 backdrop-blur-md",
      "text-ink-secondary",
      "shadow-soft",
      "hover:shadow-medium hover:border-line/16 hover:ring-line/14"
    ),

    primary: clsx(
      // meadow + sky tint; still readable on photos
      "border border-primary/18 ring-1 ring-primary/14",
      sheen,
      "bg-[linear-gradient(90deg,rgba(63,161,126,0.18)_0%,rgba(79,156,255,0.12)_70%,rgba(255,255,255,0.55)_115%)]",
      "text-ink-primary",
      "shadow-soft",
      "hover:shadow-ambient hover:border-primary/26 hover:ring-primary/20"
    ),

    secondary: clsx(
      // sun tint
      "border border-secondary/18 ring-1 ring-secondary/14",
      sheen,
      "bg-[linear-gradient(90deg,rgba(255,141,74,0.18)_0%,rgba(255,141,74,0.10)_60%,rgba(255,255,255,0.55)_115%)]",
      "text-ink-primary",
      "shadow-soft",
      "hover:shadow-ambient hover:border-secondary/26 hover:ring-secondary/20"
    ),

    warning: clsx(
      // warm but not beige; uses sun palette lightly
      "border border-sun-400/18 ring-1 ring-sun-400/12",
      sheen,
      "bg-[linear-gradient(90deg,rgba(255,192,113,0.20)_0%,rgba(255,246,232,0.70)_85%)]",
      "text-ink-primary",
      "shadow-soft",
      "hover:shadow-ambient hover:border-sun-400/26 hover:ring-sun-400/18"
    ),

    success: clsx(
      "border border-meadow-400/18 ring-1 ring-meadow-400/12",
      sheen,
      "bg-[linear-gradient(90deg,rgba(79,203,122,0.16)_0%,rgba(241,251,244,0.72)_90%)]",
      "text-ink-primary",
      "shadow-soft",
      "hover:shadow-ambient hover:border-meadow-400/26 hover:ring-meadow-400/18"
    ),
  } as const;

  return (
    <span {...props} className={clsx(base, variants[variant], className)}>
      {/* tiny corner sparkle — brand (no brown) */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2 w-2 rounded-full",
            "opacity-60 group-hover:opacity-85 transition-opacity duration-200",
            "bg-[radial-gradient(circle,rgba(255,255,255,0.70),rgba(79,156,255,0.18),rgba(63,161,126,0.14),transparent_72%)]",
            corner === "tr" && "right-1 top-1",
            corner === "tl" && "left-1 top-1",
            corner === "br" && "right-1 bottom-1",
            corner === "bl" && "left-1 bottom-1"
          )}
        />
      )}

      <span className="relative inline-flex items-center gap-1">{children}</span>
    </span>
  );
}
