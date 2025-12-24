import { Badge } from "@/components/ui/Badge";

type Step = {
  title: string;
  body: string;
  emoji: string;
};

const DEFAULT_STEPS: Step[] = [
  {
    title: "Browse the pack",
    body: "See pups with real details — no guessing, no vague posts.",
    emoji: "📲",
  },
  {
    title: "Say hi + ask questions",
    body: "We’ll help you understand temperament, needs, and the best fit.",
    emoji: "💬",
  },
  {
    title: "Hold with a deposit (optional)",
    body: "If you’re ready, you can place a hold while we confirm everything.",
    emoji: "🧾",
  },
  {
    title: "Meet + complete the match",
    body: "A calm, safe handoff — the goal is a long-term best-friend bond.",
    emoji: "🏡",
  },
];

export function HowItWorks({ id = "how-it-works" }: { id?: string }) {
  return (
    <section id={id} className="relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
            simple + safe
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            How it works
          </h3>
          <p className="mt-2 max-w-[65ch] text-base text-text-secondary">
            Adoption should feel exciting — not stressful. Here’s the flow, designed to keep
            things cute, clear, and safe.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="success">friendly</Badge>
          <Badge variant="neutral">clear</Badge>
          <Badge variant="primary">safe</Badge>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-7 grid gap-4 lg:grid-cols-12">
        {/* Left rail (storybook vibe) */}
        <div className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-6 rounded-3xl border border-black/10 bg-white/45 p-5 shadow-soft">
            <div className="text-sm font-bold text-text-primary">Your adoption path</div>
            <div className="mt-2 text-sm text-text-secondary">
              A gentle process that protects you and the pup.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="neutral">no pressure</Badge>
              <Badge variant="neutral">real details</Badge>
              <Badge variant="neutral">right fit</Badge>
            </div>

            <div className="mt-5 text-xs font-semibold text-text-muted">
              pro tip: trust your gut 🐾
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="lg:col-span-9">
          <div className="relative space-y-3">
            {/* vertical line (mobile + desktop) */}
            <div className="pointer-events-none absolute left-5 top-0 hidden h-full w-px bg-black/10 sm:block" />

            {DEFAULT_STEPS.map((s, index) => (
              <StepRow
                key={s.title}
                stepNumber={index + 1}
                title={s.title}
                body={s.body}
                emoji={s.emoji}
                isLast={index === DEFAULT_STEPS.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepRow({
  title,
  body,
  emoji,
  stepNumber,
  isLast,
}: {
  title: string;
  body: string;
  emoji: string;
  stepNumber: number;
  isLast: boolean;
}) {
  return (
    <div
      className={[
        "group relative",
        "rounded-3xl border border-black/10 bg-white/55 shadow-soft",
        "p-5 sm:p-6",
        "transition",
        "hover:shadow-medium hover:-translate-y-px hover:border-primary/25",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        {/* node */}
        <div className="relative shrink-0">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-black to-neutral-800 text-white shadow-medium">
            <span className="text-base">{emoji}</span>
          </div>

          <div className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white text-xs font-bold shadow-medium">
            {stepNumber}
          </div>

          {/* connector cap for nicer endings */}
          {!isLast ? (
            <div className="pointer-events-none absolute left-1/2 top-[52px] hidden h-6 w-px -translate-x-1/2 bg-black/10 sm:block" />
          ) : null}
        </div>

        {/* content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-bold text-text-primary">{title}</div>
            <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-text-muted">
              step {stepNumber}
            </span>
          </div>

          <div className="mt-2 text-sm leading-relaxed text-text-secondary">
            {body}
          </div>

          {/* tiny “cute social” micro-delight (subtle) */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="neutral" className="text-xs">
              easy
            </Badge>
            <Badge variant="neutral" className="text-xs">
              ask anytime
            </Badge>
            <Badge variant="neutral" className="text-xs">
              pup-first
            </Badge>
          </div>
        </div>

        {/* paw reaction (only on larger) */}
        <div className="hidden sm:block text-2xl opacity-0 transition-opacity group-hover:opacity-100">
          🐾
        </div>
      </div>
    </div>
  );
}
