'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { useState } from 'react';
import { Search, Shield, AlertCircle, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockAdminUsers } from '@/lib/mock-data/index';

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState(mockAdminUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (userId: number) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'Active' ? 'Inactive' : 'Active';
    setUsers(users.map(u =>
      u.id === userId ? { ...u, status: newStatus } : u
    ));
    toast({
      title: 'Status Updated',
      description: `${user?.name} is now ${newStatus}.`,
    });
  };

  const handleChangeRole = (
    userId: number,
    newRole: (typeof users)[number]['role']
  ) => {
    const user = users.find(u => u.id === userId);
    if (user && user.role !== newRole) {
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast({
        title: 'Role Changed',
        description: `${user?.name} role changed to ${newRole}.`,
      });
    }
  };

  return (
    <AdminPageShell title="Users" description="Manage user accounts and permissions">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center gap-2">
                {['All', 'Active', 'Inactive'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter === 'All' ? 'all' : filter.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      (filter === 'All' && statusFilter === 'all') || 
                      (filter !== 'All' && statusFilter === filter.toLowerCase())
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Orders</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <p className="font-semibold text-gray-900">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700">{user.joined}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.orders}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleChangeRole(user.id, e.target.value as (typeof users)[number]['role'])
                        }
                        className="flex items-center gap-2 text-gray-700 bg-transparent border border-gray-300 rounded-lg px-2 py-1 cursor-pointer text-sm"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alert(`Viewing details for ${user.name}`)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {filteredUsers.length} of {mockAdminUsers.length} users</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Â«</button>
              <button className="px-3 py-2 border border-primary bg-primary text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Â»</button>
            </div>
          </div>
        </div>
      </AdminPageShell>
  );
}

