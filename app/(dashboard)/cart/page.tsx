'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/cart-context';
import { createOrderFromCart, saveOrderToHistory } from '@/lib/order-storage';
import {
  deleteOrderItemAction,
  listOrdersAction,
  updateOrderItemAction,
} from '@/actions/order-actions';
import {
  createPaymentProfileAction,
  updatePaymentProfileAction,
} from '@/actions/payment-profile-actions';
import {
  bakongGenerateQrAction,
  bakongGetQrImageAction,
  bakongCheckTransactionAction,
} from '@/actions/bakong-actions';
import { BAKONG_MERCHANT_DISPLAY_NAME, KHQR_ASSETS } from '@/lib/khqr-assets';
import { useModernToast } from '@/components/modern-toast';
import { apiBaseUrl } from '@/constant/baseurl';
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
import type { Order, OrderItem } from '@/types/order';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { PageHeader } from '@/components/page-header';
import { Trash2, Plus, Minus, ShoppingBag, X, Package, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const paymentProfileStorageKey = (userId: string) =>
  `norton:paymentProfileId:${userId}`;

export default function CartPage() {
  const { data: session, status } = useSession();
  const { showToast } = useModernToast();
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
  /** Cached server id — PUT on later confirms when still same browser/session. */
  const [storedPaymentProfileId, setStoredPaymentProfileId] = useState<string | null>(null);
  const [paymentProfileBusy, setPaymentProfileBusy] = useState(false);
  const [syncingLineId, setSyncingLineId] = useState<string | null>(null);
  const [pendingAccountLineDelete, setPendingAccountLineDelete] = useState<{
    id: string;
    productName: string;
  } | null>(null);
  const [confirmAccountDeleteBusy, setConfirmAccountDeleteBusy] = useState(false);
  const [bakongMd5, setBakongMd5] = useState<string | null>(null);
  const [bakongQrImageDataUrl, setBakongQrImageDataUrl] = useState<string | null>(null);
  const [bakongQrError, setBakongQrError] = useState<string | null>(null);
  const [bakongQrLoading, setBakongQrLoading] = useState(false);
  const [bakongCheckBusy, setBakongCheckBusy] = useState(false);

  const reloadServerOrders = useCallback(async () => {
    const result = await listOrdersAction({ page: 0, size: 50 });
    if (result.success && result.data) {
      setServerOrders(result.data);
      setOrdersError(null);
    } else {
      setOrdersError(result.error ?? 'Could not load orders.');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-orders-synced'));
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (typeof window === 'undefined' || !userId) {
      return;
    }
    try {
      const existing = sessionStorage.getItem(paymentProfileStorageKey(userId));
      setStoredPaymentProfileId(existing && existing.trim() !== '' ? existing.trim() : null);
    } catch {
      setStoredPaymentProfileId(null);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setStoredPaymentProfileId(null);
    }
  }, [status]);

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-orders-synced'));
      }
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
  /** Order total returned by GET /orders (includes tax/discount versus line sum only when syncing from API). */
  const grossFromApi = summaryUsesAccountTotal ? (latestAccountOrder?.total ?? 0) : 0;
  const summaryFeesFromApi = summaryUsesAccountTotal
    ? Math.max(0, Math.round((grossFromApi - accountLinesSubtotal) * 100) / 100)
    : 0;
  const summaryGrandTotal = summaryUsesAccountTotal ? grossFromApi : summarySubtotal;

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

  useEffect(() => {
    if (!isCheckoutOpen || checkoutStep !== 'payment') {
      return;
    }

    const amountUsdRaw = summaryGrandTotal;
    const safeAmount = Number(Number.isFinite(amountUsdRaw) ? Math.max(amountUsdRaw, 0.01) : 0.01).toFixed(2);
    const amountUsdNumber = Number(safeAmount);

    if (!isClient || status !== 'authenticated') {
      setBakongQrError('Sign in to generate a KHQR code.');
      return;
    }

    let cancelled = false;

    async function setupKhqr(): Promise<void> {
      setBakongQrError(null);
      setBakongQrImageDataUrl(null);
      setBakongMd5(null);
      setBakongQrLoading(true);
      try {
        const gen = await bakongGenerateQrAction({
          currency: 'USD',
          amount: amountUsdNumber,
          merchantName: BAKONG_MERCHANT_DISPLAY_NAME,
        });
        if (cancelled) {
          return;
        }
        if (!gen.success || !gen.data?.qr) {
          setBakongQrError(gen.error ?? 'Could not generate KHQR.');
          return;
        }
        setBakongMd5(gen.data.md5);

        const qrImg = await bakongGetQrImageAction({ qr: gen.data.qr });
        if (cancelled) {
          return;
        }
        if (!qrImg.success || !qrImg.data?.imageDataUrl) {
          setBakongQrError(qrImg.error ?? 'Could not render QR image.');
          return;
        }
        setBakongQrImageDataUrl(qrImg.data.imageDataUrl);
      } finally {
        if (!cancelled) {
          setBakongQrLoading(false);
        }
      }
    }

    void setupKhqr().catch(() => {
      if (!cancelled) {
        setBakongQrError('KHQR initialization failed unexpectedly.');
      }
      setBakongQrLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isCheckoutOpen, checkoutStep, status, summaryGrandTotal, isClient]);

  if (!isClient || isPageLoading) {
    return <SkeletonLoader />;
  }

  const closeCheckoutDialog = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep('details');
    setFormError('');
    setBakongMd5(null);
    setBakongQrImageDataUrl(null);
    setBakongQrError(null);
    setBakongQrLoading(false);
    setBakongCheckBusy(false);
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
        const uid = session?.user?.id;
        if (typeof window !== 'undefined' && uid) {
          try {
            sessionStorage.removeItem(paymentProfileStorageKey(uid));
          } catch {
            /* ignore */
          }
        }
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
        const uid = session?.user?.id;
        if (typeof window !== 'undefined' && uid) {
          try {
            sessionStorage.setItem(paymentProfileStorageKey(uid), returnedId);
          } catch {
            /* ignore */
          }
        }
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

  const handleAlreadyPaid = () => {
    placeOrder(true);
  };

  const handleCheckBakongPayment = async () => {
    if (!bakongMd5) {
      showToast({
        header: 'Not ready yet',
        message: 'KHQR fingerprint (md5) was not returned from generate-qr.',
        variant: 'warning',
      });
      return;
    }
    setBakongCheckBusy(true);
    try {
      const res = await bakongCheckTransactionAction({ md5: bakongMd5 });
      if (!res.success) {
        showToast({
          header: 'Check failed',
          message: res.error ?? 'Verify payment with your bank.',
          variant: 'error',
        });
        return;
      }
      const snippet =
        res.data !== undefined ? JSON.stringify(res.data).slice(0, 400) : 'OK';
      showToast({
        header: 'Bakong check',
        message: snippet,
        variant: 'success',
      });
    } finally {
      setBakongCheckBusy(false);
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
              {/* {hasAccountOrderLines && latestAccountOrder ? (
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
                    Order {latestAccountOrder.id} · {latestAccountOrder.date}. Updates and removals use{' '}
                    <code className="rounded bg-secondary px-1">{apiBaseUrl.baseUrl}/api/v1/order-items</code>.
                  </p>
                  <div className="space-y-4">
                    {latestAccountOrder.items.map((line) => {
                      const busy = syncingLineId === line.id;
                      const canUpdateQty = Boolean(line.productId);
                      return (
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
              ) : null} */}

              {hasBasket ? (
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
                  {summaryUsesAccountTotal ? (
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
                  {!summaryUsesAccountTotal ? (
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
                Choose pickup or delivery. We POST or PUT{' '}
                <span className="font-medium text-foreground">/api/v1/payment-profiles</span> before you continue.
              </DialogDescription>
            ) : (
              <DialogDescription className="text-center text-sm text-muted-foreground">
                Scan with any Cambodian bank app that supports Bakong KHQR (NBC).
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
            <div className="space-y-5">
              {/*
                Single “receipt card” layout aligned with NBC KHQR presentment (reference):
                red header + white body, payer, amount, dashed rule, centred QR with national mark.
              */}
              {(() => {
                const payNum = Number.isFinite(summaryGrandTotal) ? Math.max(summaryGrandTotal, 0) : 0;
                const amountMain = new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(payNum);
                const payerLabel = checkoutForm.fullName.trim() || 'Customer';
                return (
                  <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
                    <div className="relative bg-[#E11D2E] px-5 pb-12 pt-6">
                      <div className="flex justify-center">
                        <img
                          src={KHQR_ASSETS.logoSvg}
                          alt="KHQR"
                          className="h-9 w-auto object-contain brightness-0 invert"
                        />
                      </div>
                      <div
                        className="absolute bottom-0 right-0 border-b-[42px] border-l-[42px] border-b-white border-l-transparent"
                        aria-hidden
                      />
                    </div>

                    <div className="relative -mt-px bg-white px-5 pb-6 pt-6 text-black">
                      <p className="text-center font-medium leading-tight tracking-tight text-gray-900">
                        {payerLabel}
                      </p>
                      <p className="mt-5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
                        <span className="text-[1.85rem] font-bold leading-none tabular-nums tracking-tight">
                          {amountMain}
                        </span>
                        <span className="text-sm font-semibold uppercase text-gray-800">USD</span>
                      </p>
                      <p className="mt-3 text-center text-[10px] text-gray-400">
                        {BAKONG_MERCHANT_DISPLAY_NAME}
                      </p>

                      <div
                        className="my-5 border-t border-dashed border-gray-300"
                        aria-hidden
                      />

                      <div className="relative mx-auto flex w-full max-w-[240px] justify-center pb-2">
                        <div className="relative rounded-lg bg-white p-2">
                          {bakongQrLoading ? (
                            <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-2 rounded-md bg-gray-50 text-xs text-muted-foreground">
                              <Loader2 className="h-8 w-8 animate-spin text-[#E11D2E]" aria-hidden />
                              Generating KHQR…
                            </div>
                          ) : bakongQrImageDataUrl ? (
                            <img
                              src={bakongQrImageDataUrl}
                              alt="KHQR payment code"
                              width={220}
                              height={220}
                              className="h-[220px] w-[220px] rounded-md object-contain"
                            />
                          ) : (
                            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-md bg-gray-50 px-3 text-center text-[11px] text-muted-foreground">
                              {bakongQrError ?? 'QR unavailable'}
                            </div>
                          )}
                          {bakongQrImageDataUrl && !bakongQrLoading ? (
                            <div
                              className="pointer-events-none absolute left-1/2 top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[1.65rem] text-white shadow-sm ring-[3px] ring-white"
                              aria-hidden
                            >
                              ៛
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  disabled={bakongCheckBusy || !bakongMd5}
                  onClick={() => void handleCheckBakongPayment()}
                  className="w-full rounded-xl border-2 border-primary py-2.5 font-semibold text-primary transition-all hover:bg-primary/5 disabled:opacity-50"
                >
                  {bakongCheckBusy ? 'Checking Bakong…' : 'Check payment (HTTP)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAlreadyPaid()}
                  className="w-full rounded-xl bg-[#E11D2E] py-2.5 font-semibold text-white transition-all hover:bg-[#c91928]"
                >
                  I have paid · complete order
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
