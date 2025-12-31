export type DogStatus = "available" | "reserved" | "sold" | string;

export type DogImage = {
  id: string;
  dog_id: string;
  url: string;
  alt: string | null;
  sort_order: number | null;
  created_at: string;
};

export type DogRow = {
  id: string;
  name: string;
  description: string | null;
  status: DogStatus;

  deposit_amount_cents: number | null;
  price_amount_cents: number | null;

  cover_image_url: string | null;

  breed: string | null;
  sex: string | null;
  age_weeks: number | null;
  color: string | null;
  ready_date: string | null;

  sort_order: number | null;
  slug: string | null;

  created_at: string;
  updated_at: string;
};

export type Dog = DogRow & {
  images: DogImage[];
};
