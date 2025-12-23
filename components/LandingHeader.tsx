"use client";

import React, { useMemo, useState } from "react";
import { Banknote } from "lucide-react";
import {
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiVenmo,
  SiCashapp,
} from "react-icons/si";

import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { IconButton } from "@/components/ui/IconButton";

type LinkItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  Icon: React.ComponentType<{ size?: number }>;
};

export function LandingHeader() {
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

  return (
    <header className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {loading && "Loading…"}
            {!loading && profile?.display_name}
            {!loading && !profile && "WoofVillage"}
          </h1>

          {profile?.tagline && (
            <p className="mt-1 text-sm text-black/60">{profile.tagline}</p>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {links.map(({ key, label, href, onClick, Icon }) =>
            href ? (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
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
      </div>

      {toast && (
        <div className="mt-3 inline-flex rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm shadow-sm">
          {toast}
        </div>
      )}
    </header>
  );
}
