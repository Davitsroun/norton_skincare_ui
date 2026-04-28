'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { AlertTriangle, Plus, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type StockStatus = 'Critical' | 'Low Stock' | 'In Stock';

type StockItem = {
  id: number;
  product: string;
  sku: string;
  current: number;
  minimum: number;
  status: StockStatus;
  image: string;
};

const initialStock: StockItem[] = [
  {
    id: 1,
    product: 'Premium CBD Oil',
    sku: 'CBD-001',
    current: 45,
    minimum: 100,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=50&h=50&fit=crop',
  },
  {
    id: 2,
    product: 'Hemp Tea',
    sku: 'HEMP-TEA',
    current: 320,
    minimum: 100,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1597318736231-81ad71381e39?w=50&h=50&fit=crop',
  },
  {
    id: 3,
    product: 'CBD Capsules',
    sku: 'CBD-CAP',
    current: 8,
    minimum: 50,
    status: 'Critical',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=50&h=50&fit=crop',
  },
  {
    id: 4,
    product: 'Hemp Lotion',
    sku: 'HEMP-LOT',
    current: 156,
    minimum: 100,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=50&h=50&fit=crop',
  },
];

const getStatusByStock = (current: number, minimum: number): StockStatus => {
  if (current <= minimum * 0.25) {
    return 'Critical';
  }

  if (current < minimum) {
    return 'Low Stock';
  }

  return 'In Stock';
};

export default function AdminStock() {
  const { toast } = useToast();
  const [stock, setStock] = useState(initialStock);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [restockAmount, setRestockAmount] = useState('');

  const lowStockItems = stock.filter((item) => item.current < item.minimum);
  const totalStockValue = stock.reduce((total, item) => total + item.current * 25, 0);

  const handleOpenRestockModal = (item: StockItem | null) => {
    setSelectedItem(item);
    setRestockAmount('');
    setShowRestockModal(true);
  };

  const handleRestock = () => {
    const amount = Number(restockAmount);
    if (!selectedItem || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    setStock((items) =>
      items.map((item) => {
        if (item.id !== selectedItem.id) {
          return item;
        }

        const current = item.current + amount;
        return {
          ...item,
          current,
          status: getStatusByStock(current, item.minimum),
        };
      })
    );

    toast({
      title: 'Stock Updated',
      description: `${selectedItem.product} stock increased by ${amount} units.`,
    });
    setShowRestockModal(false);
    setSelectedItem(null);
    setRestockAmount('');
  };

  return (
    <AdminPageShell title="Stock Management" description="Monitor and manage inventory levels">
      {lowStockItems.length > 0 && (
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
          <div>
            <h3 className="mb-1 font-semibold text-red-900">Low Stock Alert</h3>
            <p className="text-sm text-red-700">
              {lowStockItems.length} product(s) have fallen below minimum stock levels. Please reorder soon.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm text-gray-600">Total Products</p>
          <p className="mb-2 text-3xl font-bold text-gray-900">{stock.length}</p>
          <p className="text-xs text-gray-500">Across active inventory</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm text-gray-600">Total Stock Value</p>
          <p className="mb-2 text-3xl font-bold text-gray-900">
            ${totalStockValue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Estimated at $25 per unit</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-red-600">Low Stock Items</p>
          <p className="mb-2 text-3xl font-bold text-red-700">{lowStockItems.length}</p>
          <p className="text-xs text-red-600">Require immediate attention</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900">Inventory List</h2>
          <button
            type="button"
            onClick={() => handleOpenRestockModal(stock[0] ?? null)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Restock
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">SKU</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Current Stock</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Minimum Level</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    item.status === 'Critical' ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.product}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <p className="font-semibold text-gray-900">{item.product}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.sku}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{item.current}</p>
                    {item.current < item.minimum && (
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.minimum}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'Low Stock'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.status === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                      {item.status === 'Low Stock' && <TrendingDown className="h-3 w-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleOpenRestockModal(item)}
                      className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900">Update Stock</h3>
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {selectedItem && (
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.product}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedItem.product}</p>
                    <p className="text-sm text-gray-600">Current: {selectedItem.current} units</p>
                  </div>
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestock}
                className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
