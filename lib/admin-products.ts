import type { AdminCategoryOption, AdminProductRow, AdminProductUpsertBody } from '@/types/admin-api';

/** Keep in sync with `GET /api/v1/admin/products` paging. */
export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

export const ADMIN_PRODUCT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=80&h=80&fit=crop';

/** Form fields stay as strings until submit (controlled inputs). */
export type AdminProductFormState = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  categoryId: string;
  brandId: string;
};

export function emptyAdminProductForm(): AdminProductFormState {
  return {
    name: '',
    description: '',
    price: '',
    stockQuantity: '0',
    imageUrl: '',
    categoryId: '',
    brandId: '',
  };
}

/** Resolved picture URL regardless of backend field name (`image` vs `imageUrl`). */
export function adminProductPrimaryImage(row: AdminProductRow): string {
  const raw = row.image ?? row.imageUrl ?? '';
  return typeof raw === 'string' ? raw.trim() : '';
}

export function adminProductRowToForm(row: AdminProductRow): AdminProductFormState {
  return {
    name: row.name,
    description: row.description ?? '',
    price: String(row.price),
    stockQuantity: String(row.stockQuantity),
    imageUrl: adminProductPrimaryImage(row),
    categoryId: row.categoryId ?? '',
    brandId: row.brandId ?? '',
  };
}

/** Maps UI form → REST body for POST/PUT `/api/v1/admin/products`. */
export function adminProductFormToUpsertBody(form: AdminProductFormState): AdminProductUpsertBody {
  const price = Number.parseFloat(form.price);
  const stockQuantity = Number.parseInt(form.stockQuantity, 10);
  const img = form.imageUrl.trim() || null;
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    price: Number.isFinite(price) ? price : 0,
    stockQuantity: Number.isFinite(stockQuantity) ? Math.max(0, stockQuantity) : 0,
    image: img,
    imageUrl: img,
    categoryId: form.categoryId.trim() || null,
    brandId: form.brandId.trim() || null,
  };
}

export function stockQuantityBadge(qty: number): { text: string; className: string } {
  if (qty > 100) {
    return { text: `${qty} units`, className: 'bg-green-100 text-green-700' };
  }
  if (qty > 50) {
    return { text: `${qty} units`, className: 'bg-yellow-100 text-yellow-700' };
  }
  return { text: `${qty} units`, className: 'bg-red-100 text-red-700' };
}

export function availabilityFromStock(stock: number): { label: string; className: string } {
  return stock > 50
    ? { label: 'Active', className: 'bg-green-100 text-green-700' }
    : { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-700' };
}

export function resolveAdminProductCategoryLabel(
  row: AdminProductRow,
  categories: AdminCategoryOption[],
): string {
  return row.category ?? categories.find((c) => c.id === row.categoryId)?.name ?? '—';
}

export function filterAdminProductsBySearch(rows: AdminProductRow[], query: string): AdminProductRow[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return rows;
  }
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q),
  );
}
