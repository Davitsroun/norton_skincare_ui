'use client';

/**
 * OneSignal Web SDK (react-onesignal): targets `external_id` with Keycloak subject (session user id).
 * Requires NEXT_PUBLIC_ONESIGNAL_APP_ID and public service worker scripts.
 */

let initStarted: Promise<void> | null = null;

/**
 * Persists across Next.js Fast Refresh: our module resets `initStarted` but `react-onesignal` still flags inited.
 */
const WINDOW_INIT_PROMISE_KEY = '__nortonOneSignalInitPromise__';

function readWindowInitPromise(): Promise<void> | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const w = window as unknown as Record<string, Promise<void> | undefined>;
  return w[WINDOW_INIT_PROMISE_KEY];
}

function writeWindowInitPromise(p: Promise<void>): void {
  if (typeof window === 'undefined') {
    return;
  }
  const w = window as unknown as Record<string, Promise<void>>;
  w[WINDOW_INIT_PROMISE_KEY] = p;
}

async function loadOneSignal() {
  const mod = await import('react-onesignal');
  return mod.default;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function readOnesignalId(OneSignal: Awaited<ReturnType<typeof loadOneSignal>>): string {
  return typeof OneSignal.User.onesignalId === 'string' ? OneSignal.User.onesignalId.trim() : '';
}

function hasOnesignalId(OneSignal: Awaited<ReturnType<typeof loadOneSignal>>): boolean {
  return readOnesignalId(OneSignal).length > 0;
}

/**
 * `init()` resolves before sync finishes; relying only on polls can race the SW. Prefer `User` events + poll.
 */
function waitForOnesignalSubscriptionContext(
  OneSignal: Awaited<ReturnType<typeof loadOneSignal>>,
  timeoutMs = 25000,
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (hasOnesignalId(OneSignal)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;
    const deadline = Date.now() + timeoutMs;

    function finish(ok: boolean) {
      if (settled) {
        return;
      }
      settled = true;
      try {
        OneSignal.User.removeEventListener('change', onUserChange);
      } catch {
        /* ignore */
      }
      resolve(ok);
    }

    function onUserChange() {
      if (hasOnesignalId(OneSignal)) {
        finish(true);
      }
    }

    try {
      OneSignal.User.addEventListener('change', onUserChange);
    } catch {
      /* continue with polling only */
    }

    async function poll() {
      const stepMs = 200;
      while (Date.now() < deadline && !settled) {
        if (hasOnesignalId(OneSignal)) {
          finish(true);
          return;
        }
        await sleep(stepMs);
      }
      if (!settled) {
        finish(false);
      }
    }

    void poll();
  });
}

/** Reduces “update-subscription … onesignalId” races right after opt-in (see OneSignal Web SDK issue threads). */
async function waitForPushSubscriptionHydrated(
  OneSignal: Awaited<ReturnType<typeof loadOneSignal>>,
  timeoutMs = 20000,
): Promise<void> {
  const stepMs = 200;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const subId = OneSignal.User.PushSubscription.id;
    const token = OneSignal.User.PushSubscription.token;
    if (
      typeof subId === 'string' &&
      subId.trim().length > 0 &&
      typeof token === 'string' &&
      token.trim().length > 0 &&
      hasOnesignalId(OneSignal)
    ) {
      return;
    }
    await sleep(stepMs);
  }
}

/** Serialize SDK writes — overlapping `login` / `logout` / `optIn` races the SW and triggers update-subscription errors. */
let sdkMutex: Promise<unknown> = Promise.resolve();

function runSdkSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const next = sdkMutex.then(fn, fn);
  sdkMutex = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function enrollmentOptInPush(OneSignal: Awaited<ReturnType<typeof loadOneSignal>>): Promise<boolean> {
  await waitForOnesignalSubscriptionContext(OneSignal, 15000);
  try {
    await OneSignal.Notifications.requestPermission();
  } catch {
    /* user may block */
  }
  if (!OneSignal.Notifications.permission) {
    return false;
  }
  await waitForOnesignalSubscriptionContext(OneSignal, 15000);
  try {
    if (!OneSignal.User.PushSubscription.optedIn) {
      await OneSignal.User.PushSubscription.optIn();
    }
  } catch {
    /* already opted-in or unsupported */
  }
  await sleep(400);
  await waitForPushSubscriptionHydrated(OneSignal, 12000);
  return Boolean(OneSignal.User.PushSubscription.optedIn);
}

export type WebPushUiSnapshot = {
  /** `NEXT_PUBLIC_ONESIGNAL_APP_ID` is set. */
  configured: boolean;
  /** Browser + SDK support web push. */
  supported: boolean;
  /** Same as `Notification.permission` when available. */
  permission: NotificationPermission;
  /** OneSignal push opted in. */
  optedIn: boolean;
};

