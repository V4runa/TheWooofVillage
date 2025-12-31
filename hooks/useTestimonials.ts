"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  Testimonial,
  TestimonialImage,
  TestimonialStatus,
} from "@/types/testimonials";

type UseTestimonialsOptions = {
  statuses?: TestimonialStatus[]; // default: ["approved"]
  limit?: number; // optional cap
  includeAll?: boolean; // if true, ignores statuses filter
};

type UseTestimonialsResult = {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type TestimonialRow = Omit<Testimonial, "images">;

export function useTestimonials(
  options: UseTestimonialsOptions = {}
): UseTestimonialsResult {
  const { statuses = ["approved"], limit, includeAll = false } = options;

  const stableStatuses = useMemo(() => statuses, [JSON.stringify(statuses)]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("testimonials")
      .select(
        [
          "id",
          "created_at",
          "updated_at",
          "status",
          "author_name",
          "author_location",
          "rating",
          "message",
          "dog_id",
        ].join(",")
      )
      .order("created_at", { ascending: false });

    if (!includeAll && stableStatuses?.length) {
      query = query.in("status", stableStatuses);
    }

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const {
      data: testimonialData,
      error: testimonialError,
    } = await query.returns<TestimonialRow[]>();

    if (testimonialError) {
      setError(testimonialError.message);
      setTestimonials([]);
      setLoading(false);
      return;
    }

    const base: TestimonialRow[] = testimonialData ?? [];
    const ids = base.map((t) => t.id);

    let imagesByTestimonialId: Record<string, TestimonialImage[]> = {};

    if (ids.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from("testimonial_images")
        .select("id,testimonial_id,url,alt,sort_order,created_at")
        .in("testimonial_id", ids)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<TestimonialImage[]>();

      if (imagesError) {
        setError(imagesError.message);
        setTestimonials([]);
        setLoading(false);
        return;
      }

      for (const img of imagesData ?? []) {
        if (!imagesByTestimonialId[img.testimonial_id]) {
          imagesByTestimonialId[img.testimonial_id] = [];
        }
        imagesByTestimonialId[img.testimonial_id].push(img);
      }
    }

    const merged: Testimonial[] = base.map((t) => ({
      ...t,
      images: imagesByTestimonialId[t.id] ?? [],
    }));

    setTestimonials(merged);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [includeAll, stableStatuses, limit]);

  return {
    testimonials,
    loading,
    error,
    refetch: load,
  };
}
