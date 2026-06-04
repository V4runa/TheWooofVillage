"use client";

import { useCallback, useEffect, useState } from "react";
import type { Testimonial, TestimonialStatus } from "@/types/testimonials";

type UseTestimonialsOptions = {
  statuses?: TestimonialStatus[]; // default: ["approved"]
  limit?: number; // optional cap
  includeAll?: boolean; // kept for API compatibility
};

type UseTestimonialsResult = {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTestimonials(
  options: UseTestimonialsOptions = {}
): UseTestimonialsResult {
  const { limit } = options;

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // The public endpoint only ever returns approved testimonials.
      const res = await fetch("/api/public/testimonials", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Could not load testimonials.");
        setTestimonials([]);
        return;
      }

      let list = (json.testimonials as Testimonial[]) ?? [];
      if (typeof limit === "number") list = list.slice(0, limit);
      setTestimonials(list);
    } catch (e: any) {
      setError(e?.message || "Could not load testimonials.");
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    testimonials,
    loading,
    error,
    refetch: load,
  };
}
