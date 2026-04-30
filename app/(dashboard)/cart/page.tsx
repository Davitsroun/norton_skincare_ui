'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const latestAccountOrder = useMemo(() => {
    if (serverOrders.length === 0) {
      return null;
    }
    const sorted = [...serverOrders].sort((a, b) => {
      const db = Date.parse(`${b.date}T12:00:00`);
      const da = Date.parse(`${a.date}T12:00:00`);
      const safeB = Number.isNaN(db) ? 0 : db;
      const safeA = Number.isNaN(da) ? 0 : da;
      return safeB - safeA;
    });
    return sorted[0] ?? null;
  }, [serverOrders]);

  const accountLinesSubtotal = useMemo(() => {
    if (!latestAccountOrder?.items.length) {
      return 0;
    }
    return latestAccountOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [latestAccountOrder]);

  const hasBasket = cartItems.length > 0;
  const hasAccountOrderLines = Boolean(latestAccountOrder?.items?.length);

  const showCheckoutGrid = hasBasket || hasAccountOrderLines;

  const summaryUsesAccountTotal = hasAccountOrderLines && !hasBasket;

  const accountItemCount =
    latestAccountOrder?.items.reduce((s, x) => s + x.quantity, 0) ?? 0;

  const headerCount = hasBasket
    ? `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`
    : hasAccountOrderLines
      ? `${accountItemCount} item${accountItemCount !== 1 ? 's' : ''} on your latest order`
      : '0 items in your cart';

  const summarySubtotal = summaryUsesAccountTotal ? accountLinesSubtotal : cartTotal;
  const grossFromApi = summaryUsesAccountTotal ? (latestAccountOrder?.total ?? 0) : 0;
  const summaryTax = summaryUsesAccountTotal
    ? Math.max(0, Math.round((grossFromApi - accountLinesSubtotal) * 100) / 100)
    : cartTotal * 0.1;
  const summaryGrandTotal = summaryUsesAccountTotal ? grossFromApi : cartTotal * 1.1;

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
              {headerCount}
              {' '}
              at <span className="font-medium text-primary">Nature Leaf</span>
            </>
          }
        />

        {status === 'authenticated' && ordersError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            Could not refresh orders: {ordersError}
          </div>
        )}

        {showCheckoutGrid ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              {hasAccountOrderLines && latestAccountOrder ? (
                <section aria-labelledby="account-order-heading">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 id="account-order-heading" className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Package className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                      Latest order from your account
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-full bg-secondary px-3 py-1 font-medium capitalize text-gray-700">
                        {latestAccountOrder.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push('/history')}
                        className="font-semibold text-primary hover:underline"
                      >
                        All orders
                      </button>
                    </div>
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Order {latestAccountOrder.id} · {latestAccountOrder.date}
                  </p>
                  <div className="space-y-4">
                    {latestAccountOrder.items.map((line) => (
                      <div
                        key={line.id}
                        className="flex gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={line.image}
                            alt={line.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-2 font-semibold text-gray-900">{line.productName}</h3>
                          <p className="mb-3 text-lg font-bold text-primary">
                            ${Number(line.price).toFixed(2)}
                            <span className="ml-2 text-sm font-normal text-gray-600">each</span>
                          </p>
                          <p className="text-sm text-gray-600">Qty {line.quantity}</p>
                        </div>
                        <div className="text-right font-bold text-gray-900">
                          ${(line.price * line.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* {hasBasket ? (
                <section aria-labelledby="basket-heading">
                  <h2 id="basket-heading" className="mb-4 text-lg font-bold text-gray-900">
                    In your basket
                  </h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1 font-semibold text-gray-900">{item.name}</h3>
                          <p className="mb-3 text-lg font-bold text-primary">${item.price}</p>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="rounded p-1 transition-colors hover:bg-gray-100"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="rounded p-1 transition-colors hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between text-right">
                          <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="flex items-center justify-end gap-1 text-sm text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null} */}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6 shadow">
                <h2 className="mb-6 text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="space-y-3 border-b border-gray-200 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${summarySubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{summaryUsesAccountTotal ? 'Adjustments / tax' : 'Tax'}</span>
                    <span>${summaryTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-b border-gray-200 py-6">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${summaryGrandTotal.toFixed(2)}</span>
                  </div>
                  {summaryUsesAccountTotal ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Total matches your saved order ({latestAccountOrder?.id?.slice(0, 8)}…).
                    </p>
                  ) : null}
                  {hasBasket && hasAccountOrderLines ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Amounts reflect your editable basket only; the synced order block above is from your account.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 pt-6">
                  {hasBasket ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
                      >
                        Proceed to Checkout
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="w-full py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Clear Cart
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => router.push('/shop')}
                    className="w-full rounded-xl border-2 border-primary py-3 font-semibold text-primary transition-all hover:bg-primary/10"
                  >
                    Continue Shopping
                  </button>
                  {summaryUsesAccountTotal ? (
                    <button
                      type="button"
                      onClick={() => router.push('/history')}
                      className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      View history
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-8 py-16 text-center shadow">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-primary/30" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            {ordersError && status === 'authenticated' ? (
              <p className="mb-4 text-sm text-amber-800">
                Signed in — we could not sync your orders. Use the banner above or open history after it works.
              </p>
            ) : (
              <p className="mb-6 text-gray-600">Add products from the shop to checkout here.</p>
            )}
            <button
              type="button"
              onClick={() => router.push('/shop')}
              className="rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              Continue Shopping
            </button>
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
