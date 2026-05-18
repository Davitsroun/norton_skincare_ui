'use client';

import type { AdminProductRow } from '@/types/admin-api';

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20';

type AdminProductStockModalProps = {
  product: AdminProductRow;
  quantityToAdd: string;
  onQuantityChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function AdminProductStockModal(props: AdminProductStockModalProps) {
  const { product, quantityToAdd, onQuantityChange, onClose, onSubmit } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900">Add stock</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </header>

        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-600">{product.name}</p>
          <p className="text-xs text-gray-500">Current: {product.stockQuantity} units</p>
          <input
            type="number"
            min={1}
            placeholder="Quantity to add"
            value={quantityToAdd}
            onChange={(e) => onQuantityChange(e.target.value)}
            className={fieldClass}
          />
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Update stock
          </button>
        </footer>
      </div>
    </div>
  );
}
