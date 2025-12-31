"use client";

import * as React from "react";
import { useMemo } from "react";
import { Copy, ExternalLink, CircleDollarSign } from "lucide-react";
import { SiVenmo, SiCashapp, SiPaypal } from "react-icons/si";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActionChip, IconDot } from "@/components/landing/ActionChip";
import type { MerchantProfile } from "@/types/merchant";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function PaymentPanel({
  profile,
  onToast,
}: {
  profile: MerchantProfile | null;
  onToast: (msg: string) => void;
}) {
  const paymentLinks = useMemo(() => {
    return [
      profile?.venmo_url
        ? { key: "venmo", label: "Venmo", href: profile.venmo_url, Icon: SiVenmo, tone: "text-[#3D95CE]" }
        : null,
      profile?.cashapp_url
        ? { key: "cashapp", label: "Cash App", href: profile.cashapp_url, Icon: SiCashapp, tone: "text-[#00D632]" }
        : null,
      profile?.paypal_url
        ? { key: "paypal", label: "PayPal", href: profile.paypal_url, Icon: SiPaypal, tone: "text-[#003087]" }
        : null,
      profile?.zelle_recipient
        ? { key: "zelle", label: "Zelle", value: profile.zelle_recipient, tone: "text-sky-700" }
        : null,
    ].filter(Boolean) as Array<
      | { key: string; label: string; href: string; Icon: React.ComponentType<{ size?: number }>; tone: string }
      | { key: string; label: string; value: string; tone: string }
    >;
  }, [profile?.venmo_url, profile?.cashapp_url, profile?.paypal_url, profile?.zelle_recipient]);

  return (
    <Card
      variant="elevated"
      className="rounded-3xl bg-surface-light/75 backdrop-blur-md ring-1 ring-line/10 border border-black/5 shadow-medium"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
              Deposit & Payment
            </div>
            <p className="mt-1 text-sm text-ink-secondary">
              Pay deposit to reserve. Then{" "}
              <span className="font-extrabold text-ink-primary">text/call</span>{" "}
              to confirm.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-ink-muted">
            <CircleDollarSign size={18} />
            <span className="text-xs font-bold">Direct to owner</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {paymentLinks.length === 0 ? (
            <div className="text-sm text-ink-secondary opacity-80">
              Payment links not set yet.
            </div>
          ) : (
            paymentLinks.map((p) => {
              if ("href" in p) {
                const Icon = p.Icon;
                return (
                  <ActionChip
                    key={p.key}
                    left={
                      <IconDot toneClassName={p.tone}>
                        <Icon size={18} />
                      </IconDot>
                    }
                    children={p.label}
                    href={p.href}
                    right={
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-secondary underline">
                        Open <ExternalLink size={14} />
                      </span>
                    }
                  />
                );
              }

              return (
                <ActionChip
                  key={p.key}
                  left={
                    <IconDot toneClassName={p.tone}>
                      <span className="text-xs font-black">Z</span>
                    </IconDot>
                  }
                  children="Zelle"
                  right={
                    <Button
                      size="sm"
                      className="h-9 px-3 text-xs gap-2"
                      onClick={async () => {
                        const ok = await copyToClipboard(p.value);
                        onToast(ok ? "Zelle recipient copied." : "Couldn’t copy.");
                      }}
                    >
                      <Copy size={14} />
                      Copy
                    </Button>
                  }
                  onClick={() => {}}
                />
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
