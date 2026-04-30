'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { mockProducts } from '@/lib/mock-data/index';
import { PageHeader } from '@/components/page-header';
import { Heart, HeartOff, ShoppingCart, Star } from 'lucide-react';
import { useModernToast } from '@/components/modern-toast';

export default function FavoritesPage() {
  const { addToCart } = useCart();
  const { showToast } = useModernToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || isPageLoading) {
    return <SkeletonLoader />;
  }

  const favoriteProducts = mockProducts.filter((p) => favorites.includes(p.id));

  const removeFavorite = (productId: string) => {
    const nextFavorites = favorites.filter((id) => id !== productId);
    setFavorites(nextFavorites);
    localStorage.setItem('favorites', JSON.stringify(nextFavorites));
    window.dispatchEvent(new Event('favorites-updated'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <button
          type="button"
          onClick={() => router.push('/shop')}
          className="mb-8 flex cursor-pointer items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </button> */}

        <PageHeader
          icon={Heart}
          eyebrow="Saved for you"
          titleBefore="My"
          titleGradient="Favorites"
          description={
            favoriteProducts.length > 0 ? (
              <>
                {favoriteProducts.length} item{favoriteProducts.length > 1 ? 's' : ''}{' '}
                saved with{' '}
                <span className="font-medium text-primary">Nature Leaf</span>
              </>
            ) : (
              <>
                Save products you love — sign in and heart items across{' '}
                <span className="font-medium text-primary">Nature Leaf</span>
              </>
            )
          }
        />

        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6 text-center">
              Start adding products to your favorites to see them here
            </p>
            <button
              type="button"
              onClick={() => router.push('/shop')}
              className="cursor-pointer rounded-lg bg-gradient-to-r from-primary to-primary/90 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-xl"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary/30"
              >
                {/* Product Image Container */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      {product.badge}
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    type="button"
                    aria-label="Remove from favorites"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(product.id);
                    }}
                    className="absolute right-4 top-4 cursor-pointer rounded-full bg-white p-2.5 shadow-lg transition-all hover:bg-red-100"
                  >
                    <Heart
                      className="w-5 h-5 fill-red-500 text-red-500"
                    />
                  </button>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => router.push(`/shop/${product.id}`)}
                      className="-translate-y-2 transform cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform group-hover:translate-y-0 hover:bg-primary/90"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-3 text-base leading-snug line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5"
                          fill={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                          color={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          image: product.image,
                        });
                        showToast({
                          header: 'Added to cart',
                          message: `${product.name} is in your basket.`,
                          variant: 'success',
                        });
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-lg"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      ADD TO CART
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFavorite(product.id)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50"
                    >
                      <HeartOff className="h-4 w-4" aria-hidden />
                      Unfavorite
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
