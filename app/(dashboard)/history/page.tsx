'use client';

import { PageHeader } from '@/components/page-header';
import { ProtectedRoute } from '@/components/protected-route';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { mockOrderHistory } from '@/lib/mock-data/index';
import type { Order } from '@/lib/mock-data/types';
import { getStoredOrders } from '@/lib/order-storage';
import { ChevronDown, Package } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';

type OrderStatus = 'all' | 'completed' | 'pending' | 'shipped' | 'cancelled';

export default function HistoryPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    setSavedOrders(getStoredOrders());
    return () => clearTimeout(timer);
  }, []);

  const allOrders = useMemo(() => [...savedOrders, ...mockOrderHistory], [savedOrders]);

  const filteredOrders =
    selectedStatus === 'all'
      ? allOrders
      : allOrders.filter((order) => order.status === selectedStatus);

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

  const handleDownloadInvoice = (order: Order) => {
    const doc = new jsPDF();
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const right = pageWidth - margin;
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.max(0, order.total - subtotal);
    let y = 18;

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('INVOICE', margin, y);
    doc.setFontSize(11);
    doc.text('Nature Leaf', margin, y + 8);
    doc.text('support@natureleaf.example', margin, y + 14);

    doc.setFontSize(10);
    doc.text(`Invoice #: ${order.id}`, right, y, { align: 'right' });
    doc.text(`Date: ${order.date}`, right, y + 6, { align: 'right' });
    doc.text(`Order Status: ${order.status.toUpperCase()}`, right, y + 12, {
      align: 'right',
    });

    y = 48;
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    doc.text('Bill To', margin, y);
    doc.setFontSize(10);
    doc.text(order.customerName || 'Customer', margin, y + 7);
    doc.text(order.contactNumber || '-', margin, y + 13);
    if (order.deliveryAddress) {
      const addressLines = doc.splitTextToSize(order.deliveryAddress, 72);
      doc.text(addressLines, margin, y + 19);
    }

    doc.setFontSize(11);
    doc.text('Order Details', right - 58, y);
    doc.setFontSize(10);
    doc.text(
      `Method: ${(order.fulfillmentMethod || 'pickup').toUpperCase()}`,
      right - 58,
      y + 7
    );
    doc.text(`Payment: ${order.paymentMethod || 'N/A'}`, right - 58, y + 13);

    y = 86;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, right, y);
    y += 5;

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, right - margin, 8, 'F');
    doc.setFontSize(10);
    doc.text('Item', margin + 2, y + 5.5);
    doc.text('Qty', margin + 110, y + 5.5);
    doc.text('Unit', margin + 128, y + 5.5);
    doc.text('Total', right - 2, y + 5.5, { align: 'right' });
    y += 12;

    order.items.forEach((item) => {
      const productName = item.productName.length > 38
        ? `${item.productName.slice(0, 35)}...`
        : item.productName;
      doc.text(productName, margin + 2, y);
      doc.text(String(item.quantity), margin + 110, y);
      doc.text(`$${item.price.toFixed(2)}`, margin + 128, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, right - 2, y, {
        align: 'right',
      });
      y += 7;
    });

    y += 4;
    doc.line(margin, y, right, y);
    y += 9;

    const totalsX = right - 52;
    doc.setFontSize(10);
    doc.text('Subtotal', totalsX, y);
    doc.text(`$${subtotal.toFixed(2)}`, right - 2, y, { align: 'right' });
    y += 7;
    doc.text('Tax', totalsX, y);
    doc.text(`$${tax.toFixed(2)}`, right - 2, y, { align: 'right' });
    y += 9;
    doc.setFontSize(12);
    doc.text('Total', totalsX, y);
    doc.text(`$${order.total.toFixed(2)}`, right - 2, y, { align: 'right' });

    y += 16;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Thank you for your order.', margin, y);
    doc.text('This invoice was generated automatically.', margin, y + 6);

    doc.save(`invoice-${order.id}.pdf`);
  };

  const summaryStats = [
    {
      label: 'Total Orders',
      value: allOrders.length,
      cardClass:
        'border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-white to-secondary/30',
      valueClass: 'text-primary',
    },
    {
      label: 'Completed',
      value: allOrders.filter((o) => o.status === 'completed').length,
      cardClass:
        'border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50',
      valueClass: 'text-emerald-800',
    },
    {
      label: 'In Transit',
      value: allOrders.filter((o) => o.status === 'shipped').length,
      cardClass:
        'border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/50',
      valueClass: 'text-sky-800',
    },
    {
      label: 'Total Spent',
      value: `$${allOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`,
      cardClass:
        'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40',
      valueClass: 'text-amber-900',
    },
  ] as const;

  if (isPageLoading) {
    return (
      <ProtectedRoute>
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

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

          <div className="rounded-2xl border border-primary/20 bg-white/80 p-6 mb-8 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'completed', 'pending', 'shipped', 'cancelled'].map((status) => (
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
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-gray-200/90 bg-white/90 shadow-md transition-all duration-300 hover:border-primary/25 hover:shadow-lg"
                >
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="flex w-full items-center justify-between p-6 transition-colors hover:bg-gradient-to-r hover:from-primary/[0.06] hover:to-transparent"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">Order {order.id}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}{' '}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="mr-4 text-right">
                      <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                      {order.trackingNumber && (
                        <p className="text-xs text-gray-600 mt-1">Track: {order.trackingNumber}</p>
                      )}
                    </div>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform ${
                        expandedOrder === order.id ? 'rotate-180 text-primary' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {expandedOrder === order.id && (
                    <div className="border-t border-primary/10 bg-gradient-to-b from-secondary/40 to-gray-50/80 p-6">
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
                              <p className="font-semibold text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">Price: ${item.price} each</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-primary/15 bg-white/90 p-4 mb-6 space-y-1 text-sm text-gray-700">
                        {order.customerName && <p>Customer: {order.customerName}</p>}
                        {order.contactNumber && <p>Contact: {order.contactNumber}</p>}
                        {order.fulfillmentMethod && (
                          <p>Method: {order.fulfillmentMethod.toUpperCase()}</p>
                        )}
                        {order.deliveryAddress && <p>Address: {order.deliveryAddress}</p>}
                        {order.paymentMethod && <p>Payment: {order.paymentMethod}</p>}
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal</span>
                          <span>${(order.total / 1.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Tax</span>
                          <span>${(order.total - order.total / 1.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-200/50 backdrop-blur-sm">
                          <p className="text-sm text-blue-900 mb-2">
                            <strong>Tracking Number:</strong>{' '}
                            <span className="font-mono bg-white px-2 py-1 rounded">
                              {order.trackingNumber}
                            </span>
                          </p>
                          <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                            Track Your Package {'>'}
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {order.status === 'completed' && (
                          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-semibold hover:from-primary/90 hover:to-primary transition-all shadow-sm">
                            Buy Again
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex-1 px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all"
                        >
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
                  Continue Shopping {'>'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
