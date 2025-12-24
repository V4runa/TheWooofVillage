import { Badge } from "@/components/ui/Badge";

type TrustItem = {
  title: string;
  body: string;
  emoji: string;
};

const TRUST: TrustItem[] = [
  {
    title: "Clarity up front",
    body: "Temperament, age, basics — the important details are posted clearly.",
    emoji: "🔍",
  },
  {
    title: "Screening-first",
    body: "We care where pups go. The right match protects everyone.",
    emoji: "🛡️",
  },
  {
    title: "Respectful holds",
    body: "If a deposit is used, it’s communicated clearly and fairly.",
    emoji: "🧾",
  },
];

export function TrustStrip() {
  return (
    <section className="relative animate-fade-in">
      {/* soft local tint instead of white container */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -right-20 h-56 w-56 rounded-full bg-primary/16 blur-3xl animate-gentle-pulse" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/16 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            trust + safety
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            Calm, safe rehoming
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary max-w-[42ch] sm:text-base">
            The goal is a confident yes — not a rushed decision.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge variant="success" className="transition-all hover:scale-105">safe</Badge>
          <Badge variant="primary" className="transition-all hover:scale-105">transparent</Badge>
        </div>
      </div>

      {/* Trust rows */}
      <div className="mt-6 space-y-4">
        {TRUST.map((t, index) => (
          <TrustRow key={t.title} {...t} delay={index * 100} />
        ))}
      </div>

      {/* Micro reassurance (reads like a note, not a card) */}
      <div className="mt-6 rounded-2xl border border-black/8 bg-primary/12 px-5 py-4 text-xs font-semibold leading-relaxed text-text-muted transition-all hover:bg-primary/15 hover:border-primary/20">
        We're here to help you choose the right pup, not the fastest pup. 🐾
      </div>
    </section>
  );
}

function TrustRow({ title, body, emoji, delay = 0 }: TrustItem & { delay?: number }) {
  return (
      <div
        className={[
          "group flex items-start gap-4 rounded-2xl",
          "border border-black/10",
          "bg-secondary/12",
          "p-5 shadow-soft",
          "transition-all duration-300",
          "hover:shadow-medium hover:-translate-y-1 hover:border-primary/25 hover:bg-secondary/18",
          "animate-fade-in",
        ].join(" ")}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary/80 to-primary-600 text-white shadow-medium transition-transform group-hover:scale-110 group-hover:rotate-3">
          <span className="text-lg">{emoji}</span>
        </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-text-primary sm:text-base">{title}</div>
        <div className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          {body}
        </div>
      </div>

      <div className="ml-auto hidden text-xl opacity-0 transition-all group-hover:opacity-100 group-hover:scale-110 sm:block">
        ✓
      </div>
    </div>
  );
}
