export type ReservationRequest = {
  id: string;
  dog_id: string;

  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;

  payment_method: string;
  transaction_id: string | null;
  note: string | null;

  created_at: string;
};
