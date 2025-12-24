"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, HeartHandshake, PawPrint, ShieldCheck } from "lucide-react";
import {
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiVenmo,
  SiCashapp,
} from "react-icons/si";

import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { IconButton } from "@/components/ui/IconButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type LinkItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  Icon: React.ComponentType<{ size?: number }>;
};

type LandingHeaderProps = {
  browseHref?: string;
  howItWorksHref?: string;
};

export function LandingHeader({
  browseHref = "#",
  howItWorksHref = "/#how-it-works",
}: LandingHeaderProps) {
  const { profile, loading, error } = useMerchantProfile();
  const [toast, setToast] = useState<string | null>(null);

  const links: LinkItem[] = useMemo(() => {
    if (!profile) return [];
    const items: LinkItem[] = [];

    if (profile.instagram_url) {
      items.push({
        key: "instagram",
        label: "Instagram",
        href: profile.instagram_url,
        Icon: SiInstagram,
      });
    }
    if (profile.facebook_url) {
      items.push({
        key: "facebook",
        label: "Facebook",
        href: profile.facebook_url,
        Icon: SiFacebook,
      });
    }
    if (profile.tiktok_url) {
      items.push({
        key: "tiktok",
        label: "TikTok",
        href: profile.tiktok_url,
        Icon: SiTiktok,
      });
    }
    if (profile.venmo_url) {
      items.push({
        key: "venmo",
        label: "Venmo",
        href: profile.venmo_url,
        Icon: SiVenmo,
      });
    }
    if (profile.cashapp_url) {
      items.push({
        key: "cashapp",
        label: "Cash App",
        href: profile.cashapp_url,
        Icon: SiCashapp,
      });
    }

    if (profile.zelle_recipient) {
      items.push({
        key: "zelle",
        label: "Copy Zelle recipient",
        Icon: Banknote,
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(profile.zelle_recipient!);
            setToast("Zelle recipient copied.");
            window.setTimeout(() => setToast(null), 2200);
          } catch {
            setToast("Could not copy. Please copy manually.");
            window.setTimeout(() => setToast(null), 2200);
          }
        },
      });
    }

    return items;
  }, [profile]);

  const displayName = useMemo(() => {
    if (loading) return "Loading…";
    if (!loading && profile?.display_name) return profile.display_name;
    return "WoofVillage";
  }, [loading, profile]);

  const tagline = profile?.tagline ?? "Screening-first rehoming. Clear listings. Calm meetups.";
  const statusLine = loading ? "Loading profile…" : "Updated often • Replies usually fast";

  return (
    <header className="w-full animate-fade-in">
      {/* Top: Brand + CTAs */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Brand block */}
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <BrandMark />

            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
                {displayName}
              </h1>

              <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-ink-secondary sm:text-lg">
                {tagline}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                <span
                  className={cls(
                    "relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5",
                    "border border-black/5 ring-1 ring-black/5",
                    "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.70),rgba(250,242,232,0.55))]",
                    "shadow-soft backdrop-blur-md",
                    "hover:shadow-medium hover:border-black/8 hover:ring-black/8"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-gentle-pulse" />
                  {statusLine}
                </span>
              </div>

              {/* Trust cues */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Badge variant="neutral" className="gap-1.5">
                  <ShieldCheck size={14} />
                  Clear info
                </Badge>
                <Badge variant="neutral" className="gap-1.5">
                  <HeartHandshake size={14} />
                  Screening-first
                </Badge>
                <Badge variant="neutral" className="gap-1.5">
                  <PawPrint size={14} />
                  Long-term fit
                </Badge>
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions + socials */}
        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={browseHref} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                className="w-full rounded-full sm:w-auto"
              >
                Browse pups
              </Button>
            </Link>

            <Link href={howItWorksHref} className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                className="w-full rounded-full sm:w-auto"
              >
                How it works
              </Button>
            </Link>
          </div>

          {/* Social/Payment tray (intentional + quiet) */}
          {links.length > 0 ? (
            <div
              className={cls(
                "relative flex flex-wrap items-center justify-end gap-2.5",
                "rounded-3xl px-3 py-3",
                "border border-black/5 ring-1 ring-black/5",
                "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.55),rgba(250,242,232,0.40))]",
                "shadow-soft backdrop-blur-md",
                "opacity-95 transition-opacity hover:opacity-100"
              )}
            >
              {/* ONE small accent, different corner than other panels */}
              <CornerAccent position="bottom-left" rotate="7" emoji="🐾" />

              {links.map(({ key, label, href, onClick, Icon }) =>
                href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex"
                  >
                    <IconButton label={label}>
                      <Icon size={18} />
                    </IconButton>
                  </a>
                ) : (
                  <IconButton key={key} label={label} onClick={onClick}>
                    <Icon size={18} />
                  </IconButton>
                )
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* "Browse vibes" row */}
      <div
        className={cls(
          "relative mt-8 rounded-3xl p-5",
          "border border-black/5 ring-1 ring-black/5",
          "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.62),rgba(250,242,232,0.46))]",
          "shadow-soft backdrop-blur-md",
          "hover:shadow-medium hover:border-black/8 hover:ring-black/8"
        )}
      >
        {/* ONE small accent, different corner than tray */}
        <CornerAccent position="bottom-left" rotate="-6" emoji="🐕" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            browse vibes
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Chip>🐾 Puppies</Chip>
            <Chip>🏡 Family-friendly</Chip>
            <Chip>🧸 Cuddle bugs</Chip>
            <Chip>⚡ High energy</Chip>
            <Chip>🧘 Calm + gentle</Chip>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={cls(
            "mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium",
            "border border-black/5 ring-1 ring-black/5",
            "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.70),rgba(250,242,232,0.55))]",
            "text-ink-primary shadow-medium backdrop-blur-md"
          )}
        >
          <span className="text-base">✅</span>
          <span>{toast}</span>
        </div>
      )}
    </header>
  );
}

function BrandMark() {
  return (
    <div
      className={cls(
        "relative grid h-16 w-16 shrink-0 place-items-center rounded-3xl",
        "border border-black/5 ring-1 ring-black/5",
        "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.70),rgba(250,242,232,0.55))]",
        "shadow-soft backdrop-blur-md",
        "hover:shadow-medium hover:border-black/8 hover:ring-black/8"
      )}
    >
      <div
        className={cls(
          "relative grid h-14 w-14 place-items-center rounded-3xl",
          "bg-[linear-gradient(to_br,#2f2a26,#3a3430)]",
          "text-[#f6f1ea] shadow-medium"
        )}
      >
        <span className="text-3xl leading-none">🐶</span>
      </div>

      {/* small heart accent (keep this one; it’s the brand signature) */}
      <div
        className={cls(
          "absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full",
          "bg-[linear-gradient(to_br,rgba(208,140,96,0.90),rgba(181,90,58,0.90))]",
          "text-white text-xs font-semibold shadow-soft"
        )}
      >
        ❤
      </div>
    </div>
  );
}

function Chip({
  children,
}: {
  children: React.ComponentProps<"button">["children"];
}) {
  return (
    <button
      type="button"
      className={cls(
        "relative inline-flex items-center rounded-full px-4 py-2 text-xs font-medium",
        "border border-black/5 ring-1 ring-black/5",
        "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.60),rgba(250,242,232,0.44))]",
        "shadow-soft backdrop-blur-md",
        "hover:shadow-medium hover:border-black/8 hover:ring-black/8",
        "active:opacity-[0.98]"
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_70%)] opacity-35"
      />
      <span className="relative">{children}</span>
    </button>
  );
}

/**
 * Small, single-purpose accent.
 * One per container max. Emoji only. Different corners so it feels organic.
 */
function CornerAccent({
  position,
  rotate,
  emoji,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  rotate: string; // "-6", "7"
  emoji: string;
}) {
  const pos =
    position === "top-left"
      ? "left-[-10px] top-[-10px]"
      : position === "top-right"
      ? "right-[-10px] top-[-10px]"
      : position === "bottom-left"
      ? "left-[-10px] bottom-[-10px]"
      : "right-[-10px] bottom-[-10px]";

  return (
    <span
      aria-hidden="true"
      className={cls(
        "pointer-events-none absolute grid h-9 w-9 place-items-center rounded-2xl",
        "bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f6f1ea]",
        "shadow-medium opacity-85",
        pos,
        `rotate-[${rotate}deg]`
      )}
    >
      <span className="text-sm">{emoji}</span>
    </span>
  );
}

/**
 * Tiny helper to keep class strings readable without adding a dependency.
 */
function cls(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}
