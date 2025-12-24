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
            setToast("Zelle recipient copied!");
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

  const tagline = profile?.tagline ?? "Meet your next best friend — safely.";
  const statusLine = "Pups posted often • Replies usually fast";

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

              <p className="mt-3 text-base leading-relaxed text-ink-secondary sm:text-lg">
                {tagline}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                <span
                  className={cls(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-soft",
                    "border border-black/10 bg-surface/75",
                    "transition-all hover:shadow-medium hover:-translate-y-px hover:bg-surface/85"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-gentle-pulse" />
                  {statusLine}
                </span>
              </div>

              {/* Trust cues */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Badge variant="neutral" className="gap-1.5 transition-all hover:scale-105">
                  <ShieldCheck size={14} />
                  Clear info
                </Badge>
                <Badge variant="neutral" className="gap-1.5 transition-all hover:scale-105">
                  <HeartHandshake size={14} />
                  Screening-first
                </Badge>
                <Badge variant="neutral" className="gap-1.5 transition-all hover:scale-105">
                  <PawPrint size={14} />
                  Long-term match
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
                Browse the pack
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

          {/* Social/Payment icons (secondary, visually quieter) */}
          {links.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2.5 opacity-85 transition-opacity hover:opacity-100">
              {links.map(({ key, label, href, onClick, Icon }) =>
                href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="transition-transform hover:scale-110"
                  >
                    <IconButton label={label}>
                      <Icon size={18} />
                    </IconButton>
                  </a>
                ) : (
                  <IconButton key={key} label={label} onClick={onClick} className="transition-transform hover:scale-110">
                    <Icon size={18} />
                  </IconButton>
                )
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* "Browse vibes" row */}
      <div className="mt-8 rounded-3xl border border-black/10 bg-surface/60 p-5 shadow-soft transition-all hover:shadow-medium hover:bg-surface/70">
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
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-surface/75 px-4 py-2 text-sm font-medium text-ink-primary shadow-medium">
          <span className="text-base">✅</span>
          <span>{toast}</span>
        </div>
      )}
    </header>
  );
}

function BrandMark() {
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-3xl border border-black/10 bg-surface/75 shadow-soft transition-all hover:shadow-medium hover:scale-105">
      <div className="grid h-14 w-14 place-items-center rounded-3xl bg-linear-to-br from-[#2f2a26] to-[#3a3430] text-[#f4efe8] shadow-medium transition-transform hover:scale-110">
        <span className="text-3xl leading-none transition-transform hover:rotate-12">🐶</span>
      </div>

      {/* small "heart" accent */}
      <div className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-secondary/85 to-secondary-500 text-white text-xs font-semibold shadow-soft transition-transform hover:scale-105">
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
      className={[
        "inline-flex items-center rounded-full px-4 py-2 text-xs font-medium",
        "border border-black/10 bg-surface/75 shadow-soft",
        "hover:shadow-medium hover:-translate-y-0.5 hover:bg-surface/90 hover:border-black/14 hover:scale-105",
        "active:translate-y-0 active:scale-100",
        "transition-all",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * Tiny helper to keep class strings readable without adding a dependency.
 */
function cls(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}
