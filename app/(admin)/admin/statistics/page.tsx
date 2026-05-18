'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { getAdminRevenueChartAction, getAdminStatisticsAction } from '@/actions/admin-actions';
import { chartMonthLabel, formatAdminCurrency } from '@/lib/admin-format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Package, DollarSign, Users, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function AdminStatistics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<{
    totalUsers?: number;
    totalProducts?: number;
    totalOrders?: number;
  } | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [statsRes, chartRes] = await Promise.all([
      getAdminStatisticsAction(),
      getAdminRevenueChartAction(),
    ]);

    if (!statsRes.success || !statsRes.data) {
      setError(statsRes.error ?? 'Could not load statistics overview.');
      setOverview(null);
    } else {
      setError(null);
      setOverview(statsRes.data);
    }

    if (chartRes.success && chartRes.data?.length) {
      setMonthlyRevenue(
        chartRes.data.map((p) => ({
          month: chartMonthLabel(p.periodStart),
          revenue: p.revenue,
        })),
      );
    } else {
      setMonthlyRevenue([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminPageShell title="Statistics" description="Analytics from the admin API">
      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-8 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading…
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {!loading && overview && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="mb-1 text-sm text-gray-600">Total orders (reporting)</p>
            <p className="text-3xl font-bold text-gray-900">{overview.totalOrders ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <p className="mb-1 text-sm text-gray-600">Total products</p>
            <p className="text-3xl font-bold text-gray-900">{overview.totalProducts ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="mb-1 text-sm text-gray-600">Total users</p>
            <p className="text-3xl font-bold text-gray-900">{overview.totalUsers ?? '—'}</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Monthly revenue</h2>
          {monthlyRevenue.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              No revenue chart data. Ensure `/admin/dashboard/revenue-chart` returns points.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip formatter={(value: number) => formatAdminCurrency(value)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {!loading && (
        <p className="mt-6 text-center text-xs text-gray-400">
          Category breakdown and top products require additional backend endpoints.
        </p>
      )}
    </AdminPageShell>
  );
}
