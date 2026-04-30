'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { mockProducts, shopCategories, shopSortOptions, getCategoryDisplayLabel } from '@/lib/mock-data/index';
import { PageHeader } from '@/components/page-header';
import { Heart, Star, ShoppingCart, ChevronDown, Search, Store } from 'lucide-react';
import { getProductAction } from '@/actions/product-action';
import type { Product } from '@/lib/mock-data/types';
import { apiItemToProduct } from '@/lib/product-utils';

const PAGE_SIZE = 8;
/** Product list query — matches `ProductListFilters` / `minPrice` & `maxPrice` query params */
const CATALOG_MIN_PRICE = 5;
const CATALOG_MAX_PRICE = 20;

/** Everything returned from the last catalog fetch */
type ShopCatalog = {
  loading: boolean;
  products: Product[];
  /** If set, the API controls pagination (page/count). Otherwise we slice `products` in the browser. */
  serverPaging: { pageCount: number; totalCount: number } | null;
  /** Shown when we fell back to mock data */
  fallbackHint: string | null;
};

function catalogFromServerResponse(
  res: Awaited<ReturnType<typeof getProductAction>>
): Pick<ShopCatalog, 'products' | 'serverPaging' | 'fallbackHint'> {
  if (res.success && res.data && Array.isArray(res.data.items)) {
    const pr = res.data.paginationResponse;
    return {
      products: res.data.items.map(apiItemToProduct),
      serverPaging: {
        pageCount: Math.max(1, pr.totalPages),
        totalCount: pr.totalElements,
      },
      fallbackHint: null,
    };
  }
  return {
    products: mockProducts,
    serverPaging: null,
    fallbackHint: res.error ?? 'Could not load catalog',
  };
}

export default function ShopPage() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('all-price');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [catalog, setCatalog] = useState<ShopCatalog>({
    loading: true,
    products: [],
    serverPaging: null,
    fallbackHint: null,
  });

  /** Read URL + favorites once on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
    const search = new URLSearchParams(window.location.search).get('search');
    if (search) {
      setSearchQuery(decodeURIComponent(search));
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setCatalog((c) => ({ ...c, loading: true }));

    void (async () => {
      const res = await getProductAction(currentPage - 1, PAGE_SIZE, {
        minPrice: CATALOG_MIN_PRICE,
        maxPrice: CATALOG_MAX_PRICE,
      });
      if (cancelled) {
        return;
      }
      const next = catalogFromServerResponse(res);
      setCatalog({ loading: false, ...next });
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const toggleFavorite = (productId: string) => {
    const nextFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(nextFavorites);
    localStorage.setItem('favorites', JSON.stringify(nextFavorites));
    window.dispatchEvent(new Event('favorites-updated'));
  };

  let filteredProducts = catalog.products;
  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === selectedCategory
    );
  }
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(
      (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort products (All Price = server / original order)
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }
  const totalPages = catalog.serverPaging
    ? catalog.serverPaging.pageCount
    : Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedProducts = catalog.serverPaging
    ? filteredProducts
    : filteredProducts.slice(startIndex, endIndex);

  const displayTotal = catalog.serverPaging
    ? catalog.serverPaging.totalCount
    : filteredProducts.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <PageHeader
          icon={Store}
          eyebrow="Browse"
          titleBefore="Our"
          titleGradient="Shop"
          description={
            <>
              Explore our premium CBD and hemp collection from{' '}
              <span className="font-medium text-primary">Nature Leaf</span>
            </>
          }
        />

        {!catalog.loading && catalog.fallbackHint && (
          <div
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            Showing sample products — live catalog did not load ({catalog.fallbackHint}). Check{' '}
            <code className="rounded bg-amber-100/80 px-1">localhost:8082</code>.
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
          {/* Search Input */}
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-48 relative">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:border-primary transition-colors"
            >
              <span className="font-medium">
                {shopCategories.find((c) => c.id === selectedCategory)?.label ?? 'All Products'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {shopCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors ${
                      selectedCategory === cat.id ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48 relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:border-primary transition-colors"
            >
              <span className="font-medium">
                {shopSortOptions.find((s) => s.value === sortBy)?.label ?? 'All Price'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {shopSortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors ${
                      sortBy === option.value ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1"></div>
          <span className="text-sm text-gray-600 hidden sm:inline">
            {catalog.serverPaging
              ? `${paginatedProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPage * PAGE_SIZE,
                  displayTotal
                )} of ${displayTotal} products`
              : `Showing ${filteredProducts.length === 0 ? 0 : startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} products`}
          </span>
        </div>

        <div>
          {/* Main Content */}
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mx-15 ">
              {catalog.loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse"
                  >
                    <div className="aspect-square rounded-xl bg-gray-200" />
                    <div className="mt-4 h-3 w-1/3 rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-4/5 rounded bg-gray-200" />
                    <div className="mt-4 h-6 w-1/2 rounded bg-gray-200" />
                  </div>
                ))
              ) : (
                paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-primary/30"
                  onClick={() => router.push(`/shop/${product.id}`)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute top-4 right-4 bg-white rounded-full p-2.5 hover:bg-red-400 hover:text-white transition-all shadow-lg"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                        fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
                      />
                    </button>

                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">
                      {getCategoryDisplayLabel(product.category)}
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

                    {/* Shop Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          image: product.image,
                        });
                      }}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      ADD TO CART
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
            {!catalog.loading && totalPages > 1 && (
              <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 rounded-lg text-sm font-semibold transition-colors ${
                      safeCurrentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
        </div>
    </div>
    </div>
  );
}
