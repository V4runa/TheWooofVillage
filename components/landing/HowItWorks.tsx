import { Badge } from "@/components/ui/Badge";

type Step = {
  title: string;
  body: string;
  emoji: string;
  bullets: string[];
};

const STEPS: Step[] = [
  {
    title: "Browse listings",
    body: "Real details, clear expectations, and what matters for a good fit.",
    emoji: "📲",
    bullets: ["Age + temperament", "Needs + home fit", "Clear next steps"],
  },
  {
    title: "Message + ask anything",
    body: "Straight answers, fast clarity, and no pressure if it’s not right.",
    emoji: "💬",
    bullets: ["Temperament questions", "Schedule + logistics", "No pressure"],
  },
  {
    title: "Confirm the match",
    body: "If a hold or deposit is used, it’s stated on the listing with terms.",
    emoji: "🧾",
    bullets: ["Optional when offered", "Transparent terms", "Respectful timeline"],
  },
  {
    title: "Meet + safe handoff",
    body: "A calm meetup, a clear decision, and a smooth transition home.",
    emoji: "🏡",
    bullets: ["Public meetups preferred", "Bring questions", "Long-term fit first"],
  },
];

export function HowItWorks({ id = "how-it-works" }: { id?: string }) {
  return (
    <section id={id} className="relative animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            the process
          </div>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            How it works
          </h3>

          <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-ink-secondary sm:text-lg">
            Simple, screening-first, and designed to protect the pup while respecting your time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">clear</Badge>
          <Badge variant="primary">screening-first</Badge>
          <Badge variant="success">safe</Badge>
        </div>
      </div>

      {/* Framed panel (matches Feed/Trust rhythm) */}
      <div
        className={[
          "relative mt-7 rounded-[28px] p-4 sm:p-5",
          "border border-black/5 ring-1 ring-black/5",
          "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.50),rgba(250,242,232,0.36))]",
          "shadow-soft backdrop-blur-md",
        ].join(" ")}
      >
        {/* soft path glow */}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(600px_220px_at_18%_12%,rgba(127,175,155,0.16),transparent_60%),radial-gradient(700px_240px_at_88%_45%,rgba(208,140,96,0.12),transparent_55%)]" />

        {/* Steps grid */}
        <div className="relative grid gap-4 lg:grid-cols-2">
          {STEPS.map((s, i) => (
            <StepCard
              key={s.title}
              index={i + 1}
              title={s.title}
              body={s.body}
              emoji={s.emoji}
              bullets={s.bullets}
            />
          ))}
        </div>

        {/* Bottom note (quiet, authoritative) */}
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-black/5 ring-1 ring-black/5 bg-white/10 px-5 py-4 text-xs font-semibold leading-relaxed text-ink-primary shadow-soft backdrop-blur-md">
          {/* tiny, organic corner accent (single) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f6f1ea] shadow-medium rotate-6 opacity-85"
          >
            <span className="text-sm">🐾</span>
          </span>

          We prioritize good matches. If something feels off, we’d rather pause than rush.
        </div>
      </div>
    </section>
  );
}

function StepCard({
  index,
  title,
  body,
  emoji,
  bullets,
}: {
  index: number;
  title: string;
  body: string;
  emoji: string;
  bullets: string[];
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl p-5 sm:p-6",
        "border border-black/5 ring-1 ring-black/5",
        "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.62),rgba(250,242,232,0.46))]",
        "shadow-soft backdrop-blur-md",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:shadow-medium hover:-translate-y-[1px] hover:border-black/8 hover:ring-black/8",
      ].join(" ")}
    >
      {/* sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_70%)] opacity-30" />

      {/* single, consistent hover accent — bottom right */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute z-[2]",
          "right-3 bottom-3",
          "grid h-8 w-8 place-items-center rounded-2xl",
          "bg-[linear-gradient(to_br,#2f2a26,#3a3430)] text-[#f6f1ea]",
          "shadow-medium",
          "opacity-0 transition-opacity duration-200",
          "group-hover:opacity-85",
        ].join(" ")}
      >
        <span className="text-[12px] leading-none translate-y-[0.5px]">
          {emoji}
        </span>
      </span>

      <div className="relative z-[1] flex items-start gap-4">
        {/* Medallion */}
        <div className="relative shrink-0">
          <div
            className={[
              "grid h-12 w-12 place-items-center rounded-2xl",
              "bg-[linear-gradient(to_br,#2f2a26,#3a3430)]",
              "text-[#f6f1ea] shadow-medium",
              "transition-transform duration-200 group-hover:scale-[1.03]",
            ].join(" ")}
          >
            <span className="text-base">{emoji}</span>
          </div>

          {/* Step number */}
          <div className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-black/10 bg-surface/90 text-[11px] font-bold text-ink-primary shadow-soft">
            {index}
          </div>
        </div>

        {/* Copy */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-bold text-ink-primary">{title}</div>
            <span className="rounded-full border border-black/5 bg-white/10 px-2 py-1 text-[11px] font-semibold text-ink-muted">
              step
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{body}</p>

          <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
            {bullets.slice(0, 3).map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/35" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* quiet check */}
        <div className="hidden text-lg text-ink-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
          ✓
        </div>
      </div>
    </div>
  );
}
