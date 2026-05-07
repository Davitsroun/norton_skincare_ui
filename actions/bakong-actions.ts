'use server';

import {
  bakongGenerateQrService,
  bakongGetQrImageService,
  bakongCheckTransactionService,
} from '@/service/bakong-service';
import type {
  BakongCheckTransactionRequest,
  BakongGenerateQrRequest,
  BakongGetQrImageRequest,
} from '@/types/bakong';

export type BakongActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function bakongGenerateQrAction(
  body: BakongGenerateQrRequest
): Promise<BakongActionResult<{ qr: string; md5: string | null }>> {
  try {
    const result = await bakongGenerateQrService(body);
    if (!result.qr) {
      return { success: false, error: 'API did not return a QR payload string.' };
    }
    return { success: true, data: { qr: result.qr, md5: result.md5 } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not generate KHQR.';
    return { success: false, error: message };
  }
}

export async function bakongGetQrImageAction(
  body: BakongGetQrImageRequest
): Promise<BakongActionResult<{ imageDataUrl: string }>> {
  try {
    const imageDataUrl = await bakongGetQrImageService(body);
    return { success: true, data: { imageDataUrl } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not fetch QR image.';
    return { success: false, error: message };
  }
}

export async function bakongCheckTransactionAction(
  body: BakongCheckTransactionRequest
): Promise<BakongActionResult<unknown>> {
  try {
    const raw = await bakongCheckTransactionService(body);
    return { success: true, data: raw };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not verify payment.';
    return { success: false, error: message };
  }
}
