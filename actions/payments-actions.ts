'use server';

import { createPaymentService, updatePaymentService } from '@/service/payments-service';
import type { CreatePaymentRequest, UpdatePaymentRequest } from '@/types/payments-api';

export type PaymentActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createPaymentAction(
  payload: CreatePaymentRequest
): Promise<PaymentActionResult<unknown>> {
  try {
    const data = await createPaymentService(payload);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to record payment.';
    return { success: false, error: message };
  }
}

export async function updatePaymentAction(
  paymentId: string,
  payload: UpdatePaymentRequest
): Promise<PaymentActionResult<unknown>> {
  try {
    const data = await updatePaymentService(paymentId, payload);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update payment.';
    return { success: false, error: message };
  }
}
