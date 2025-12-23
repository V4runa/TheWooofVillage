"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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

      const { data, error } = await supabase
        .from("merchant_profile")
        .select("*")
        .eq("id", 1)
        .single();

      if (!alive) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setProfile(data as MerchantProfile);
      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  return { profile, loading, error };
}
