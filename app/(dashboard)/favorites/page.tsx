'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { PageHeader } from '@/components/page-header';
import { Heart, ShoppingCart } from 'lucide-react';
import { useModernToast } from '@/components/modern-toast';
import {
  deleteFavoriteBrandAction,
  listFavoriteBrandsAction,
} from '@/actions/favorite-brand-actions';
import type { FavoriteBrandListItem } from '@/types/favorite-brand';

export default function FavoritesPage() {
  const { showToast } = useModernToast();
  const router = useRouter();
  const { status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<FavoriteBrandListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (status !== 'authenticated') {
      setRows([]);
      setErrorMessage(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    const res = await listFavoriteBrandsAction({ page: 0, size: 50 });
    if (!res.success) {
      setRows([]);
      setErrorMessage(res.error ?? 'Could not load favorites.');
      setLoading(false);
      return;
    }
    setRows(res.data ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || status === 'loading') {
      return;
    }
    void loadFavorites();
  }, [isClient, status, loadFavorites]);

  const removeFavorite = async (row: FavoriteBrandListItem) => {
    const res = await deleteFavoriteBrandAction(row.favoriteBrandId);
    if (!res.success) {
      showToast({
        header: 'Could not remove',
        message: res.error ?? 'Please try again.',
        variant: 'error',
      });
      return;
    }
    showToast({
      header: 'Removed',
      message: 'Brand removed from your favorites.',
      variant: 'success',
    });
    await loadFavorites();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('favorite-brands-updated'));
    }
  };

  if (!isClient || status === 'loading') {
    return <SkeletonLoader />;
  }

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-secondary/60 via-background to-primary/5 px-4 py-16">
        <PageHeader
          icon={Heart}
          eyebrow="Saved for you"
          titleBefore="My"
          titleGradient="Favorites"
          description="Sign in to see brands you saved from product pages."
          className="max-w-xl"
          contentClassName="text-center w-full"
        />
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-lg hover:bg-primary/90"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          icon={Heart}
          eyebrow="Saved for you"
          titleBefore="My"
          titleGradient="Favorite brands"
          description={
            rows.length > 0 ? (
              <>
                {rows.length} saved brand{rows.length !== 1 ? 's' : ''} from{' '}
                <span className="font-medium text-primary">favorite-brands</span> API — products under these brands appear in Shop.
              </>
            ) : (
              <>
                Heart a brand from a product detail page — we use POST{' '}
                <span className="font-medium text-primary">/api/v1/favorite-brands</span> with{' '}
                <code className="rounded bg-secondary px-1">brandId</code>.
              </>
            )
          }
        />

        {errorMessage ? (
          <div
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 py-16">
            <Heart className="mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">No favorite brands yet</h2>
            <p className="mb-6 max-w-md text-center text-gray-600">
              Open any product that includes a{' '}
              <code className="rounded bg-white px-1">brandId</code> from your catalog and tap the heart — it saves the
              brand, not the individual product SKU.
            </p>
            <button
              type="button"
              onClick={() => router.push('/shop')}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-primary to-primary/90 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Browse shop
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {rows.map((row) => {
                const displayImageSrc =
                  (row.imageUrl && row.imageUrl.trim() !== '' ? row.imageUrl : '') ||
                  (row.image && row.image.trim() !== '' ? row.image : '') ||
                  '/placeholder.svg';
                return (
                <div
                  key={row.favoriteBrandId}
                  className="group cursor-default overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    <img
                      src={displayImageSrc}
                      alt={
                        row.productName?.trim() || row.name?.trim()
                          ? (row.productName ?? row.name ?? 'Favorite')
                          : 'Favorite brand'
                      }
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      aria-label="Remove from favorites"
                      onClick={() => void removeFavorite(row)}
                      className="absolute right-4 top-4 cursor-pointer rounded-full bg-white p-2.5 shadow-lg transition-all hover:bg-red-50"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <div className="p-5">
                    {row.productName?.trim() ? (
                      <>
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                          Sample product
                        </p>
                        <h3 className="mb-1 line-clamp-2 text-lg font-bold text-gray-900">{row.productName}</h3>
                        {typeof row.price === 'number' ? (
                          <p className="mb-2 text-base font-semibold text-primary">${row.price.toFixed(2)}</p>
                        ) : null}
                        <p className="mb-1 text-xs text-muted-foreground">
                          Brand{' '}
                          <span className="font-semibold text-gray-800">
                            {row.name?.trim() ? row.name : row.brandId.slice(0, 8)}
                          </span>
                          {row.country ? (
                            <span className="text-muted-foreground"> · {row.country}</span>
                          ) : null}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Brand</p>
                        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">
                          {row.name?.trim()
                            ? row.name
                            : `Brand ${row.brandId.slice(0, 8)}…`}
                        </h3>
                        {row.country ? (
                          <p className="mb-2 text-xs text-muted-foreground">{row.country}</p>
                        ) : null}
                      </>
                    )}
                    {/* <p className="mb-3 font-mono text-xs text-muted-foreground break-all">brand id · {row.brandId}</p> */}
                    {row.description ? (
                      <p className="mb-4 line-clamp-3 text-sm text-gray-600">{row.description}</p>
                    ) : null}

                    <div className="flex flex-col gap-2">
                      {row.productId?.trim() ? (
                        <button
                          type="button"
                          onClick={() => {
                            const id = row.productId?.trim();
                            if (id) router.push(`/shop/${encodeURIComponent(id)}`);
                          }}
                          className="w-full rounded-lg border border-primary/30 bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                        >
                          View product
                        </button>
                      ) : null}
                        {/* <button
                          type="button"
                          onClick={() => router.push('/shop')}
                          className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                        >
                          Shop catalog
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast({
                              header: 'Find products',
                              message: `Filter catalog by brand in Shop or choose items from ${row.name ?? 'this brand'} on product cards.`,
                              variant: 'info',
                            });
                          }}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Shopping tip
                        </button> */}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
