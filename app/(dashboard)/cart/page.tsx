'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/cart-context';
import {
  createOrderFromCart,
  saveOrderToHistory,
  snapshotApiOrderAfterCheckout,
} from '@/lib/order-storage';
import { deleteOrderItemAction, updateOrderItemAction } from '@/actions/order-actions';
import {
  createPaymentProfileAction,
  updatePaymentProfileAction,
} from '@/actions/payment-profile-actions';
import { createPaymentAction } from '@/actions/payments-actions';
import { BAKONG_MERCHANT_DISPLAY_NAME, KHQR_ASSETS } from '@/lib/khqr-assets';
import { useModernToast } from '@/components/modern-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { OrderItem } from '@/types/order';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { PageHeader } from '@/components/page-header';
import { Trash2, Plus, Minus, ShoppingBag, X, Loader2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOrdersForCart } from '@/hooks/use-orders-for-cart';
import { usePaymentProfileId } from '@/hooks/use-payment-profile-id';
import { useBakongKhqr } from '@/hooks/use-bakong-khqr';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { data: session, status } = useSession();
  const { showToast } = useModernToast();
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  /** POST /payments when confirming Bakong pickup — must live with top-level hooks (before any conditional return). */
  const [isPickupPaidSubmitting, setPickupPaidSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    latestOrder: latestAccountOrder,
    reload: reloadServerOrders,
    error: ordersError,
    loading: ordersLoading,
    linesSubtotal: accountLinesSubtotal,
    feesVersusLines: summaryFeesFromApi,
  } = useOrdersForCart({
    isClient,
    sessionStatus: status,
    session,
  });

  const {
    storedId: storedPaymentProfileId,
    setStoredId: setStoredPaymentProfileId,
  } = usePaymentProfileId({ userId: session?.user?.id, authStatus: status });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    contactNumber: '',
    fulfillmentMethod: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
  });
  const [formError, setFormError] = useState('');
  const [paymentProfileBusy, setPaymentProfileBusy] = useState(false);
  const [syncingLineId, setSyncingLineId] = useState<string | null>(null);
  const [pendingAccountLineDelete, setPendingAccountLineDelete] = useState<{
    id: string;
    productName: string;
  } | null>(null);
  const [confirmAccountDeleteBusy, setConfirmAccountDeleteBusy] = useState(false);

  const isGuest = status !== 'authenticated';
  const hasApiLines =
    status === 'authenticated' && Boolean(latestAccountOrder?.items?.length);
  const hasLocalBasket = cartItems.length > 0;
  const showCheckoutGrid = hasApiLines || (isGuest && hasLocalBasket);
  const summaryUsesApiTotals = hasApiLines;

  const accountItemCount =
    latestAccountOrder?.items.reduce((s, x) => s + x.quantity, 0) ?? 0;

  const headerCount = summaryUsesApiTotals
    ? `${accountItemCount} item${accountItemCount !== 1 ? 's' : ''} in your basket`
    : hasLocalBasket
      ? `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`
      : '0 items in your cart';

  const summarySubtotal = summaryUsesApiTotals ? accountLinesSubtotal : cartTotal;
  const grossFromApi = summaryUsesApiTotals ? (latestAccountOrder?.total ?? 0) : 0;
  const summaryGrandTotal = summaryUsesApiTotals
    ? grossFromApi > 0
      ? grossFromApi
      : accountLinesSubtotal
    : summarySubtotal;

  const {
    md5: bakongMd5,
    imageDataUrl: bakongQrImageDataUrl,
    error: bakongQrError,
    loading: bakongQrLoading,
    reset: resetBakong,
    secondsRemaining: khqrSecondsRemaining,
    isQrExpired: khqrExpired,
  } = useBakongKhqr({
    active: isCheckoutOpen && checkoutStep === 'payment',
    amountUsd: summaryGrandTotal,
    isAuthenticated: status === 'authenticated',
    isClient,
  });

  const isPageLoading =
    !isClient || status === 'loading' || (status === 'authenticated' && ordersLoading);

  const removeAccountOrderLine = useCallback(
    async (orderItemId: string): Promise<boolean> => {
      if (status !== 'authenticated') {
        return false;
      }
      setSyncingLineId(orderItemId);
      const res = await deleteOrderItemAction(orderItemId);
      setSyncingLineId(null);
      if (!res.success) {
        showToast({
          header: 'Could not remove item',
          message: res.error ?? 'Please try again.',
          variant: 'error',
        });
        return false;
      }
      await reloadServerOrders();
      showToast({
        header: 'Item removed',
        message: 'The line item was removed from your order.',
        variant: 'success',
      });
      return true;
    },
    [status, showToast, reloadServerOrders],
  );

  const handleConfirmPendingAccountDelete = useCallback(async () => {
    if (!pendingAccountLineDelete) {
      return;
    }
    setConfirmAccountDeleteBusy(true);
    try {
      const ok = await removeAccountOrderLine(pendingAccountLineDelete.id);
      if (ok) {
        setPendingAccountLineDelete(null);
      }
    } finally {
      setConfirmAccountDeleteBusy(false);
    }
  }, [pendingAccountLineDelete, removeAccountOrderLine]);

  const syncAccountOrderItemQuantity = useCallback(
    async (line: OrderItem, nextQuantity: number) => {
      if (status !== 'authenticated') {
        return;
      }
      if (nextQuantity < 1) {
        setPendingAccountLineDelete({
          id: line.id,
          productName: line.productName,
        });
        return;
      }
      const productId = line.productId;
      if (!productId) {
        showToast({
          header: 'Cannot update quantity',
          message:
            'This order line has no product id in the API response — refresh orders or sync your catalog shape.',
          variant: 'error',
        });
        return;
      }
      setSyncingLineId(line.id);
      const res = await updateOrderItemAction(line.id, {
        orderItemId: line.id,
        product: { productId },
        quantity: nextQuantity,
        price: line.price,
      });
      setSyncingLineId(null);
      if (!res.success) {
        showToast({
          header: 'Could not update quantity',
          message: res.error ?? 'Please try again.',
          variant: 'error',
        });
        return;
      }
      await reloadServerOrders();
      showToast({
        header: 'Quantity updated',
        message: `${line.productName} is now ×${nextQuantity}.`,
        variant: 'success',
      });
    },
    [status, showToast, reloadServerOrders],
  );

  if (!isClient || isPageLoading) {
    return <SkeletonLoader />;
  }

  const closeCheckoutDialog = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep('details');
    setFormError('');
    resetBakong();
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
    const form = {
      fullName: checkoutForm.fullName,
      contactNumber: checkoutForm.contactNumber,
      fulfillmentMethod: checkoutForm.fulfillmentMethod,
      deliveryAddress: checkoutForm.deliveryAddress,
    };

    const usesApiBasket =
      status === 'authenticated' && Boolean(latestAccountOrder?.items.length);

    let order;
    if (usesApiBasket && latestAccountOrder) {
      order = snapshotApiOrderAfterCheckout(latestAccountOrder, form, isPickupPaid);
    } else {
      order = createOrderFromCart(cartItems, cartTotal, form);
      order.status = isPickupPaid ? 'completed' : order.status;
    }

    saveOrderToHistory(order);
    closeCheckoutDialog();
    if (!usesApiBasket) {
      clearCart();
    }
    router.push('/history');
  };

  const handleCheckoutSubmit = async () => {
    setFormError('');

    if (!validateCheckoutForm()) {
      return;
    }

    if (status !== 'authenticated') {
      setFormError('Sign in to confirm checkout details and save your payment profile.');
      return;
    }

    const deliveryOption =
      checkoutForm.fulfillmentMethod === 'pickup' ? ('PICKUP' as const) : ('DELIVERY' as const);
    const body = {
      deliveryOption,
      fullName: checkoutForm.fullName.trim(),
      contactNumber: checkoutForm.contactNumber.trim(),
      deliveryAddress:
        checkoutForm.fulfillmentMethod === 'pickup' ? null : checkoutForm.deliveryAddress.trim(),
    };

    setPaymentProfileBusy(true);
    try {
      let res =
        storedPaymentProfileId !== null && storedPaymentProfileId !== ''
          ? await updatePaymentProfileAction(storedPaymentProfileId, body)
          : await createPaymentProfileAction(body);

      if (
        !res.success &&
        storedPaymentProfileId &&
        typeof res.error === 'string' &&
        /404|not found/i.test(res.error)
      ) {
        setStoredPaymentProfileId(null);
        res = await createPaymentProfileAction(body);
      }

      if (!res.success) {
        setFormError(res.error ?? 'Could not save payment profile.');
        showToast({
          header: 'Could not save details',
          message: res.error ?? 'Please try again.',
          variant: 'error',
        });
        return;
      }

      const returnedId =
        typeof res.paymentProfileId === 'string' && res.paymentProfileId.trim() !== ''
          ? res.paymentProfileId.trim()
          : null;
      if (returnedId) {
        setStoredPaymentProfileId(returnedId);
      }

      showToast({
        header: 'Details saved',
        message:
          checkoutForm.fulfillmentMethod === 'pickup'
            ? 'Payment profile saved. Continue to QR payment.'
            : 'Payment profile saved. Completing your order.',
        variant: 'success',
      });

      if (checkoutForm.fulfillmentMethod === 'pickup') {
        setCheckoutStep('payment');
        return;
      }

      placeOrder(false);
    } finally {
      setPaymentProfileBusy(false);
    }
  };

  const handleAlreadyPaid = async () => {
    const usesApiBasket =
      status === 'authenticated' && Boolean(latestAccountOrder?.items.length);

    if (!usesApiBasket || !latestAccountOrder) {
      placeOrder(true);
      return;
    }

    setPickupPaidSubmitting(true);
    try {
      const paidAt = new Date().toISOString();
      const transactionId =
        bakongMd5 != null && bakongMd5.trim() !== ''
          ? `bakong-md5:${bakongMd5.trim()}`
          : `bakong:${Date.now()}`;

      const res = await createPaymentAction({
        orderId: latestAccountOrder.id,
        paymentMethod: 'BAKONG',
        paymentStatus: 'PAID',
        transactionId,
        paidAt,
      });

      if (!res.success) {
        showToast({
          header: 'Payment not recorded',
          message: res.error ?? 'The server did not confirm this payment.',
          variant: 'error',
        });
        return;
      }

      showToast({
        header: 'Payment confirmed',
        message: 'Your order status was updated.',
        variant: 'success',
      });
      await reloadServerOrders();
      placeOrder(true);
    } finally {
      setPickupPaidSubmitting(false);
    }
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
              {summaryUsesApiTotals && latestAccountOrder ? (
                <section aria-labelledby="basket-heading">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 id="basket-heading" className="text-lg font-bold text-gray-900">
                      In your basket
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
                  {/* <p className="mb-4 text-xs text-muted-foreground">
                    Order {latestAccountOrder.id} · {latestAccountOrder.date}. Quantity and removals sync with your account.
                  </p> */}
                  <div className="space-y-4">
                    {latestAccountOrder.items.map((line) => {
                      const busy = syncingLineId === line.id;
                      const canUpdateQty = Boolean(line.productId);
                      return (
                        <div
                          key={line.id}
                          className="flex gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
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
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={busy || !canUpdateQty}
                                title={canUpdateQty ? undefined : 'Product id missing for this line; quantity updates disabled.'}
                                onClick={() => void syncAccountOrderItemQuantity(line, line.quantity - 1)}
                                className="rounded p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-semibold text-gray-900">{line.quantity}</span>
                              <button
                                type="button"
                                disabled={busy || !canUpdateQty}
                                title={canUpdateQty ? undefined : 'Product id missing for this line; quantity updates disabled.'}
                                onClick={() => void syncAccountOrderItemQuantity(line, line.quantity + 1)}
                                className="rounded p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col justify-between text-right">
                            <p className="font-bold text-gray-900">${(line.price * line.quantity).toFixed(2)}</p>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setPendingAccountLineDelete({
                                  id: line.id,
                                  productName: line.productName,
                                })
                              }
                              className="flex items-center justify-end gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {isGuest && hasLocalBasket ? (
                <section aria-labelledby="local-basket-heading">
                  <h2 id="local-basket-heading" className="mb-4 text-lg font-bold text-gray-900">
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
              ) : null}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6 shadow">
                <h2 className="mb-6 text-lg font-bold text-gray-900">Order Summary</h2>

                <div className="space-y-3 border-b border-gray-200 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${summarySubtotal.toFixed(2)}</span>
                  </div>
                  {summaryUsesApiTotals ? (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="font-semibold text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Adjustments / tax vs lines</span>
                        <span>${summaryFeesFromApi.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-muted-foreground">—</span>
                    </div>
                  )}
                  {!summaryUsesApiTotals ? (
                    <p className="text-xs text-muted-foreground">
                      Totals reflect your basket only — no estimated tax applied. Final amounts come from checkout / your order API.
                    </p>
                  ) : null}
                </div>

                <div className="border-b border-gray-200 py-6">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${summaryGrandTotal.toFixed(2)}</span>
                  </div>
                  {summaryUsesApiTotals ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Total matches your saved order ({latestAccountOrder?.id?.slice(0, 8)}…).
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 pt-6">
                  {showCheckoutGrid ? (
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
                    >
                      Proceed to Checkout
                    </button>
                  ) : null}
                  {isGuest && hasLocalBasket ? (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="w-full py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Clear Cart
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => router.push('/shop')}
                    className="w-full rounded-xl border-2 border-primary py-3 font-semibold text-primary transition-all hover:bg-primary/10"
                  >
                    Continue Shopping
                  </button>
                  {summaryUsesApiTotals ? (
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

      <AlertDialog
        open={pendingAccountLineDelete !== null}
        onOpenChange={(next) => {
          if (!next && !confirmAccountDeleteBusy) {
            setPendingAccountLineDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAccountLineDelete
                ? `“${pendingAccountLineDelete.productName}” will be removed from your latest order. This cannot be undone from here.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmAccountDeleteBusy}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmAccountDeleteBusy}
              onClick={() => void handleConfirmPendingAccountDelete()}
            >
              {confirmAccountDeleteBusy ? 'Removing…' : 'Remove'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCheckoutOpen} onOpenChange={closeCheckoutDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-lg">
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
                {/* Choose pickup or delivery. We POST or PUT{' '}
                <span className="font-medium text-foreground">/api/v1/payment-profiles</span> before you continue. */}
              </DialogDescription>
            ) : (
              <DialogDescription className="text-center text-sm text-muted-foreground">
                Pay in <span className="font-medium text-foreground">US dollars (USD)</span> only — scan with a Bakong KHQR–enabled app.
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
                type="button"
                disabled={paymentProfileBusy}
                onClick={() => void handleCheckoutSubmit()}
                className="w-full rounded-xl bg-primary py-2.5 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {paymentProfileBusy
                  ? 'Saving profile…'
                  : checkoutForm.fulfillmentMethod === 'pickup'
                    ? 'Continue to QR Payment'
                    : 'Place Delivery Order'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/*
                Compact USD-only KHQR card: balanced padding, smaller QR for even margins.
              */}
              {(() => {
                const payNum = Number.isFinite(summaryGrandTotal) ? Math.max(summaryGrandTotal, 0) : 0;
                const amountUsd = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(payNum);
                const payerLabel = checkoutForm.fullName.trim() || 'Customer';
                const qrClass = 'h-[140px] w-[140px]';
                return (
                  <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]">
                    <div className="relative bg-[#E11D2E] px-3 pb-6 pt-3">
                      <div className="flex justify-center">
                        <img
                          src={KHQR_ASSETS.logoSvg}
                          alt="KHQR"
                          className="h-6 w-auto object-contain brightness-0 invert"
                        />
                      </div>
                      <div
                        className="absolute bottom-0 right-0 border-b-[22px] border-l-[22px] border-b-white border-l-transparent"
                        aria-hidden
                      />
                    </div>

                    <div className="relative -mt-px bg-white px-3 pb-3 pt-3 text-black">
                      <p className="text-center text-xs font-medium leading-tight tracking-tight text-gray-900">
                        {payerLabel}
                      </p>
                      <p className="mt-1.5 text-center">
                        <span className="text-xl font-bold leading-none tabular-nums tracking-tight text-gray-900">
                          {amountUsd}
                        </span>
                      </p>
                      <p className="mt-1 text-center text-[9px] text-gray-400 leading-tight">{BAKONG_MERCHANT_DISPLAY_NAME}</p>

                      <div className="my-2 border-t border-dashed border-gray-300" aria-hidden />

                      <div className="relative mx-auto flex w-full justify-center px-0.5 pb-0.5">
                        <div className="relative rounded-md bg-white p-1">
                          {bakongQrLoading ? (
                            <div
                              className={`flex flex-col items-center justify-center gap-1.5 rounded-md bg-gray-50 text-[10px] text-muted-foreground ${qrClass}`}
                            >
                              <Loader2 className="h-6 w-6 animate-spin text-[#E11D2E]" aria-hidden />
                              Generating QR…
                            </div>
                          ) : bakongQrImageDataUrl ? (
                            <div className="relative rounded-md">
                              <img
                                src={bakongQrImageDataUrl}
                                alt="KHQR payment code"
                                width={140}
                                height={140}
                                className={`rounded-md object-contain ${qrClass} ${khqrExpired ? 'opacity-[0.38]' : ''}`}
                              />
                              {khqrExpired ? (
                                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/78 px-1.5 text-center text-[9px] font-semibold uppercase leading-snug tracking-wide text-gray-800 ring-1 ring-inset ring-gray-900/10">
                                  Expired
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div
                              className={`flex items-center justify-center rounded-md bg-gray-50 px-2 text-center text-[10px] text-muted-foreground leading-snug ${qrClass}`}
                            >
                              {bakongQrError ?? 'QR unavailable'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {khqrSecondsRemaining !== null && !bakongQrLoading ? (
                <div className="-mt-1 flex justify-center px-1">
                  <div
                    role="status"
                    aria-live="polite"
                    className={cn(
                      'inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 shadow-sm ring-1 ring-black/[0.04]',
                      khqrExpired &&
                        'border-red-300/80 bg-gradient-to-br from-red-50 via-white to-red-50/30 text-red-800',
                      !khqrExpired &&
                        khqrSecondsRemaining <= 120 &&
                        'border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 text-amber-950 shadow-amber-200/40',
                      !khqrExpired &&
                        khqrSecondsRemaining > 120 &&
                        'border-gray-200/90 bg-gradient-to-b from-muted/70 to-background text-gray-800',
                    )}
                  >
                    <Clock
                      aria-hidden
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 stroke-[2.25]',
                        khqrExpired && 'text-red-600',
                        !khqrExpired && khqrSecondsRemaining <= 120 && 'animate-pulse text-amber-600',
                        !khqrExpired && khqrSecondsRemaining > 120 && 'text-[#c91928]',
                      )}
                    />
                    {khqrExpired ? (
                      <span className="text-center text-[10px] font-semibold leading-snug tracking-tight sm:text-[11px]">
                        QR expired — use <span className="text-red-900">Back to details</span>, then generate a new code
                      </span>
                    ) : (
                      <span className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-[11px] font-semibold leading-none">
                        <span className="translate-y-[0.5px] text-[10px] font-medium uppercase tracking-wider opacity-65">
                          Valid for
                        </span>
                        <span className="font-mono text-xs tabular-nums tracking-wide text-current">
                          {`${Math.floor(khqrSecondsRemaining / 60)}:${(khqrSecondsRemaining % 60)
                            .toString()
                            .padStart(2, '0')}`}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 pt-1">

                <button
                  type="button"
                  disabled={isPickupPaidSubmitting}
                  onClick={() => void handleAlreadyPaid()}
                  className="w-full rounded-xl bg-[#E11D2E] py-2.5 font-semibold text-white transition-all hover:bg-[#c91928] disabled:opacity-60"
                >
                  {isPickupPaidSubmitting ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin align-text-bottom" aria-hidden />
                      Confirming…
                    </>
                  ) : (
                    'I have paid · complete order'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('details')}
                  className="w-full rounded-xl border border-gray-300 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  Back to details
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
