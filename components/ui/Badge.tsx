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
    const sum = Array.from(String(text)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const corners = ["tr", "tl", "br", "bl"] as const;
    return corners[sum % corners.length];
  }, [cornerAccent, children, props]);

  /**
   * Badge visibility rules (esp. on photos):
   * - stronger backplate (but still elegant)
   * - crisp border + subtle outer contrast ring
   * - tiny text halo for legibility on busy images
   * - NO "lift" / translate (keeps it a label, not a control)
   */
  const base =
    "group relative inline-flex items-center rounded-full " +
    "px-3 py-1.5 text-xs font-extrabold leading-none " +
    "select-none whitespace-nowrap " +
    "border " +
    "ring-1 ring-inset ring-white/16 " +
    "transition-[background-color,border-color,opacity] duration-200 ease-out";

  // Micro sheen: “made” feel
  const microSheen =
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-full " +
    "before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.32),transparent_72%)] " +
    "before:opacity-60";

  // Photo legibility halo (NOT a control shadow)
  const halo =
    "shadow-[0_2px_10px_rgba(0,0,0,0.18)] " + // edge separation on photos
    "[text-shadow:0_1px_0_rgba(255,255,255,0.18),0_0_10px_rgba(0,0,0,0.14)]";

  // Outer contrast ring (helps on light fur + white highlights)
  const contrastRing = "ring-1 ring-black/6";

  const variants = {
    neutral: clsx(
      microSheen,
      halo,
      contrastRing,
      // warmer + more opaque = readable everywhere
      "bg-[rgba(255,248,240,0.86)]",
      "border-amber-950/22",
      "text-amber-950/82",
      "hover:bg-[rgba(255,248,240,0.90)] hover:border-amber-950/26"
    ),

    primary: clsx(
      microSheen,
      halo,
      contrastRing,
      // meadow + sky tint, still bright enough for photos
      "bg-[linear-gradient(90deg,rgba(63,161,126,0.28)_0%,rgba(96,140,255,0.16)_70%,rgba(255,248,240,0.86)_115%)]",
      "border-emerald-800/26",
      "text-amber-950/86",
      "hover:border-emerald-800/30"
    ),

    secondary: clsx(
      microSheen,
      halo,
      contrastRing,
      // warm accent (deposit/reserve vibes)
      "bg-[linear-gradient(90deg,rgba(255,176,122,0.34)_0%,rgba(255,206,160,0.18)_60%,rgba(255,248,240,0.86)_115%)]",
      "border-amber-800/28",
      "text-amber-950/86",
      "hover:border-amber-800/32"
    ),

    warning: clsx(
      microSheen,
      halo,
      contrastRing,
      "bg-[linear-gradient(90deg,rgba(255,192,113,0.36)_0%,rgba(255,248,240,0.88)_85%)]",
      "border-amber-700/28",
      "text-amber-950/86",
      "hover:border-amber-700/32"
    ),

    success: clsx(
      microSheen,
      halo,
      contrastRing,
      "bg-[linear-gradient(90deg,rgba(79,203,122,0.26)_0%,rgba(255,248,240,0.88)_90%)]",
      "border-emerald-700/26",
      "text-amber-950/86",
      "hover:border-emerald-700/30"
    ),
  } as const;

  return (
    <span {...props} className={clsx(base, variants[variant], className)}>
      {/* tiny corner sparkle — subtle, not clicky */}
      {corner !== "none" && (
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute h-2 w-2 rounded-full",
            "opacity-30 group-hover:opacity-45 transition-opacity duration-200",
            "bg-[radial-gradient(circle,rgba(255,255,255,0.70),rgba(96,140,255,0.14),rgba(255,176,122,0.14),transparent_72%)]",
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
