"use client";

import * as React from "react";
import { Phone, MessageCircle, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ContactPanel({
  phone,
  onToast,
  compact = false,
}: {
  phone: string | null;
  onToast: (msg: string) => void;
  compact?: boolean;
}) {
  const telHref = phone ? `tel:${phone}` : undefined;
  const smsHref = phone ? `sms:${phone}` : undefined;

  return (
    <Card
      variant="elevated"
      className={[
        "bg-surface-light/80 backdrop-blur-sm ring-1 ring-line/12 border border-black/5 shadow-medium",
        compact ? "rounded-3xl" : "rounded-3xl",
      ].join(" ")}
    >
      <div className={compact ? "p-4" : "p-4 sm:p-5"}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-ink-muted">
              Contact
            </div>

            {/* Contrast fix: primary/90 instead of secondary */}
            <div className="mt-1 text-[15px] leading-snug text-ink-primary/90">
              Text is fastest. Call if needed.
            </div>

            {phone ? (
              <div className="mt-2 text-sm font-extrabold text-ink-primary">
                {phone}
              </div>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/70 px-3 py-1 text-xs font-extrabold text-ink-primary ring-1 ring-line/10">
            💬 Quick confirm
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a href={smsHref} className={!phone ? "pointer-events-none opacity-50" : ""}>
            <Button className="w-full gap-2" size="sm">
              <MessageCircle size={18} />
              Text
            </Button>
          </a>

          <a href={telHref} className={!phone ? "pointer-events-none opacity-50" : ""}>
            <Button variant="secondary" className="w-full gap-2" size="sm">
              <Phone size={18} />
              Call
            </Button>
          </a>
        </div>

        {phone ? (
          <div className="mt-3">
            <Button
              variant="ghost"
              className="gap-2"
              size="sm"
              onClick={async () => {
                const ok = await copyToClipboard(phone);
                onToast(ok ? "Phone number copied." : "Couldn’t copy.");
              }}
            >
              <Copy size={14} />
              Copy phone
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
