'use server';

import {
  createReviewService,
  deleteReviewService,
  updateReviewService,
} from '@/service/review-service';
import type { ReviewViewResponse } from '@/types/product';

export type CreateReviewResult =
  | { success: true; data: ReviewViewResponse }
  | { success: false; error: string };

export type UpdateReviewResult =
  | { success: true; data: ReviewViewResponse }
  | { success: false; error: string };

export type DeleteReviewResult = { success: true } | { success: false; error: string };

export async function createReviewAction(input: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<CreateReviewResult> {
  try {
    const data = await createReviewService(input);
    return { success: true, data };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Could not create review';
    if (process.env.NODE_ENV === 'development') {
      console.error('[createReviewAction]', error);
    }
    return { success: false, error };
  }
}

export async function updateReviewAction(input: {
  id: string;
  rating?: number;
  comment?: string;
}): Promise<UpdateReviewResult> {
  try {
    const data = await updateReviewService(input.id, {
      rating: input.rating,
      comment: input.comment,
    });
    return { success: true, data };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Could not update review';
    if (process.env.NODE_ENV === 'development') {
      console.error('[updateReviewAction]', error);
    }
    return { success: false, error };
  }
}

export async function deleteReviewAction(id: string): Promise<DeleteReviewResult> {
  try {
    await deleteReviewService(id);
    return { success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Could not delete review';
    if (process.env.NODE_ENV === 'development') {
      console.error('[deleteReviewAction]', error);
    }
    return { success: false, error };
  }
}
