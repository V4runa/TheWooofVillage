import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function HeroExperience() {
  return (
    <section className="relative mt-12 sm:mt-16 animate-fade-in">
      {/* gentle visual separation from header */}
      <div className="pointer-events-none absolute left-0 right-0 -top-6 h-px bg-linear-to-r from-transparent via-black/10 to-transparent" />

      {/* soft local atmosphere (warm, boutique, non-saas) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -right-28 h-72 w-72 rounded-full bg-primary/18 blur-3xl animate-gentle-pulse" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-secondary/18 blur-3xl animate-gentle-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute left-10 top-12 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        {/* Copy block */}
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">screening-first</Badge>
            <Badge variant="secondary">safe rehoming</Badge>
            <Badge variant="neutral">clear info</Badge>
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl lg:text-5xl">
            Meet your next best friend.
          </h2>

          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-secondary sm:text-lg">
            Not a random social post. A warm, intentional place to find a pup you'll
            love for years — with clarity, care, and a process designed to protect everyone.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/dogs" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full rounded-full sm:w-auto"
              >
                Browse the pack
              </Button>
            </Link>

            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                className="w-full rounded-full sm:w-auto"
              >
                How it works
              </Button>
            </Link>
          </div>

          {/* Promises */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MiniPromise
              title="No surprises"
              body="We post the details that matter."
              emoji="✅"
            />
            <MiniPromise
              title="No pressure"
              body="Ask questions. We'll guide you."
              emoji="💛"
            />
            <MiniPromise
              title="Real match"
              body="We care about fit, not speed."
              emoji="🤝"
            />
          </div>
        </div>

        {/* Personality cluster */}
        <div className="hidden lg:col-span-4 lg:block">
          <div className="relative mx-auto h-52 w-52">
            <Sticker
              className="absolute left-0 top-0 -rotate-8 transition-transform hover:scale-105 hover:-rotate-6"
              text="best friends"
              emoji="🐶"
              tone="primary"
            />
            <Sticker
              className="absolute right-0 top-10 rotate-10 transition-transform hover:scale-105 hover:rotate-12"
              text="safe + calm"
              emoji="🛡️"
              tone="secondary"
            />
            <Sticker
              className="absolute left-10 bottom-0 -rotate-2 transition-transform hover:scale-105 hover:rotate-0"
              text="happy homes"
              emoji="🏡"
              tone="neutral"
            />
          </div>

          <div className="mt-4 text-center text-xs font-semibold text-ink-muted italic">
            a vibe check before you adopt 🐾
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniPromise({
  title,
  body,
  emoji,
}: {
  title: string;
  body: string;
  emoji: string;
}) {
  return (
    <div className="group rounded-3xl border border-black/10 bg-surface/70 p-5 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1 hover:border-black/14 hover:bg-surface/80">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-[#2f2a26] to-[#3a3430] text-[#f4efe8] shadow-medium transition-transform group-hover:scale-110">
          <span className="text-base">{emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-ink-primary">{title}</div>
          <div className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{body}</div>
        </div>
      </div>
    </div>
  );
}

function Sticker({
  text,
  emoji,
  className = "",
  tone = "neutral",
}: {
  text: string;
  emoji: string;
  className?: string;
  tone?: "primary" | "secondary" | "neutral";
}) {
  const toneClass =
    tone === "primary"
      ? "from-primary/25 to-surface/85"
      : tone === "secondary"
        ? "from-secondary/25 to-surface/85"
        : "from-black/8 to-surface/85";

  return (
    <div
      className={[
        "rounded-3xl border border-black/10 px-4 py-3 shadow-medium",
        "bg-linear-to-br",
        toneClass,
        "backdrop-blur-sm",
        "cursor-default",
        className,
      ].join(" ")}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        {text}
      </div>
      <div className="mt-1.5 text-2xl transition-transform hover:scale-110">{emoji}</div>
    </div>
  );
}
