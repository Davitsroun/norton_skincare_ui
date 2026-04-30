'use client';

import {
  CheckCircle2,
  Info,
  X,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type ModernToastVariant = 'success' | 'error' | 'info' | 'warning';

type ModernToastInput = {
  header: string;
  message?: string;
  variant?: ModernToastVariant;
  duration?: number;
};

type ModernToast = ModernToastInput & {
  id: string;
  variant: ModernToastVariant;
};

type ModernToastContextValue = {
  showToast: (toast: ModernToastInput) => void;
  dismissToast: (id: string) => void;
};

const ModernToastContext = createContext<ModernToastContextValue | null>(null);

const toastStyles: Record<
  ModernToastVariant,
  {
    icon: typeof CheckCircle2;
    toastClass: string;
    iconClass: string;
    barClass: string;
    titleClass: string;
    messageClass: string;
    closeClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    toastClass: 'border-emerald-200/80 bg-emerald-50/95 shadow-emerald-900/10',
    iconClass: 'text-emerald-700 bg-white/85',
    barClass: 'bg-emerald-500',
    titleClass: 'text-emerald-950',
    messageClass: 'text-emerald-800/80',
    closeClass: 'text-emerald-700/70 hover:bg-emerald-100 hover:text-emerald-950',
  },
  error: {
    icon: XCircle,
    toastClass: 'border-red-200/80 bg-red-50/95 shadow-red-900/10',
    iconClass: 'text-red-700 bg-white/85',
    barClass: 'bg-red-500',
    titleClass: 'text-red-950',
    messageClass: 'text-red-800/80',
    closeClass: 'text-red-700/70 hover:bg-red-100 hover:text-red-950',
  },
  info: {
    icon: Info,
    toastClass: 'border-sky-200/80 bg-sky-50/95 shadow-sky-900/10',
    iconClass: 'text-sky-700 bg-white/85',
    barClass: 'bg-sky-500',
    titleClass: 'text-sky-950',
    messageClass: 'text-sky-800/80',
    closeClass: 'text-sky-700/70 hover:bg-sky-100 hover:text-sky-950',
  },
  warning: {
    icon: AlertTriangle,
    toastClass: 'border-amber-200/80 bg-amber-50/95 shadow-amber-900/10',
    iconClass: 'text-amber-700 bg-white/85',
    barClass: 'bg-amber-500',
    titleClass: 'text-amber-950',
    messageClass: 'text-amber-800/80',
    closeClass: 'text-amber-700/70 hover:bg-amber-100 hover:text-amber-950',
  },
};

export function ModernToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ModernToast[]>([]);
  const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
  }, []);

  const showToast = useCallback(
    ({ header, message, variant = 'success', duration = 5000 }: ModernToastInput) => {
      const id = crypto.randomUUID();
      const nextToast: ModernToast = {
        id,
        header,
        message,
        variant,
        duration,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));
      timeoutRefs.current[id] = setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast]
  );

  return (
    <ModernToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.variant];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-4 pr-11 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-right-5 fade-in',
                style.toastClass
              )}
              role="status"
            >
              <div className={cn('absolute inset-y-0 left-0 w-1', style.barClass)} />
              <div className="flex gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    style.iconClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-bold', style.titleClass)}>{toast.header}</p>
                  {toast.message && (
                    <p className={cn('mt-1 text-sm leading-5', style.messageClass)}>
                      {toast.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className={cn('absolute right-3 top-3 rounded-full p-1 transition', style.closeClass)}
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ModernToastContext.Provider>
  );
}

export function useModernToast() {
  const context = useContext(ModernToastContext);

  if (!context) {
    throw new Error('useModernToast must be used within ModernToastProvider');
  }

  return context;
}
