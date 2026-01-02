"use client";

import * as React from "react";
import clsx from "clsx";

type ActionChipProps =
  | ({
      as?: "a";
      href: string;
      onClick?: never;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({
      as?: "button";
      onClick: () => void;
      href?: never;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>);

export function ActionChip({
  as,
  className,
  children,
  ...props
}: ActionChipProps & {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const left = (props as any).left as React.ReactNode;
  const right = (props as any).right as React.ReactNode;

  /**
   * ActionChip = “clickable row / list item”
   * - flatter than Buttons (less lift)
   * - clearer hover plate + outline
   * - warm, photo-safe surface
   * - NO backdrop blur (global film already exists)
   */
  const base = clsx(
    "group inline-flex w-full items-center justify-between gap-3",
    "rounded-2xl px-4 py-3",
    // baseline plate
    "bg-[rgba(255,240,225,0.56)]",
    "border border-amber-950/16",
    "ring-1 ring-inset ring-white/12",
    // accessibility + clarity
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,248,0.22)]",
    // motion
    "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
    // hover = “interactive” (slightly brighter + gentle glow + tiny lift)
    "hover:bg-[rgba(255,240,225,0.68)] hover:border-amber-950/22",
    "hover:shadow-[0_16px_34px_-20px_rgba(17,24,39,0.32)] hover:-translate-y-[1px]",
    // active = press
    "active:translate-y-[1px] active:shadow-[0_10px_24px_-18px_rgba(17,24,39,0.22)]",
    className
  );

  const inner = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        {left ? <span className="shrink-0">{left}</span> : null}
        <div className="min-w-0">{children}</div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </>
  );

  if ((as ?? "a") === "a") {
    const aProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    return (
      <a
        {...aProps}
        className={base}
        target={aProps.target ?? "_blank"}
        rel={aProps.rel ?? "noreferrer"}
      >
        {inner}
      </a>
    );
  }

  const bProps = props as React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onClick: () => void;
  };

  return (
    <button {...bProps} type={bProps.type ?? "button"} className={base}>
      {inner}
    </button>
  );
}

/**
 * Restored helper (backwards compatible):
 * Anything importing IconDot from ActionChip will work again.
 */
export function IconDot({
  children,
  toneClassName,
  className,
}: {
  children: React.ReactNode;
  toneClassName?: string;
  className?: string;
}) {
  /**
   * IconDot = “decorative icon plate”
   * - should NOT compete with IconButton
   * - but must stay visible on photos + busy sections
   */
  return (
    <span
      className={clsx(
        "relative grid h-9 w-9 shrink-0 place-items-center rounded-full",
        // richer plate (more readable on warm bg)
        "bg-[rgba(255,252,248,0.72)]",
        "border border-amber-950/18",
        "ring-1 ring-inset ring-white/18",
        "shadow-[0_12px_28px_-22px_rgba(17,24,39,0.36)]",
        // icon tone
        "text-amber-950/80",
        toneClassName,
        className
      )}
    >
      {/* micro sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.65),transparent_70%)] opacity-55"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
