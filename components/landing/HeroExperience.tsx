import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function HeroExperience() {
  return (
    <section className="relative mt-12 animate-fade-in sm:mt-16">
      {/* gentle visual seam */}
      <div className="pointer-events-none absolute left-0 right-0 -top-6 h-px bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.10),transparent)]" />

      {/* soft local atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -right-28 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div
          className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-secondary/12 blur-3xl"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute left-10 top-12 h-44 w-44 rounded-full bg-rose-400/8 blur-3xl" />
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        {/* Copy block */}
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">screening-first</Badge>
            <Badge variant="secondary">safe rehoming</Badge>
            <Badge variant="neutral">clear listings</Badge>
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl lg:text-5xl">
            Meet your next best friend — with clarity.
          </h2>

          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-secondary sm:text-lg">
            This isn’t a random social post. Every pup is listed with the details that
            matter, and a simple process that keeps meetups calm and decisions informed.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/dogs" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full rounded-full sm:w-auto"
              >
                Browse pups
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
              title="Real details"
              body="Age, temperament, needs, and fit — posted plainly."
              emoji="✅"
            />
            <MiniPromise
              title="Respectful pace"
              body="Ask questions. Decide when you’re confident."
              emoji="🧠"
            />
            <MiniPromise
              title="Safer meetups"
              body="Clear expectations and calm handoffs."
              emoji="🛡️"
            />
          </div>
        </div>

        {/* Right signal panel (premium, not “stickers”) */}
        <div className="hidden lg:col-span-4 lg:block">
          <SignalPanel />
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
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f4efe8] shadow-medium transition-transform group-hover:scale-110">
          <span className="text-base">{emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-ink-primary">{title}</div>
          <div className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalPanel() {
  return (
    <div className="relative">
      {/* panel */}
      <div
        className={[
          "relative overflow-hidden rounded-[28px] p-5",
          "border border-black/5 ring-1 ring-black/5",
          "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.50),rgba(250,242,232,0.36))]",
          "shadow-soft backdrop-blur-md",
        ].join(" ")}
      >
        {/* sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_70%)] opacity-30" />

        <div className="relative">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            what to expect
          </div>

          <div className="mt-4 space-y-3">
            <SignalRow emoji="🧾" title="Transparent terms" body="If a deposit exists, it’s stated on the listing." />
            <SignalRow emoji="🧍‍♀️🧍" title="Calm meetups" body="Public locations preferred. Clear expectations." />
            <SignalRow emoji="🏡" title="Fit-first" body="We optimize for the right home — not the fastest pickup." />
          </div>

          <div className="mt-5 rounded-2xl border border-black/5 bg-white/10 px-4 py-3 text-xs font-semibold text-ink-primary">
            You should feel confident before you commit. 🐾
          </div>
        </div>
      </div>

      {/* tiny floating accent (subtle, not childish) */}
      <div className="pointer-events-none absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f4efe8] shadow-medium">
        🐶
      </div>
    </div>
  );
}

function SignalRow({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-2xl p-4",
        "border border-black/5 ring-1 ring-black/5",
        "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.62),rgba(250,242,232,0.46))]",
        "shadow-soft",
      ].join(" ")}
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f6f1ea] shadow-soft">
        <span className="text-sm">{emoji}</span>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-ink-primary">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-ink-secondary">{body}</div>
      </div>
    </div>
  );
}
