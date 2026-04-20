'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const categoryData = [
  { name: 'Oils', value: 35, color: '#3b82f6' },
  { name: 'Capsules', value: 25, color: '#10b981' },
  { name: 'Teas', value: 20, color: '#f59e0b' },
  { name: 'Creams', value: 20, color: '#ef4444' },
];

const monthlyData = [
  { month: 'Jan', revenue: 4000, users: 240 },
  { month: 'Feb', revenue: 3000, users: 221 },
  { month: 'Mar', revenue: 2000, users: 229 },
  { month: 'Apr', revenue: 2780, users: 200 },
  { month: 'May', revenue: 1890, users: 229 },
  { month: 'Jun', revenue: 2390, users: 200 },
];

export default function AdminStatistics() {
  return (
    <AdminPageShell title="Statistics" description="View detailed analytics and reports">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+15.3%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">$124,580</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+8.2%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">2,543</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+12.5%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">8,234</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+5.8%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-900">3.24%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Sales</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Revenue</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Growth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: 'Premium CBD Oil', sales: 345, revenue: '$17,250', growth: '+23.5%' },
                  { product: 'Hemp Tea', sales: 298, revenue: '$5,962', growth: '+18.2%' },
                  { product: 'CBD Capsules', sales: 256, revenue: '$10,240', growth: '+12.8%' },
                ].map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.product}</td>
                    <td className="px-6 py-4 text-gray-700">{item.sales}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{item.revenue}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{item.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminPageShell>
  );
}

