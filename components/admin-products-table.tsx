'use client';

import type { AdminProductRow } from '@/types/admin-api';
import {
  ADMIN_PRODUCT_IMAGE_FALLBACK,
  adminProductPrimaryImage,
  availabilityFromStock,
  stockQuantityBadge,
} from '@/lib/admin-products';
import { formatAdminCurrency } from '@/lib/admin-format';
import { Edit2, Loader2, Trash2 } from 'lucide-react';

type AdminProductsTableProps = {
  rows: AdminProductRow[];
  loading: boolean;
  getCategoryLabel: (row: AdminProductRow) => string;
  onEdit: (row: AdminProductRow) => void;
  onRestock: (row: AdminProductRow) => void;
  onDelete: (id: string) => void;
};

export function AdminProductsTable(props: AdminProductsTableProps) {
  const { rows, loading, getCategoryLabel, onEdit, onRestock, onDelete } = props;

  if (loading) {
    return (
      <div className="flex justify-center gap-2 py-16 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading…
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="px-6 py-4 text-left font-semibold text-gray-700">Product</th>
          <th className="px-6 py-4 text-left font-semibold text-gray-700">Category</th>
          <th className="px-6 py-4 text-left font-semibold text-gray-700">Price</th>
          <th className="px-6 py-4 text-left font-semibold text-gray-700">Stock</th>
          <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
          <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((product) => {
          const qtyBadge = stockQuantityBadge(product.stockQuantity);
          const avail = availabilityFromStock(product.stockQuantity);
          return (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={adminProductPrimaryImage(product) || ADMIN_PRODUCT_IMAGE_FALLBACK}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    {/* <p className="text-xs text-gray-500">{product.id}</p> */}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-700">{getCategoryLabel(product)}</td>
              <td className="px-6 py-4 font-semibold text-gray-900">
                {formatAdminCurrency(product.price)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${qtyBadge.className}`}
                >
                  {qtyBadge.text}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${avail.className}`}
                >
                  {avail.label}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="rounded-lg p-2 hover:bg-gray-200"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRestock(product)}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    + Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product.id)}
                    className="rounded-lg p-2 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
