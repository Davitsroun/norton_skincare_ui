'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { listAdminUsersAction } from '@/actions/admin-actions';
import type { AdminUserRow } from '@/types/admin-api';
import { Search, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    currentPage: 0,
    pageSize: PAGE_SIZE,
    totalPages: 1,
  });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listAdminUsersAction({ page, size: PAGE_SIZE });
    if (!result.success || !result.data) {
      setError(result.error ?? 'Could not load users.');
      setUsers([]);
      setLoading(false);
      return;
    }
    setUsers(result.data.items);
    setPagination(result.data.pagination);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q);
    const st = user.status.toUpperCase();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && st === 'ACTIVE') ||
      (statusFilter === 'inactive' && st !== 'ACTIVE');
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminPageShell title="Users" description="Manage user accounts (read-only from API)">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-md flex-1">
              <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Active', 'Inactive'] as const).map((label) => {
                const key = label.toLowerCase() as 'all' | 'active' | 'inactive';
                const active = statusFilter === key;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center gap-2 py-16 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading users…
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Orders</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                          }
                          alt=""
                          className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover"
                        />
                        <p className="font-semibold text-gray-900">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.orderCount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status.toUpperCase() === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredUsers.length === 0 && !error && (
          <p className="py-12 text-center text-sm text-gray-500">No users in this view.</p>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page {pagination.currentPage + 1} of {Math.max(1, pagination.totalPages)} ·{' '}
            {pagination.totalElements} users
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
