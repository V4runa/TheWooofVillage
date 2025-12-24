import { Badge } from "@/components/ui/Badge";

type TrustItem = {
  title: string;
  body: string;
  emoji: string;
};

const TRUST: TrustItem[] = [
  {
    title: "Clear details up front",
    body: "Age, temperament, basics, and expectations are posted plainly.",
    emoji: "🔍",
  },
  {
    title: "Screening-first",
    body: "We care where pups go. Fit matters more than speed.",
    emoji: "🛡️",
  },
  {
    title: "Respectful holds",
    body: "If deposits are used, it’s communicated clearly and handled fairly.",
    emoji: "🧾",
  },
];

export function TrustStrip() {
  return (
    <section className="relative flex h-full w-full flex-col animate-fade-in">
      {/* subtle local tint */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            trust + safety
          </div>

          <h3 className="mt-2 text-xl font-bold tracking-tight text-ink-primary sm:text-2xl">
            Calm, safe rehoming
          </h3>

          <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-ink-secondary sm:text-base">
            A confident yes — not a rushed decision.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="success">safe</Badge>
          <Badge variant="primary">transparent</Badge>
        </div>
      </div>

      {/* Framed panel */}
      <div
        className={[
          "relative mt-7 flex flex-1 flex-col overflow-hidden rounded-[28px] p-4 sm:p-5",
          "border border-black/5 ring-1 ring-black/5",
          "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.50),rgba(250,242,232,0.36))]",
          "shadow-soft backdrop-blur-md",
        ].join(" ")}
      >
        {/* subtle interior glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_220px_at_20%_10%,rgba(127,175,155,0.14),transparent_60%),radial-gradient(520px_220px_at_85%_45%,rgba(208,140,96,0.10),transparent_55%)]" />

        {/* panel top rail (matches Feed frame) */}
        <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <span className="grid h-7 w-7 place-items-center rounded-2xl border border-black/5 bg-white/10 shadow-soft">
              🛡️
            </span>
            <span>Protection first</span>
            <span className="opacity-60">•</span>
            <span className="opacity-80">Clear expectations</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <MiniPill>screening-first</MiniPill>
            <MiniPill>no pressure</MiniPill>
          </div>

          {/* single organic corner accent (one only) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 -top-2 grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(to_br,rgba(208,140,96,0.90),rgba(181,90,58,0.90))] text-white shadow-medium -rotate-6 opacity-85"
          >
            <span className="text-sm">✓</span>
          </span>
        </div>

        {/* Trust rows */}
        <div className="relative space-y-4">
          {TRUST.map((t, index) => (
            <TrustRow key={t.title} {...t} delay={index * 90} />
          ))}
        </div>

        {/* Bottom anchor */}
        <div className="relative mt-auto pt-5">
          <div
            className={[
              "rounded-2xl px-5 py-4 text-xs font-semibold leading-relaxed",
              "border border-black/5 ring-1 ring-black/5",
              "bg-[linear-gradient(to_bottom,rgba(127,175,155,0.14),rgba(255,252,246,0.45))]",
              "text-ink-primary shadow-soft backdrop-blur-md",
            ].join(" ")}
          >
            We’re here to help you choose the right pup — not the fastest pup. 🐾
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRow({
  title,
  body,
  emoji,
  delay = 0,
}: TrustItem & { delay?: number }) {
  return (
    <div
      className={[
        "group relative flex items-start gap-4 rounded-2xl p-5",
        "border border-black/5 ring-1 ring-black/5",
        "bg-[linear-gradient(to_bottom,rgba(255,252,246,0.62),rgba(250,242,232,0.46))]",
        "shadow-soft backdrop-blur-md",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:shadow-medium hover:-translate-y-[1px] hover:border-black/8 hover:ring-black/8",
        "animate-fade-in",
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_70%)] opacity-30" />

      {/* Icon medallion */}
      <div
        className={[
          "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
          "bg-[linear-gradient(to_br,#2f2a26,#3a3430)]",
          "text-[#f6f1ea] shadow-medium",
        ].join(" ")}
      >
        <span className="text-lg">{emoji}</span>
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="text-sm font-bold text-ink-primary sm:text-base">
          {title}
        </div>
        <div className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
          {body}
        </div>
      </div>

      <div className="relative ml-auto hidden text-lg text-ink-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
        ✓
      </div>
    </div>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/5 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-ink-muted shadow-soft">
      {children}
    </span>
  );
}
