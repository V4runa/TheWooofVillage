"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Dog, DogImage, DogRow, DogStatus } from "@/types/dogs";

type UseDogsOptions = {
  statuses?: DogStatus[];
  includeAll?: boolean;
};

type UseDogsResult = {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useDogs(options: UseDogsOptions = {}): UseDogsResult {
  const { statuses = ["available"], includeAll = false } = options;

  // Keep dependency stable without creating a new array every render.
  const stableStatuses = useMemo(() => statuses, [JSON.stringify(statuses)]);

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("dogs")
      .select(
        [
          "id",
          "name",
          "description",
          "status",
          "deposit_amount_cents",
          "price_amount_cents",
          "cover_image_url",
          "breed",
          "sex",
          "age_weeks",
          "color",
          "ready_date",
          "sort_order",
          "slug",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!includeAll && stableStatuses.length > 0) {
      query = query.in("status", stableStatuses);
    }

    // ✅ Force correct typing (prevents GenericStringError[] inference)
    const { data: dogsData, error: dogsError } = await query.returns<DogRow[]>();

    if (dogsError) {
      setError(dogsError.message);
      setDogs([]);
      setLoading(false);
      return;
    }

    const baseDogs: DogRow[] = dogsData ?? [];

    // Fetch all images for the returned dogs (small batch, so this is fine)
    const dogIds = baseDogs.map((d) => d.id);
    const imagesByDogId: Record<string, DogImage[]> = {};

    if (dogIds.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from("dog_images")
        .select("id,dog_id,url,alt,sort_order,created_at")
        .in("dog_id", dogIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<DogImage[]>();

      if (imagesError) {
        setError(imagesError.message);
        setDogs([]);
        setLoading(false);
        return;
      }

      for (const img of imagesData ?? []) {
        const key = img.dog_id;
        if (!imagesByDogId[key]) imagesByDogId[key] = [];
        imagesByDogId[key].push(img);
      }
    }

    const merged: Dog[] = baseDogs.map((d) => ({
      ...d,
      images: imagesByDogId[d.id] ?? [],
    }));

    setDogs(merged);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [includeAll, stableStatuses]);

  return {
    dogs,
    loading,
    error,
    refetch: load,
  };
}
