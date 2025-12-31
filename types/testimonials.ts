export type TestimonialStatus = "pending" | "approved" | "rejected" | string;

export type TestimonialImage = {
  id: string;
  testimonial_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export type Testimonial = {
  id: string;
  created_at: string;
  updated_at: string;

  status: TestimonialStatus;

  author_name: string;
  author_location: string | null;
  rating: number | null;

  message: string;

  dog_id: string | null;

  images: TestimonialImage[];
};
