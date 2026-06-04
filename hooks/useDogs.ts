"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dog, DogStatus } from "@/types/dogs";

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
  const statusesKey = JSON.stringify(statuses);
  const stableStatuses = useMemo(() => statuses, [statusesKey]);

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (includeAll) {
        params.set("includeAll", "true");
      } else if (stableStatuses.length > 0) {
        params.set("statuses", stableStatuses.join(","));
      }

      const res = await fetch(`/api/public/dogs?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Could not load puppies.");
        setDogs([]);
        return;
      }

      setDogs((json.dogs as Dog[]) ?? []);
    } catch (e: any) {
      setError(e?.message || "Could not load puppies.");
      setDogs([]);
    } finally {
      setLoading(false);
    }
  }, [includeAll, stableStatuses]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    dogs,
    loading,
    error,
    refetch: load,
  };
}
