'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import {
  listAdminOrdersAction,
  patchAdminOrderStatusAction,
} from '@/actions/admin-actions';
import type { AdminOrderRow } from '@/types/admin-api';
import {
  adminOrderFilterToQuery,
  apiOrderStatusToPatchValue,
  formatAdminCurrency,
  type AdminOrderStatusFilter,
  type PatchOrderStatusValue,
} from '@/lib/admin-format';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 10;

function selectStylesForPatch(patch: PatchOrderStatusValue): string {
  if (patch === 'pending') {
    return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
  }
  if (patch === 'shipped') {
    return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
  }
  return 'bg-green-100 text-green-700 hover:bg-green-200';
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    currentPage: 0,
    pageSize: PAGE_SIZE,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setListError(null);
    const statusQuery = adminOrderFilterToQuery(statusFilter);
    const result = await listAdminOrdersAction({
      page,
      size: PAGE_SIZE,
      status: statusQuery,
    });
    if (!result.success || !result.data) {
      setListError(result.error ?? 'Could not load orders.');
      setOrders([]);
      setLoading(false);
      return;
    }
    setOrders(result.data.items);
    setPagination(result.data.pagination);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return true;
    }
    return (
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q)
    );
  });

  const handleStatusChange = async (orderId: string, newPatch: PatchOrderStatusValue) => {
    const prev = orders;
    setOrders((rows) =>
      rows.map((o) =>
        o.id === orderId ? { ...o, status: newPatch.toUpperCase() } : o,
      ),
    );
    const res = await patchAdminOrderStatusAction(orderId, { status: newPatch });
    if (!res.success) {
      setOrders(prev);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: res.error ?? 'Could not update order status.',
      });
      return;
    }
    toast({
      title: 'Status updated',
      description: `Order ${orderId} is now ${newPatch}.`,
    });
    void loadOrders();
  };

  const filterChip = (label: string, filter: AdminOrderStatusFilter) => {
    const active =
      filter === 'all'
        ? statusFilter === 'all'
        : statusFilter === filter;
    return (
      <button
        type="button"
        key={label}
        onClick={() => setStatusFilter(filter)}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
          active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <AdminPageShell title="Orders" description="Manage all customer orders">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-900">
                {loading ? '…' : `${pagination.totalElements} orders`}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                {filterChip('All orders', 'all')}
                {filterChip('Pending', 'pending')}
                {filterChip('Dispatched', 'dispatched')}
                {filterChip('Completed', 'completed')}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, email, or order ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {listError && (
          <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-800">
            {listError}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading orders…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      Date <ChevronDown className="h-4 w-4 opacity-40" />
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const patchValue = apiOrderStatusToPatchValue(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              order.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(order.customerName)}`
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                            <p className="text-xs text-gray-400">{order.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-gray-700">
                        {order.deliveryAddress}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(order.placedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatAdminCurrency(order.totalAmount, order.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={patchValue}
                          onChange={(e) =>
                            void handleStatusChange(
                              order.id,
                              e.target.value as PatchOrderStatusValue,
                            )
                          }
                          className={`cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-semibold transition-all ${selectStylesForPatch(patchValue)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Dispatched</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredOrders.length === 0 && !listError && (
          <p className="py-12 text-center text-sm text-gray-500">No orders match this view.</p>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page {pagination.currentPage + 1} of {Math.max(1, pagination.totalPages)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={loading || page >= pagination.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
