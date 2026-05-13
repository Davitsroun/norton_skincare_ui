/**
 * POST `/api/v1/payments` — see PaymentSuccessSynchronizer (PAID/SUCCESS/COMPLETED/SUCCEEDED).
 */
export type CreatePaymentRequest = {
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  paidAt: string | null;
};

/**
 * PUT `/api/v1/payments/{id}` — backend merges fields; success status triggers same sync as create.
 */
export type UpdatePaymentRequest = {
  order?: { orderId: string };
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string | null;
  paidAt?: string | null;
};
