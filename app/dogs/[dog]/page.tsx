import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import DogDetailClient from "./DogDetailClient";

type Params = { dog: string };

async function fetchDogForMeta(slugOrId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("dogs")
      .select("name,description,cover_image_url,breed,slug")
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .maybeSingle();
    return data as
      | {
          name: string;
          description: string | null;
          cover_image_url: string | null;
          breed: string | null;
          slug: string | null;
        }
      | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { dog: slug } = await params;
  const dog = await fetchDogForMeta(slug);

  if (!dog) {
    return {
      title: "Puppy details",
      description: "View puppy photos, details, and deposit options.",
    };
  }

  const title = dog.name;
  const description =
    dog.description?.trim() ||
    `Meet ${dog.name}${dog.breed ? `, a ${dog.breed}` : ""}. Photos, details, and deposit options.`;
  const canonical = `/dogs/${dog.slug ?? slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: dog.cover_image_url ? [{ url: dog.cover_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: dog.cover_image_url ? [dog.cover_image_url] : undefined,
    },
  };
}

export default function DogDetailPage() {
  return <DogDetailClient />;
}
