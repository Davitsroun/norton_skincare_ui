'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { mockProducts, shopCategories, shopSortOptions } from '@/lib/mock-data/index';
import { Heart, Star, ShoppingCart, ChevronDown, Search } from 'lucide-react';

export default function ShopPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
    const search = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('search')
      : null;
    if (search) {
      setSearchQuery(decodeURIComponent(search));
    }
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  if (isPageLoading) {
    return <SkeletonLoader />;
  }

  const toggleFavorite = (productId: string) => {
    setFavorites((prevFavs) =>
      prevFavs.includes(productId)
        ? prevFavs.filter((id) => id !== productId)
        : [...prevFavs, productId]
    );
  };

  let filteredProducts = mockProducts;
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

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
  }

  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Our Shop
          </h1>
          <p className="text-gray-600">
            Browse our premium collection of CBD and hemp products
          </p>
        </div>

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
                {shopCategories.find((c) => c.id === selectedCategory)?.label}
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
                {shopSortOptions.find((s) => s.value === sortBy)?.label}
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
            Showing {filteredProducts.length} products
          </span>
        </div>

        <div>
          {/* Main Content */}
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {filteredProducts.map((product) => (
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
                      className="absolute top-4 right-4 bg-white rounded-full p-2.5 hover:bg-primary hover:text-white transition-all shadow-lg"
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
                        color={favorites.includes(product.id) ? '#ef4444' : 'currentColor'}
                      />
                    </button>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                        Quick View
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
              ))}
            </div>
        </div>
    </div>
  );
}
