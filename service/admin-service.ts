import { getKeycloakToken } from '@/constant/token';
import { adminRoute } from '@/route/admin';
import { categoryRoute } from '@/route/category';
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function readJsonOrEmpty(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

function throwIfEnvelopeFailed(raw: unknown): void {
  if (!isRecord(raw)) {
    return;
  }
  if (raw.success === false) {
    const msg = typeof raw.message === 'string' ? raw.message : 'Request failed.';
    throw new Error(msg);
  }
  if (typeof raw.error === 'string' && raw.error.trim() !== '') {
    throw new Error(raw.error);
  }
}

/** Read `payload` from standard `ApiResponse<T>`. */
function parsePayload<T>(raw: unknown): T {
  throwIfEnvelopeFailed(raw);
  if (!isRecord(raw)) {
    throw new Error('Invalid API response.');
  }
  if (raw.payload === undefined || raw.payload === null) {
    throw new Error(
      typeof raw.message === 'string' && raw.message.length > 0
        ? raw.message
        : 'Missing payload in response.',
    );
  }
  return raw.payload as T;
}

/** Paginated list: either root `items` + `paginationResponse` or nested under `payload`. */
function parsePaginated<T>(raw: unknown): { items: T[]; pagination: AdminPaginationResponse } {
  throwIfEnvelopeFailed(raw);
  if (!isRecord(raw)) {
    throw new Error('Invalid API response.');
  }

  const tryBlock = (
    block: unknown
  ): { items: T[]; pagination: AdminPaginationResponse } | null => {
    if (!isRecord(block)) {
      return null;
    }
    const items = block.items;
    if (!Array.isArray(items)) {
      return null;
    }
    const paginationResponse = block.paginationResponse;
    if (isRecord(paginationResponse)) {
      return { items: items as T[], pagination: paginationResponse as AdminPaginationResponse };
    }
    return {
      items: items as T[],
      pagination: {
        totalElements: items.length,
        currentPage: 0,
        pageSize: Math.max(items.length, 1),
        totalPages: 1,
      },
    };
  };

  const direct = tryBlock(raw);
  if (direct) {
    return direct;
  }

  if ('payload' in raw && raw.payload !== undefined) {
    const nested = tryBlock(raw.payload);
    if (nested) {
      return nested;
    }
  }

  throw new Error(
    typeof raw.message === 'string' ? raw.message : 'Unexpected paginated list shape.',
  );
}

async function authHeadersGet(): Promise<HeadersInit> {
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }
  return {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function authHeadersJson(): Promise<HeadersInit> {
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminDashboardSummaryService(): Promise<AdminDashboardSummary> {
  const response = await fetch(adminRoute.dashboardSummary(), {
    method: 'GET',
    cache: 'no-store',
    headers: await authHeadersGet(),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Dashboard summary failed (${response.status})`,
    );
  }
  return parsePayload<AdminDashboardSummary>(raw);
}

export async function getAdminRevenueChartService(params?: {
  from?: string;
  to?: string;
}): Promise<AdminRevenueChartPoint[]> {
  const response = await fetch(adminRoute.dashboardRevenueChart(params), {
    method: 'GET',
    cache: 'no-store',
    headers: await authHeadersGet(),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Revenue chart failed (${response.status})`,
    );
  }
  const payload = parsePayload<unknown>(raw);
  return Array.isArray(payload) ? (payload as AdminRevenueChartPoint[]) : [];
}

export async function getAdminRecentOrdersService(limit = 10): Promise<AdminOrderRow[]> {
  const response = await fetch(adminRoute.dashboardRecentOrders(limit), {
    method: 'GET',
    cache: 'no-store',
    headers: await authHeadersGet(),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Recent orders failed (${response.status})`,
    );
  }
  const payload = parsePayload<unknown>(raw);
  return Array.isArray(payload) ? (payload as AdminOrderRow[]) : [];
}

export async function listAdminOrdersService(params: {
  page: number;
  size: number;
  status?: string;
}): Promise<{ items: AdminOrderRow[]; pagination: AdminPaginationResponse }> {
  const response = await fetch(
    adminRoute.orders({
      page: params.page,
      size: params.size,
      status: params.status,
    }),
    {
      method: 'GET',
      cache: 'no-store',
      headers: await authHeadersGet(),
    },
  );
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Admin orders failed (${response.status})`,
    );
  }
  return parsePaginated<AdminOrderRow>(raw);
}

export async function patchAdminOrderStatusService(
  orderId: string,
  body: AdminPatchOrderStatusBody
): Promise<void> {
  const response = await fetch(adminRoute.orderStatus(orderId), {
    method: 'PATCH',
    cache: 'no-store',
    headers: await authHeadersJson(),
    body: JSON.stringify(body),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Update order status failed (${response.status})`,
    );
  }
}

export async function listAdminUsersService(params: {
  page: number;
  size: number;
}): Promise<{ items: AdminUserRow[]; pagination: AdminPaginationResponse }> {
  const response = await fetch(adminRoute.users({ page: params.page, size: params.size }), {
    method: 'GET',
    cache: 'no-store',
    headers: await authHeadersGet(),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Admin users failed (${response.status})`,
    );
  }
  return parsePaginated<AdminUserRow>(raw);
}

export async function listAdminProductsService(params: {
  page: number;
  size: number;
}): Promise<{ items: AdminProductRow[]; pagination: AdminPaginationResponse }> {
  const response = await fetch(adminRoute.products({ page: params.page, size: params.size }), {
    method: 'GET',
    cache: 'no-store',
    headers: await authHeadersGet(),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Admin products failed (${response.status})`,
    );
  }
  return parsePaginated<AdminProductRow>(raw);
}

export async function createAdminProductService(body: AdminProductUpsertBody): Promise<unknown> {
  const response = await fetch(adminRoute.products(), {
    method: 'POST',
    cache: 'no-store',
    headers: await authHeadersJson(),
    body: JSON.stringify(body),
  });
  const raw = await readJsonOrEmpty(response);
  throwIfEnvelopeFailed(raw);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Create product failed (${response.status})`,
    );
  }
  return raw;
}

export async function updateAdminProductService(
  id: string,
  body: AdminProductUpsertBody
): Promise<unknown> {
  const response = await fetch(adminRoute.productById(id), {
    method: 'PUT',
    cache: 'no-store',
    headers: await authHeadersJson(),
    body: JSON.stringify(body),
  });
  const raw = await readJsonOrEmpty(response);
  throwIfEnvelopeFailed(raw);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Update product failed (${response.status})`,
    );
  }
  return raw;
}

export async function deleteAdminProductService(id: string): Promise<void> {
  const response = await fetch(adminRoute.productById(id), {
    method: 'DELETE',
    cache: 'no-store',
    headers: await authHeadersGet(),
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : `Delete product failed (${response.status})`,
    );
  }
}

export async function getAdminStatisticsService(): Promise<AdminStatisticsOverview> {
  const headers = await authHeadersGet();

  async function tryFetch(
    url: string
  ): Promise<{ ok: boolean; raw: unknown; status: number }> {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers,
    });
    const raw = await readJsonOrEmpty(response);
    return { ok: response.ok, raw, status: response.status };
  }

  let { ok, raw } = await tryFetch(adminRoute.statistics());
  if (!ok) {
    const second = await tryFetch(adminRoute.statisticsOverview());
    ok = second.ok;
    raw = second.raw;
  }

  if (!ok) {
    throw new Error(
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : 'Statistics request failed.',
    );
  }

  try {
    return parsePayload<AdminStatisticsOverview>(raw);
  } catch {
    throwIfEnvelopeFailed(raw);
    if (isRecord(raw) && isRecord(raw.payload)) {
      return raw.payload as AdminStatisticsOverview;
    }
    throw new Error('Unexpected statistics shape.');
  }
}

/** Public GET /categories — optional for product forms. */
export async function listCategoriesPublicService(): Promise<AdminCategoryOption[]> {
  const response = await fetch(categoryRoute.list(), {
    method: 'GET',
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });
  const raw = await readJsonOrEmpty(response);
  if (!response.ok) {
    return [];
  }

  if (Array.isArray(raw)) {
    return (raw as unknown[]).filter(isRecord).map((r) => ({
      id: String(r.id ?? ''),
      name: typeof r.name === 'string' ? r.name : String(r.id ?? ''),
    }));
  }

  if (!isRecord(raw)) {
    return [];
  }

  if (Array.isArray(raw.payload)) {
    return (raw.payload as unknown[]).filter(isRecord).map((r) => ({
      id: String(r.id ?? ''),
      name: typeof r.name === 'string' ? r.name : String(r.id ?? ''),
    }));
  }

  return [];
}
