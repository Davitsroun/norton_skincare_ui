'use server';

import {
  createAdminProductService,
  deleteAdminProductService,
  getAdminDashboardSummaryService,
  getAdminRecentOrdersService,
  getAdminRevenueChartService,
  getAdminStatisticsService,
  listAdminOrdersService,
  listAdminProductsService,
  listAdminUsersService,
  listCategoriesPublicService,
  patchAdminOrderStatusService,
  updateAdminProductService,
} from '@/service/admin-service';
import type {
  AdminCategoryOption,
  AdminDashboardSummary,
  AdminOrderRow,
  AdminPaginationResponse,
  AdminPatchOrderStatusBody,
  AdminProductRow,
  AdminProductUpsertBody,
  AdminRevenueChartPoint,
  AdminStatisticsOverview,
  AdminUserRow,
} from '@/types/admin-api';
import { da } from 'date-fns/locale';

export type AdminActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getAdminDashboardSummaryAction(): Promise<
  AdminActionResult<AdminDashboardSummary>
> {
  try {
    const data = await getAdminDashboardSummaryService();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load dashboard summary.';
    return { success: false, error: message };
  }
}

export async function getAdminRevenueChartAction(params?: {
  from?: string;
  to?: string;
}): Promise<AdminActionResult<AdminRevenueChartPoint[]>> {
  try {
    const data = await getAdminRevenueChartService(params);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load revenue chart.';
    return { success: false, error: message };
  }
}

export async function getAdminRecentOrdersAction(
  limit = 10
): Promise<AdminActionResult<AdminOrderRow[]>> {
  try {
    const data = await getAdminRecentOrdersService(limit);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load recent orders.';
    return { success: false, error: message };
  }
}

export async function listAdminOrdersAction(params: {
  page: number;
  size: number;
  status?: string;
}): Promise<
  AdminActionResult<{ items: AdminOrderRow[]; pagination: AdminPaginationResponse }>
> {
  try {
    const data = await listAdminOrdersService(params);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load orders.';
    return { success: false, error: message };
  }
}

export async function patchAdminOrderStatusAction(
  orderId: string,
  body: AdminPatchOrderStatusBody
): Promise<AdminActionResult<void>> {
  try {
    await patchAdminOrderStatusService(orderId, body);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update order.';
    return { success: false, error: message };
  }
}

export async function listAdminUsersAction(params: {
  page: number;
  size: number;
}): Promise<
  AdminActionResult<{ items: AdminUserRow[]; pagination: AdminPaginationResponse }>
> {
  try {
    const data = await listAdminUsersService(params);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load users.';
    return { success: false, error: message };
  }
}

export async function listAdminProductsAction(params: {
  page: number;
  size: number;
}): Promise<
  AdminActionResult<{ items: AdminProductRow[]; pagination: AdminPaginationResponse }>
> {
  try {
    const data = await listAdminProductsService(params);
    console.log('data',data)
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load products.';
    return { success: false, error: message };
  }
}

export async function createAdminProductAction(
  body: AdminProductUpsertBody
): Promise<AdminActionResult<unknown>> {
  try {
    const data = await createAdminProductService(body);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create product.';
    return { success: false, error: message };
  }
}

export async function updateAdminProductAction(
  id: string,
  body: AdminProductUpsertBody
): Promise<AdminActionResult<unknown>> {
  try {
    const data = await updateAdminProductService(id, body);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update product.';
    return { success: false, error: message };
  }
}

export async function deleteAdminProductAction(id: string): Promise<AdminActionResult<void>> {
  try {
    await deleteAdminProductService(id);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to delete product.';
    return { success: false, error: message };
  }
}

export async function getAdminStatisticsAction(): Promise<
  AdminActionResult<AdminStatisticsOverview>
> {
  try {
    const data = await getAdminStatisticsService();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load statistics.';
    return { success: false, error: message };
  }
}

export async function listCategoriesPublicAction(): Promise<
  AdminActionResult<AdminCategoryOption[]>
> {
  try {
    const data = await listCategoriesPublicService();
    return { success: true, data };
  } catch {
    return { success: true, data: [] };
  }
}
