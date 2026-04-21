'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useState } from 'react';
import { Search, ChevronDown, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockAdminOrders } from '@/lib/mock-data/index';

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(mockAdminOrders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      setOrders(orders.filter(order => order.id !== orderToDelete));
      toast({
        title: 'Order Deleted',
        description: `Order ${orderToDelete} has been successfully deleted.`,
      });
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status !== newStatus) {
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast({
        title: 'Status Updated',
        description: `Order ${orderId} status changed to ${newStatus}.`,
      });
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  return (
    <AdminPageShell title="Orders" description="Manage all customer orders">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Header with Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{filteredOrders.length} orders found</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex items-center gap-2">
                  {['All orders', 'Pending', 'Dispatched', 'Completed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter === 'All orders' ? 'all' : filter.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        (filter === 'All orders' && statusFilter === 'all') || 
                        (filter !== 'All orders' && statusFilter === filter.toLowerCase())
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <span className="text-gray-400">to</span>
                  <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    <input 
                      type="checkbox" 
                      className="rounded cursor-pointer"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 flex items-center gap-1">
                    Date <ChevronDown className="w-4 h-4" />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 flex items-center gap-1">
                    Price <ChevronDown className="w-4 h-4" />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedOrders.includes(order.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded cursor-pointer"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.avatar}
                          alt={order.customer}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.address}</td>
                    <td className="px-6 py-4 text-gray-700">{order.date}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                          order.status === 'Dispatched' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {filteredOrders.length} of {mockAdminOrders.length} orders</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Â«</button>
              <button className="px-3 py-2 border border-primary bg-primary text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Â»</button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title="Delete Order"
          description={`Are you sure you want to delete order ${orderToDelete}? This action cannot be undone.`}
          cancelText="Cancel"
          confirmText="Delete Order"
          isDangerous={true}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDeleteOrder}
        />
      </AdminPageShell>
  );
}

