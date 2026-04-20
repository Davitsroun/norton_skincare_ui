'use client';

import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { mockOrderHistory } from '@/lib/mock-data';
import { ChevronDown, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

type OrderStatus = 'all' | 'completed' | 'pending' | 'shipped' | 'cancelled';

export default function HistoryPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  const filteredOrders =
    selectedStatus === 'all'
      ? mockOrderHistory
      : mockOrderHistory.filter((order) => order.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'shipped':
        return '📦';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  const summaryStats = [
    {
      label: 'Total Orders',
      value: mockOrderHistory.length,
    },
    {
      label: 'Completed',
      value: mockOrderHistory.filter((o) => o.status === 'completed').length,
    },
    {
      label: 'In Transit',
      value: mockOrderHistory.filter((o) => o.status === 'shipped').length,
    },
    {
      label: 'Total Spent',
      value: `₹${mockOrderHistory.reduce((sum, o) => sum + o.total, 0)}`,
    },
  ];

  return (
    <ProtectedRoute>
      <Navigation />

      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            View and manage all your orders with Nature Leaf
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'completed', 'pending', 'shipped', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as OrderStatus)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      selectedStatus === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                {/* Order Header */}
                <button
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order {order.id}
                        </p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}{' '}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items.length} item
                      {order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{order.total}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-gray-600 mt-1">
                        Track: {order.trackingNumber}
                      </p>
                    )}
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedOrder === order.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {/* Order Items */}
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Order Items
                    </h3>
                    <div className="space-y-4 mb-6">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                        >
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-20 h-20 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: ₹{item.price} each
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>₹{order.total * 0.9}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span>₹50</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span>₹{(order.total * 0.18).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>

                    {/* Tracking & Actions */}
                    {order.trackingNumber && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-200/50 backdrop-blur-sm">
                        <p className="text-sm text-blue-900 mb-2">
                          <strong>Tracking Number:</strong> <span className="font-mono bg-white px-2 py-1 rounded">{order.trackingNumber}</span>
                        </p>
                        <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                          Track Your Package →
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {order.status === 'completed' && (
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-semibold hover:from-primary/90 hover:to-primary transition-all shadow-sm">
                          Buy Again
                        </button>
                      )}
                      <button className="flex-1 px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all">
                        View Invoice
                      </button>
                      {order.status !== 'cancelled' && (
                        <button className="flex-1 px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
              <p className="text-gray-600 mb-4">No orders found</p>
              <a
                href="/shop"
                className="inline-block bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-2 rounded-lg font-semibold hover:from-primary/90 hover:to-primary transition-all"
              >
                Continue Shopping →
              </a>
            </div>
          )}
        </div>

      </div>
      </div>
    </ProtectedRoute>
  );
}
