import { useCallback, useEffect, useMemo, useState } from 'react';
import { bakongGenerateQrAction, bakongGetQrImageAction } from '@/actions/bakong-actions';
import { BAKONG_MERCHANT_DISPLAY_NAME } from '@/lib/khqr-assets';

/** Bakong QR payload is commonly valid ~15 minutes; drives UI countdown after each successful generate. */
export const KHQR_COUNTDOWN_SECONDS = 15 * 60;

export function useBakongKhqr(options: {
  active: boolean;
  amountUsd: number;
  isAuthenticated: boolean;
  isClient: boolean;
}) {
  const { active, amountUsd, isAuthenticated, isClient } = options;
  const [md5, setMd5] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrExpiresAtMs, setQrExpiresAtMs] = useState<number | null>(null);
  const [countdownTick, setCountdownTick] = useState(0);

  const reset = useCallback(() => {
    setMd5(null);
    setImageDataUrl(null);
    setError(null);
    setLoading(false);
    setQrExpiresAtMs(null);
  }, []);

  /** Re-render once per second while a countdown is meaningful (active KHQR with expiry set). */
  useEffect(() => {
    if (!active || qrExpiresAtMs === null) {
      return;
    }
    const id = window.setInterval(() => setCountdownTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [active, qrExpiresAtMs]);

  const { secondsRemaining, isQrExpired } = useMemo(() => {
    if (qrExpiresAtMs === null) {
      return { secondsRemaining: null as number | null, isQrExpired: false };
    }
    const left = Math.max(0, Math.ceil((qrExpiresAtMs - Date.now()) / 1000));
    return {
      secondsRemaining: left,
      isQrExpired: Boolean(imageDataUrl) && left === 0,
    };
  }, [qrExpiresAtMs, imageDataUrl, countdownTick]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const amountUsdRaw = amountUsd;
    const safeAmount = Number(Number.isFinite(amountUsdRaw) ? Math.max(amountUsdRaw, 0.01) : 0.01).toFixed(2);
    const amountUsdNumber = Number(safeAmount);

    if (!isClient || !isAuthenticated) {
      setError('Sign in to generate a KHQR code.');
      setQrExpiresAtMs(null);
      return;
    }

    let cancelled = false;

    async function setupKhqr(): Promise<void> {
      setError(null);
      setImageDataUrl(null);
      setMd5(null);
      setQrExpiresAtMs(null);
      setLoading(true);
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
          setError(gen.error ?? 'Could not generate KHQR.');
          return;
        }
        setMd5(gen.data.md5);

        const qrImg = await bakongGetQrImageAction({ qr: gen.data.qr });
        if (cancelled) {
          return;
        }
        if (!qrImg.success || !qrImg.data?.imageDataUrl) {
          setError(qrImg.error ?? 'Could not render QR image.');
          return;
        }
        setImageDataUrl(qrImg.data.imageDataUrl);
        setQrExpiresAtMs(Date.now() + KHQR_COUNTDOWN_SECONDS * 1000);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void setupKhqr().catch(() => {
      if (!cancelled) {
        setError('KHQR initialization failed unexpectedly.');
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [active, amountUsd, isAuthenticated, isClient]);

  return { md5, imageDataUrl, error, loading, reset, secondsRemaining, isQrExpired };
}
