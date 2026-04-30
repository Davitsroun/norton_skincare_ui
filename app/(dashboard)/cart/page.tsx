'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/cart-context';
import { createOrderFromCart, saveOrderToHistory } from '@/lib/order-storage';
import { listOrdersAction } from '@/actions/order-actions';
import type { Order } from '@/types/order';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { PageHeader } from '@/components/page-header';
import { Trash2, Plus, Minus, ShoppingBag, X, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CartPage() {
  const { status } = useSession();
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [serverOrders, setServerOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    contactNumber: '',
    fulfillmentMethod: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || status === 'loading') {
      return;
    }

    let cancelled = false;

    void (async () => {
      if (status !== 'authenticated') {
        setServerOrders([]);
        setOrdersError(null);
        if (!cancelled) {
          setIsPageLoading(false);
        }
        return;
      }

      const result = await listOrdersAction({ page: 0, size: 50 });
      if (cancelled) {
        return;
      }
      if (result.success && result.data) {
        setServerOrders(result.data);
        setOrdersError(null);
      } else {
        setServerOrders([]);
        setOrdersError(result.error ?? 'Could not load orders.');
      }
      setIsPageLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient, status]);

  if (!isClient || isPageLoading) {
    return <SkeletonLoader />;
  }

  const closeCheckoutDialog = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep('details');
    setFormError('');
  };

  const validateCheckoutForm = () => {
    if (!checkoutForm.fullName.trim() || !checkoutForm.contactNumber.trim()) {
      setFormError('Please provide your name and contact number before checkout.');
      return false;
    }

    if (
      checkoutForm.fulfillmentMethod === 'delivery' &&
      !checkoutForm.deliveryAddress.trim()
    ) {
      setFormError('Delivery address is required for delivery orders.');
      return false;
    }

    return true;
  };

  const placeOrder = (isPickupPaid: boolean) => {
    const order = createOrderFromCart(cartItems, cartTotal, {
      fullName: checkoutForm.fullName,
      contactNumber: checkoutForm.contactNumber,
      fulfillmentMethod: checkoutForm.fulfillmentMethod,
      deliveryAddress: checkoutForm.deliveryAddress,
    });

    order.status = isPickupPaid ? 'completed' : order.status;
    saveOrderToHistory(order);
    closeCheckoutDialog();
    clearCart();
    router.push('/history');
  };

  const handleCheckoutSubmit = () => {
    setFormError('');

    if (!validateCheckoutForm()) {
      return;
    }

    if (checkoutForm.fulfillmentMethod === 'pickup') {
      setCheckoutStep('payment');
      return;
    }

    placeOrder(false);
  };

  const handleAlreadyPaid = () => {
    placeOrder(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          icon={ShoppingBag}
          eyebrow="Checkout"
          titleBefore="Shopping"
          titleGradient="Cart"
          description={
            <>
              You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your
              cart - ready when you are at{' '}
              <span className="font-medium text-primary">Nature Leaf</span>
            </>
          }
        />

        {status === 'authenticated' && (ordersError || serverOrders.length > 0) && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Package className="h-5 w-5 text-primary" aria-hidden />
                Your orders
              </h2>
              <button
                type="button"
                onClick={() => router.push('/history')}
                className="text-sm font-semibold text-primary hover:underline"
              >
                View full history
              </button>
            </div>
            {ordersError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {ordersError}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {serverOrders.slice(0, 5).map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">Order {order.id}</p>
                      <p className="text-gray-500">
                        {order.date} · {order.status}
                        {order.items.length > 0
                          ? ` · ${order.items.map((i) => i.productName).join(', ')}`
                          : ''}
                      </p>
                    </div>
                    <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-gray-50 rounded-lg shadow border border-gray-200 text-center py-16 px-8">
            <ShoppingBag className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => router.push('/shop')}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 flex gap-6 hover:shadow-lg transition-all"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-primary mb-3">${item.price}</p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between">
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${(cartTotal * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="py-6 border-b border-gray-200">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${(cartTotal * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => router.push('/shop')}
                    className="w-full border-2 border-primary text-primary hover:bg-primary/10 py-3 rounded-xl font-semibold transition-all"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-red-600 hover:text-red-700 font-semibold text-sm transition-colors hover:bg-red-50 py-2 rounded-lg"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={closeCheckoutDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <button
            onClick={closeCheckoutDialog}
            className="absolute top-4 right-4 rounded-md p-1.5 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-500 hover:shadow-md"
            aria-label="Close checkout popup"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-center">
              {checkoutStep === 'details' ? 'Confirm Checkout Details' : 'KHQR Payment'}
            </DialogTitle>
            {checkoutStep === 'details' ? (
              <DialogDescription className="text-center">
                Choose pickup or delivery and confirm your information before checkout.
              </DialogDescription>
            ) : (
              <DialogDescription className="text-center">
                Scan the KHQR code with your banking app to complete pickup checkout.
              </DialogDescription>
            )}
          </DialogHeader>

          {checkoutStep === 'details' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  value={checkoutForm.fullName}
                  onChange={(event) =>
                    setCheckoutForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="contactNumber">
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  value={checkoutForm.contactNumber}
                  onChange={(event) =>
                    setCheckoutForm((prev) => ({
                      ...prev,
                      contactNumber: event.target.value,
                    }))
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Fulfillment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        fulfillmentMethod: 'pickup',
                        deliveryAddress: '',
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                      checkoutForm.fulfillmentMethod === 'pickup'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 text-gray-700 hover:border-primary/50'
                    }`}
                  >
                    Pickup
                  </button>
                  <button
                    onClick={() =>
                      setCheckoutForm((prev) => ({ ...prev, fulfillmentMethod: 'delivery' }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                      checkoutForm.fulfillmentMethod === 'delivery'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-300 text-gray-700 hover:border-primary/50'
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {checkoutForm.fulfillmentMethod === 'delivery' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="deliveryAddress">
                    Delivery Address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    value={checkoutForm.deliveryAddress}
                    onChange={(event) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        deliveryAddress: event.target.value,
                      }))
                    }
                    placeholder="Enter your full delivery address"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    rows={3}
                  />
                </div>
              )}

              {formError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <button
                onClick={handleCheckoutSubmit}
                className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white transition-all hover:bg-primary/90"
              >
                {checkoutForm.fulfillmentMethod === 'pickup'
                  ? 'Continue to QR Payment'
                  : 'Place Delivery Order'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl border-4 border-gray-900 bg-white p-4 shadow-sm">
                <div className="relative h-full w-full overflow-hidden rounded-md border border-gray-300 bg-white">
                  <div className="absolute inset-0 bg-[radial-gradient(#111_1.5px,transparent_1.5px)] bg-[size:10px_10px] opacity-25" />
                  <div className="absolute left-3 top-3 h-10 w-10 rounded-sm border-4 border-black bg-white" />
                  <div className="absolute right-3 top-3 h-10 w-10 rounded-sm border-4 border-black bg-white" />
                  <div className="absolute bottom-3 left-3 h-10 w-10 rounded-sm border-4 border-black bg-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded bg-black px-2 py-1 text-xs font-bold text-white tracking-wider">
                      KHQR
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleAlreadyPaid}
                  className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white transition-all hover:bg-primary/90"
                >
                  I Have Paid
                </button>
                <button
                  onClick={() => setCheckoutStep('details')}
                  className="w-full rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  Back to Details
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
