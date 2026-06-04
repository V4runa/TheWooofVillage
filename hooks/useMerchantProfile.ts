"use client";

import { useEffect, useState } from "react";
import type { MerchantProfile } from "@/types/merchant";

type UseMerchantProfileResult = {
  profile: MerchantProfile | null;
  loading: boolean;
  error: string | null;
};

export function useMerchantProfile(): UseMerchantProfileResult {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/public/merchant-profile", {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!alive) return;

        if (!res.ok || !json?.ok) {
          setError(json?.error || "Could not load profile.");
          setProfile(null);
        } else {
          setProfile((json.profile as MerchantProfile) ?? null);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "Could not load profile.");
          setProfile(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, []);

  return { profile, loading, error };
}
