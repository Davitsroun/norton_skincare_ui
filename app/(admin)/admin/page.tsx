'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import {
  getAdminDashboardSummaryAction,
  getAdminRecentOrdersAction,
  getAdminRevenueChartAction,
} from '@/actions/admin-actions';
import {
  chartMonthLabel,
  formatAdminCurrency,
} from '@/lib/admin-format';
import { useAuth } from '@/lib/auth-context';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ShieldCheck,
  User,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const displayName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
    user?.username ||
    'Admin User';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    growthRatePercent: number;
    ordersDeltaPercent: number;
    usersDeltaPercent: number;
  } | null>(null);
  const [chartRows, setChartRows] = useState<{ month: string; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<
    {
      id: string;
      customerName: string;
      totalAmount: number;
      currency: string;
      status: string;
      placedAt: string;
    }[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [sumRes, chartRes, recentRes] = await Promise.all([
      getAdminDashboardSummaryAction(),
      getAdminRevenueChartAction(),
      getAdminRecentOrdersAction(10),
    ]);

    if (!sumRes.success || !sumRes.data) {
      setError(sumRes.error ?? 'Could not load dashboard summary.');
      setLoading(false);
      return;
    }
    setSummary(sumRes.data);

    if (chartRes.success && chartRes.data?.length) {
      setChartRows(
        chartRes.data.map((p) => ({
          month: chartMonthLabel(p.periodStart),
          revenue: p.revenue,
        })),
      );
    } else {
      setChartRows([]);
    }

    if (!recentRes.success) {
      setRecentOrders([]);
    } else {
      setRecentOrders(recentRes.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats =
    summary &&
    ([
      {
        label: 'Total Revenue',
        value: formatAdminCurrency(summary.totalRevenue),
        change: `${summary.growthRatePercent >= 0 ? '+' : ''}${summary.growthRatePercent.toFixed(1)}%`,
        icon: <DollarSign className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600',
      },
      {
        label: 'Total Orders',
        value: String(summary.totalOrders),
        change: `${summary.ordersDeltaPercent >= 0 ? '+' : ''}${summary.ordersDeltaPercent.toFixed(1)}%`,
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'from-green-500 to-green-600',
      },
      {
        label: 'Total Users',
        value: String(summary.totalUsers),
        change: `${summary.usersDeltaPercent >= 0 ? '+' : ''}${summary.usersDeltaPercent.toFixed(1)}%`,
        icon: <Users className="w-6 h-6" />,
        color: 'from-purple-500 to-purple-600',
      },
      {
        label: 'Growth Rate',
        value: `${summary.growthRatePercent.toFixed(1)}%`,
        change: `${summary.usersDeltaPercent >= 0 ? '+' : ''}${summary.usersDeltaPercent.toFixed(1)}% users`,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'from-orange-500 to-orange-600',
      },
    ] as const);

  return (
    <AdminPageShell title="Dashboard" description="Welcome to Nature Leaf Admin Panel">
      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-8 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading dashboard…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-sm text-gray-600">{user?.email || 'No email available'}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Username: {user?.username || 'not set'}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700 sm:self-auto">
                <ShieldCheck className="h-4 w-4" />
                {user?.isAdmin ? 'Administrator' : 'User'}
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(stats ?? []).map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-lg bg-gradient-to-r ${stat.color} p-3 text-white`}>
                    {stat.icon}
                  </div>
                  <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                </div>
                <p className="mb-1 text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Revenue overview</h2>
              {chartRows.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">No chart data from the API yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Revenue trend</h2>
              {chartRows.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">No chart data from the API yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Recent orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Order ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No recent orders.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-gray-700">{order.customerName}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatAdminCurrency(order.totalAmount, order.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(order.placedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminPageShell>
  );
}
