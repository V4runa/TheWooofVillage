"use client";

import * as React from "react";
import { Search, HandHeart, Home, ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/Card";

type Step = {
  Icon: React.ComponentType<{ size?: number }>;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    Icon: Search,
    title: "1 · Meeting the pups",
    body: "We are very flexible on meet and greets. If you're local you can schedule an inperson visit. You can also reserve a puppy or schedule a virtual visit.",
  },
  {
    Icon: HandHeart,
    title: "2 · Reserve with a deposit",
    body: "Found your match? Send the deposit with any listed payment method, then text or call to confirm the deposit has been received. The deposit holds your pup for 7 days. Deposits are non-refundable and non-transferable.",
  },
  {
    Icon: Home,
    title: "3 · Welcome home",
    body: "Arrange a home pickup or a delivery for a fee depending on your location. Your puppy goes home with their vaccination records. Most puppies come with two sets of shots and registration papers. (ALL PUPPIES COME WITH FLORIDA HEALTH CERTIFICATES, SHOT RECORDS, DEWORMING RECORDS, AND A PUPPY PURCHASE AGREEMENT) You will receive your puppy groomed, socialized, pee pad trained, crate trained, and ready to go home with you with a little welcome bag of goodies.",
  },
];

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "Are the puppies vet-checked and vaccinated?",
    a: "Yes. Each puppy is examined and receives age-appropriate vaccinations and deworming before going home. We share records at pickup. And all puppies come with a Florida health certificate.",
  },
  {
    q: "How do deposits and reservations work?",
    a: "A deposit reserves a specific puppy and is applied toward the total. Once we receive it, text or call us to confirm and we'll mark the pup as reserved.",
  },
  {
    q: "Do you ship, or is it local pickup?",
    a: "We offer delivery services, flight nanny services for a fee. We also offer local pickups free of charge.",
  },
  {
    q: "What if I'm not sure which puppy is right for us?",
    a: "If you're searching for more of a personality match rather than a specific color or look, We can help choose the best personily matching your home and family.",
  },
];

function StepCard({ step }: { step: Step }) {
  const { Icon } = step;
  return (
    <Card variant="surface" className="h-full p-5 sm:p-6">
      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-950/14 bg-[rgba(255,248,238,0.92)] ring-1 ring-inset ring-white/20 text-amber-900/85 shadow-soft">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-ink-primary">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        {step.body}
      </p>
    </Card>
  );
}

function FaqItem({ item }: { item: Faq }) {
  return (
    <details className="group rounded-2xl border border-amber-950/12 bg-[rgba(255,250,244,0.86)] ring-1 ring-inset ring-white/16 px-5 py-4 shadow-soft transition open:bg-[rgba(255,252,248,0.94)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-ink-primary marker:hidden">
        {item.q}
        <ChevronDown
          size={18}
          className="shrink-0 text-amber-900/70 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        {item.a}
      </p>
    </details>
  );
}

export function TrustSection() {
  return (
    <div className="grid gap-10 lg:gap-12">
      {/* How adoption works */}
      <section id="how" className="scroll-mt-24">
        <div className="mb-5 sm:mb-7">
          <div className="text-xs font-black uppercase tracking-wider text-amber-900/85">
            Simple & personal
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            How adoption works
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm sm:text-base leading-relaxed text-ink-secondary">
            Three easy steps, with a real person on the other end the whole way
            through.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <StepCard key={s.title} step={s} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24">
        <div className="mb-5 sm:mb-7">
          <div className="text-xs font-black uppercase tracking-wider text-amber-900/85">
            Good to know
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            Frequently asked questions
          </h2>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {FAQS.map((f) => (
            <FaqItem key={f.q} item={f} />
          ))}
        </div>
      </section>
    </div>
  );
}
