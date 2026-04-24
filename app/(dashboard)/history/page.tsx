'use client';

import { PageHeader } from '@/components/page-header';
import { ProtectedRoute } from '@/components/protected-route';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { mockOrderHistory } from '@/lib/mock-data/index';
import { ChevronDown, Package } from 'lucide-react';
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
      cardClass:
        'border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-white to-secondary/30',
      valueClass: 'text-primary',
    },
    {
      label: 'Completed',
      value: mockOrderHistory.filter((o) => o.status === 'completed').length,
      cardClass:
        'border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50',
      valueClass: 'text-emerald-800',
    },
    {
      label: 'In Transit',
      value: mockOrderHistory.filter((o) => o.status === 'shipped').length,
      cardClass:
        'border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/50',
      valueClass: 'text-sky-800',
    },
    {
      label: 'Total Spent',
      value: `$${mockOrderHistory.reduce((sum, o) => sum + o.total, 0)}`,
      cardClass:
        'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40',
      valueClass: 'text-amber-900',
    },
  ] as const;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          icon={Package}
          eyebrow="Your orders"
          titleBefore="Order"
          titleGradient="History"
          description={
            <>
              View and manage all your orders with{' '}
              <span className="font-medium text-primary">Nature Leaf</span>
            </>
          }
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border border-gray-200/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${stat.cardClass}`}
            >
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.valueClass}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="rounded-2xl border border-primary/20 bg-white/80 p-6 mb-8 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'completed', 'pending', 'shipped', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as OrderStatus)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedStatus === status
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'bg-secondary/80 text-gray-700 hover:bg-secondary border border-transparent hover:border-primary/20'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Action Buttons */}
            {/* <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div> */}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-gray-200/90 bg-white/90 shadow-md transition-all duration-300 hover:border-primary/25 hover:shadow-lg"
              >
                {/* Order Header */}
                <button
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                  className="flex w-full items-center justify-between p-6 transition-colors hover:bg-gradient-to-r hover:from-primary/[0.06] hover:to-transparent"
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

                  <div className="mr-4 text-right">
                    <p className="text-lg font-bold text-primary">
                      ${order.total}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-gray-600 mt-1">
                        Track: {order.trackingNumber}
                      </p>
                    )}
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${
                      expandedOrder === order.id
                        ? 'rotate-180 text-primary'
                        : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-primary/10 bg-gradient-to-b from-secondary/40 to-gray-50/80 p-6">
                    {/* Order Items */}
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <span className="h-1 w-6 rounded-full bg-primary" aria-hidden />
                      Order items
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
                              Price: ${item.price} each
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>${order.total * 0.9}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span>$50</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span>${(order.total * 0.18).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${order.total}</span>
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
            <div className="rounded-2xl border border-dashed border-primary/30 bg-secondary/40 p-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-primary/60" aria-hidden />
              <p className="mb-4 text-gray-600">No orders match this filter.</p>
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
