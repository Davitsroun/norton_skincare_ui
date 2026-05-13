import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from 'next-auth';

/** Active checkout only: `GET /api/v1/orders` (pending / processing). Empty after pay is expected. */
import { listOrdersAction } from '@/actions/order-actions';
import type { Order } from '@/types/order';

function pickLatestOrder(orders: Order[]): Order | null {
  if (orders.length === 0) {
    return null;
  }
  const sorted = [...orders].sort((a, b) => {
    const db = Date.parse(`${b.date}T12:00:00`);
    const da = Date.parse(`${a.date}T12:00:00`);
    const safeB = Number.isNaN(db) ? 0 : db;
    const safeA = Number.isNaN(da) ? 0 : da;
    return safeB - safeA;
  });
  return sorted[0] ?? null;
}

export function useOrdersForCart(options: {
  isClient: boolean;
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
  session: Session | null;
}) {
  const { isClient, sessionStatus, session } = options;
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const result = await listOrdersAction({ page: 0, size: 50 });
    if (result.success && result.data) {
      setOrders(result.data);
      setError(null);
    } else {
      setError(result.error ?? 'Could not load orders.');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-orders-synced'));
    }
  }, []);

  useEffect(() => {
    if (!isClient || sessionStatus === 'loading') {
      return;
    }

    let cancelled = false;

    void (async () => {
      if (sessionStatus !== 'authenticated') {
        setOrders([]);
        setError(null);
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const result = await listOrdersAction({ page: 0, size: 50 });
      if (cancelled) {
        return;
      }
      if (result.success && result.data) {
        setOrders(result.data);
        setError(null);
      } else {
        setOrders([]);
        setError(result.error ?? 'Could not load orders.');
      }
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-orders-synced'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient, sessionStatus, session?.user?.id]);

  const latestOrder = useMemo(() => pickLatestOrder(orders), [orders]);

  const linesSubtotal = useMemo(() => {
    if (!latestOrder?.items.length) {
      return 0;
    }
    return latestOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [latestOrder]);

  const grossFromApi = latestOrder?.total ?? 0;

  /** Fee / tax delta between API grand total and line sum (when totals come from GET /orders). */
  const feesVersusLines = useMemo(
    () => Math.max(0, Math.round((grossFromApi - linesSubtotal) * 100) / 100),
    [grossFromApi, linesSubtotal],
  );

  const grandTotal = useMemo(() => {
    if (!latestOrder?.items.length) {
      return 0;
    }
    return grossFromApi > 0 ? grossFromApi : linesSubtotal;
  }, [grossFromApi, linesSubtotal, latestOrder?.items.length]);

  return {
    orders,
    latestOrder,
    reload,
    error,
    loading,
    linesSubtotal,
    feesVersusLines,
    grandTotal,
  };
}
