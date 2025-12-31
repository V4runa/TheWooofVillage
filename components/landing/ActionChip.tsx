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

  const base = clsx(
    "group inline-flex w-full items-center justify-between gap-3",
    "rounded-2xl px-4 py-3",
    "bg-white/75 backdrop-blur-md",
    "border border-black/5 ring-1 ring-black/5",
    "shadow-soft",
    "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
    "hover:-translate-y-[1px] hover:shadow-medium hover:border-black/8 hover:ring-black/8",
    "active:translate-y-0 active:shadow-soft",
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
  return (
    <span
      className={clsx(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full",
        "bg-white/70 backdrop-blur-md",
        "border border-black/5 ring-1 ring-black/5",
        "shadow-soft",
        toneClassName,
        className
      )}
    >
      {children}
    </span>
  );
}
