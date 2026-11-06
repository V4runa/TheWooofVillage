export type WaitlistPaymentStatus = "unverified" | "confirmed";
export type WaitlistHandlingStatus = "open" | "closed";
export type WaitlistCloseReason = "buyer_cancel" | "business" | "assigned" | null;
export type WaitlistCreditStatus = "unused" | "applied";
export type WaitlistRefundStatus = "none" | "approved" | "returned";

export type WaitlistEntry = {
  id: string;
  created_at: string;
  updated_at: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_phone_digits: string;
  buyer_email: string;
  breed_preference: string | null;
  sex_preference: string | null;
  color_preference?: string | null;
  note: string | null;
  amount_cents: number;
  currency: string;
  terms_version: string;
  terms_accepted_at: string;
  payment_status: WaitlistPaymentStatus;
  confirmed_amount_cents: number | null;
  payment_confirmed_at: string | null;
  payment_mismatch: boolean;
  mismatch_resolved_at: string | null;
  mismatch_resolution_note: string | null;
  handling_status: WaitlistHandlingStatus;
  close_reason: WaitlistCloseReason;
  closed_at: string | null;
  sort_position: number;
  admin_note: string | null;
  pass_count: number;
  credit_status: WaitlistCreditStatus;
  assigned_dog_id: string | null;
  credit_applied_cents: number | null;
  credit_applied_at: string | null;
  excess_resolution_note: string | null;
  refund_status: WaitlistRefundStatus;
  refund_amount_cents: number | null;
  refund_reason: string | null;
  refund_reference: string | null;
  refund_approved_at: string | null;
  refund_returned_at: string | null;
};

export type WaitlistEvent = {
  id: string;
  entry_id: string;
  created_at: string;
  kind: string;
  note: string | null;
  amount_cents: number | null;
};

export type WaitlistSettings = {
  enabled: boolean;
  amount_cents: number;
  currency: "USD";
};
