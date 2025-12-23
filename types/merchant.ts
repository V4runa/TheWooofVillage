export type MerchantProfile = {
  id: number;
  display_name: string;
  tagline: string | null;
  about: string | null;

  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;

  venmo_url: string | null;
  cashapp_url: string | null;
  zelle_recipient: string | null;
};