/**
 * Read enrollment state for UI. Call after {@link ensureOneSignalInitialized} (e.g. when opening notification panel).
 */
export async function getWebPushEnrollmentSnapshot(): Promise<WebPushUiSnapshot> {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
    return {
      configured: false,
      supported: false,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
      optedIn: false,
    };
  }

  await ensureOneSignalInitialized();
  const OneSignal = await loadOneSignal();

  let supported = false;
  try {
    supported = OneSignal.Notifications.isPushSupported?.() ?? typeof Notification !== 'undefined';
  } catch {
    supported = typeof Notification !== 'undefined';
  }

  const permission: NotificationPermission =
    typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  const optedIn = Boolean(OneSignal.User.PushSubscription.optedIn);

  return {
    configured: true,
    supported,
    permission,
    optedIn,
  };
}

/**
 * Run from a click handler — browsers require a user gesture to show the permission prompt reliably.
 * Pass `externalUserId` when signed in so `login` runs on the same serialized queue as opt-in (avoids SW races).
 */
export async function requestWebPushSubscription(
  externalUserId?: string | null,
): Promise<WebPushUiSnapshot> {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
    return getWebPushEnrollmentSnapshot();
  }

  await ensureOneSignalInitialized();

  return runSdkSerialized(async () => {
    const OneSignal = await loadOneSignal();
    await waitForOnesignalSubscriptionContext(OneSignal, 15000);

    const ext = typeof externalUserId === 'string' ? externalUserId.trim() : '';
    if (ext) {
      try {
        await OneSignal.login(ext);
      } catch {
        /* ignore concurrent login noise */
      }
      await sleep(500);
      await waitForOnesignalSubscriptionContext(OneSignal, 15000);
    }

    const hasId = await waitForOnesignalSubscriptionContext(OneSignal, 15000);
    if (!hasId) {
      return getWebPushEnrollmentSnapshot();
    }

    if (OneSignal.Notifications.permission && OneSignal.User.PushSubscription.optedIn) {
      await waitForPushSubscriptionHydrated(OneSignal, 8000);
      return getWebPushEnrollmentSnapshot();
    }

    await enrollmentOptInPush(OneSignal);
    return getWebPushEnrollmentSnapshot();
  });
}

export async function ensureOneSignalInitialized(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    return;
  }

  let p = initStarted ?? readWindowInitPromise();
  if (!p) {
    p = (async () => {
      const OneSignal = await loadOneSignal();
      try {
        await OneSignal.init({
          appId,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
          allowLocalhostAsSecureOrigin: true,
          /** Default registration during `init` can hit `update-subscription` before `onesignalId` exists. */
          autoRegister: false,
        });
      } catch (err: unknown) {
        /** `react-onesignal`: `Promise.reject("OneSignal is already initialized.")` after HMR / duplicate init */
        const msg =
          typeof err === 'string' ? err : err instanceof Error ? err.message : String(err ?? '');
        if (!msg.includes('already initialized')) {
          throw err;
        }
      }

      /** Identity only — push enrollment happens after `login` (see `oneSignalLogin`). */
      await waitForOnesignalSubscriptionContext(OneSignal, 25000);

      await sleep(100);
    })();
    initStarted = p;
    writeWindowInitPromise(p);
  } else {
    initStarted = p;
  }

  await p;
}

export async function oneSignalLogin(externalUserId: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || !externalUserId) {
    return;
  }

  await ensureOneSignalInitialized();

  await runSdkSerialized(async () => {
    const OneSignal = await loadOneSignal();
    const subscribed = await waitForOnesignalSubscriptionContext(OneSignal);

    if (!subscribed) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[OneSignal] Skipping login: no onesignalId yet (notifications blocked, unsupported, or still registering).',
        );
      }
      return;
    }

    try {
      await OneSignal.login(externalUserId);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[OneSignal] login failed:', err);
      }
      return;
    }

    await sleep(500);
    await waitForOnesignalSubscriptionContext(OneSignal, 15000);

    /** `requestPermission` / `optIn` must stay in a click handler — see {@link requestWebPushSubscription}. */
  });
}

export async function oneSignalLogout(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
    return;
  }
  await ensureOneSignalInitialized();

  await runSdkSerialized(async () => {
    try {
      const OneSignal = await loadOneSignal();
      const id =
        typeof OneSignal.User.onesignalId === 'string'
          ? OneSignal.User.onesignalId.trim()
          : '';
      if (!id) {
        return;
      }
      await OneSignal.logout();
    } catch {
      /* ignore */
    }
  });
}
