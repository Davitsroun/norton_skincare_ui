'use server';

import {
  createPaymentProfileService,
  updatePaymentProfileService,
  deletePaymentProfileService,
} from '@/service/payment-profile-service';
import type { PaymentProfileUpsertBody } from '@/types/payment-profile';

export type PaymentProfileActionResult = {
  success: boolean;
  paymentProfileId?: string | null;
  error?: string;
};

export async function createPaymentProfileAction(
  body: PaymentProfileUpsertBody
): Promise<PaymentProfileActionResult> {
  try {
    const result = await createPaymentProfileService(body);
    return { success: true, paymentProfileId: result.paymentProfileId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create payment profile.';
    return { success: false, error: message };
  }
}

export async function updatePaymentProfileAction(
  id: string,
  body: PaymentProfileUpsertBody
): Promise<PaymentProfileActionResult> {
  try {
    const result = await updatePaymentProfileService(id, body);
    return { success: true, paymentProfileId: result.paymentProfileId ?? id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update payment profile.';
    return { success: false, error: message };
  }
}

export async function deletePaymentProfileAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deletePaymentProfileService(id);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete payment profile.';
    return { success: false, error: message };
  }
}
