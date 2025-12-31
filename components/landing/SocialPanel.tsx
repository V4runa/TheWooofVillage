"use client";

import * as React from "react";
import { useMemo } from "react";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import { Card } from "@/components/ui/Card";
import { ActionChip, IconDot } from "@/components/landing/ActionChip";
import type { MerchantProfile } from "@/types/merchant";

export function SocialPanel({ profile }: { profile: MerchantProfile | null }) {
  const socials = useMemo(() => {
    return [
      profile?.instagram_url
        ? { key: "instagram", label: "Instagram", href: profile.instagram_url, Icon: SiInstagram, tone: "text-[#E1306C]" }
        : null,
      profile?.facebook_url
        ? { key: "facebook", label: "Facebook", href: profile.facebook_url, Icon: SiFacebook, tone: "text-[#1877F2]" }
        : null,
      profile?.tiktok_url
        ? { key: "tiktok", label: "TikTok", href: profile.tiktok_url, Icon: SiTiktok, tone: "text-black" }
        : null,
    ].filter(Boolean) as Array<{
      key: string;
      label: string;
      href: string;
      Icon: React.ComponentType<{ size?: number }>;
      tone: string;
    }>;
  }, [profile?.instagram_url, profile?.facebook_url, profile?.tiktok_url]);

  if (socials.length === 0) return null;

  return (
    <Card
      variant="elevated"
      className="rounded-3xl bg-surface-light/75 backdrop-blur-md ring-1 ring-line/10 border border-black/5 shadow-medium"
    >
      <div className="p-4 sm:p-5">
        <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
          Social
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {socials.map(({ key, label, href, Icon, tone }) => (
            <ActionChip
              key={key}
              href={href}
              left={
                <IconDot toneClassName={tone}>
                  <Icon size={18} />
                </IconDot>
              }
              children={label}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
