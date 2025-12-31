// lib/mockDogs.ts
import type { Dog } from "@/types/dogs";

/**
 * Landing-page mock dogs for when there are no listings yet.
 * Always includes cover_image_url to avoid “broken grid” visuals.
 */
export const MOCK_DOGS: Dog[] = [
  {
    id: "mock-1",
    slug: "milo",
    name: "Milo",
    breed: "Golden Retriever",
    age_weeks: 10,
    sex: "Male",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=101",
    deposit_amount_cents: 20000,
    price_amount_cents: 120000,
    description: "Playful and confident. Loves cuddles and learns fast.",
    sort_order: 1,
    images: [],
  } as any,
  {
    id: "mock-2",
    slug: "luna",
    name: "Luna",
    breed: "Labrador Mix",
    age_weeks: 12,
    sex: "Female",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=202",
    deposit_amount_cents: 20000,
    price_amount_cents: 110000,
    description: "Sweet temperament. Great with kids and calm indoors.",
    sort_order: 2,
    images: [],
  } as any,
  {
    id: "mock-3",
    slug: "nova",
    name: "Nova",
    breed: "Aussie Shepherd",
    age_weeks: 14,
    sex: "Female",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=50",
    deposit_amount_cents: 20000,
    price_amount_cents: 110000,
    description: "Gentle energy, affectionate, already doing great on leash.",
    sort_order: 3,
    images: [],
  } as any,
  {
    id: "mock-4",
    slug: "bear",
    name: "Bear",
    breed: "Bernedoodle",
    age_weeks: 11,
    sex: "Male",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=40",
    deposit_amount_cents: 20000,
    price_amount_cents: 130000,
    description: "Fluffy and social. Loves people and bonds quickly.",
    sort_order: 4,
    images: [],
  } as any,
  {
    id: "mock-5",
    slug: "atlas",
    name: "Atlas",
    breed: "German Shepherd",
    age_weeks: 13,
    sex: "Male",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=52",
    deposit_amount_cents: 20000,
    price_amount_cents: 140000,
    description: "Smart and steady. Thrives with structure and daily play.",
    sort_order: 5,
    images: [],
  } as any,
  {
    id: "mock-6",
    slug: "daisy",
    name: "Daisy",
    breed: "Cavalier Spaniel",
    age_weeks: 9,
    sex: "Female",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=11",
    deposit_amount_cents: 20000,
    price_amount_cents: 115000,
    description: "Tiny sweetheart. Great lap companion with a playful streak.",
    sort_order: 6,
    images: [],
  } as any,

  // extra mocks to support 12+
  {
    id: "mock-7",
    slug: "oreo",
    name: "Oreo",
    breed: "Border Collie Mix",
    age_weeks: 12,
    sex: "Male",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=77",
    deposit_amount_cents: 20000,
    price_amount_cents: 125000,
    description: "Bright eyes, quick learner, loves a good game of fetch.",
    sort_order: 7,
    images: [],
  } as any,
  {
    id: "mock-8",
    slug: "poppy",
    name: "Poppy",
    breed: "Corgi Mix",
    age_weeks: 10,
    sex: "Female",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=88",
    deposit_amount_cents: 20000,
    price_amount_cents: 120000,
    description: "Tiny tank. Big personality. Extremely people-friendly.",
    sort_order: 8,
    images: [],
  } as any,
  {
    id: "mock-9",
    slug: "shadow",
    name: "Shadow",
    breed: "Labrador",
    age_weeks: 13,
    sex: "Male",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=99",
    deposit_amount_cents: 20000,
    price_amount_cents: 130000,
    description: "Gentle, steady, loves naps and follows you everywhere.",
    sort_order: 9,
    images: [],
  } as any,
  {
    id: "mock-10",
    slug: "willow",
    name: "Willow",
    breed: "Sheltie Mix",
    age_weeks: 11,
    sex: "Female",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=111",
    deposit_amount_cents: 20000,
    price_amount_cents: 118000,
    description: "Soft-hearted. Calm indoors. Sweet with gentle handling.",
    sort_order: 10,
    images: [],
  } as any,
  {
    id: "mock-11",
    slug: "rocket",
    name: "Rocket",
    breed: "Terrier Mix",
    age_weeks: 9,
    sex: "Male",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=123",
    deposit_amount_cents: 20000,
    price_amount_cents: 105000,
    description: "Zoomies champion. Loves toys and a little adventure.",
    sort_order: 11,
    images: [],
  } as any,
  {
    id: "mock-12",
    slug: "honey",
    name: "Honey",
    breed: "Poodle Mix",
    age_weeks: 12,
    sex: "Female",
    status: "available",
    cover_image_url: "https://placedog.net/1000/700?id=135",
    deposit_amount_cents: 20000,
    price_amount_cents: 135000,
    description: "Affectionate and snuggly. Great companion energy.",
    sort_order: 12,
    images: [],
  } as any,
];

export function getMockFeaturedDogs(count: number) {
  return getMockDogs(count).slice(0, count);
}

/**
 * Returns exactly `count` dogs (cycles MOCK_DOGS if count > MOCK_DOGS.length).
 * Useful for stable grids when there are zero real listings.
 */
export function getMockDogs(count: number): Dog[] {
  if (count <= 0) return [];
  if (MOCK_DOGS.length === 0) return [];

  const out: Dog[] = [];
  for (let i = 0; i < count; i++) {
    const d = MOCK_DOGS[i % MOCK_DOGS.length];
    // ensure unique IDs for React keys if cycling
    out.push({
      ...d,
      id: `${d.id}__${i}`,
      slug: d.slug ? `${d.slug}-${i}` : d.slug,
      sort_order: i + 1,
    } as any);
  }
  return out;
}
