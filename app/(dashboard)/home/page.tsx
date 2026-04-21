'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { SiteFooter } from '@/components/site-footer';
import { mockProducts, testimonials } from '@/lib/mock-data/index';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let observer: IntersectionObserver | null = null;
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute('data-product-id');
            if (productId) {
              setVisibleProducts((prev) => [...new Set([...prev, productId])]);
            }
          }
        });
      }, observerOptions);

      const productElements = document.querySelectorAll('[data-product-id]');
      productElements.forEach((el) => observer?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <ProtectedRoute>
      {/* Hero Section */}
      <section className="bg-white text-gray-900 py-16 sm:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-4">
                Premium CBD Collection
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Sustainable Healing, from Hemp, With Love
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                We provide premium quality Hemp CBD products that promote health and wellness for adults and pets without the risk of psychoactive effects.
              </p>
              
              {/* Key Points */}
              <ul className="space-y-3 mb-8">
                {[
                  'Food Grade Hemp',
                  'Active Lifestyle for anyone Bio-availability',
                  'Hemp CBD, Hemp Packaging',
                  'Broad Spectrum'
                ].map((point, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                href="/shop"
                className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                SHOP NOW
              </Link>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-pink-200 to-teal-200 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src="https://i.pinimg.com/736x/ee/37/6a/ee376acaed8d25b030f85b6a31b39f31.jpg"
                  alt="CBD Tincture"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Product Card */}
              <div className="absolute bottom-8 right-8 bg-white rounded-xl p-4 shadow-xl">
                <p className="text-xs text-gray-500 font-semibold">NEW</p>
                <p className="text-sm font-bold text-gray-900">Best Seller</p>
                <p className="text-xs text-gray-600 mt-2">Custom Subscription for 3 months</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              Premium quality Broad-Spectrum CBD from hemp.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                data-product-id={product.id}
                className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform ${
                  visibleProducts.includes(product.id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-pink-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                      {product.badge}
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
                      color={favorites.includes(product.id) ? '#ef4444' : '#9ca3af'}
                    />
                  </button>

                  {/* Quick View */}
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-primary text-white px-4 py-2 rounded-xl font-semibold text-sm">
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          fill={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                          color={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Shop Button */}
                  <button className="w-full bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                    <ShoppingCart className="w-4 h-4" />
                    SHOP NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400"
                      color="#fbbf24"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Special Promotion
          </h2>
          <p className="text-primary/20 mb-8 text-lg">
            Get 25% off on all products this month
          </p>
          <Link
            href="/shop"
            className="inline-block cursor-pointer rounded-xl bg-white px-8 py-3 font-semibold text-primary shadow-lg transition-colors hover:bg-gray-100"
          >
            Shop Sale
          </Link>
        </div>
      </section>

      <SiteFooter />
    </ProtectedRoute>
  );
}
