'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { PageHeader } from '@/components/page-header';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { initialProductReviews, mockProducts } from '@/lib/mock-data/index';
import { Heart, Star, ShoppingCart, ArrowLeft, Send, ChevronDown, Package, X } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const { addToCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(initialProductReviews);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [relatedTypeFilter, setRelatedTypeFilter] = useState('all');

  useEffect(() => {
    setIsClient(true);
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedImageIndex(0);
    setRelatedTypeFilter('all');
  }, [productId]);

  if (isPageLoading) {
    return <SkeletonLoader />;
  }

  const toggleFavorite = (productId: string) => {
    const nextFavorites = favorites.includes(productId)
      ? favorites.filter((fav) => fav !== productId)
      : [...favorites, productId];
    setFavorites(nextFavorites);
    localStorage.setItem('favorites', JSON.stringify(nextFavorites));
    window.dispatchEvent(new Event('favorites-updated'));
  };

  const handleSubmitReview = () => {
    if (reviewText.trim()) {
      const newReview = {
        id: Date.now().toString(),
        author: 'You',
        rating: rating,
        date: 'Just now',
        text: reviewText,
      };
      setReviews((prev) => [newReview, ...prev]);
      setReviewText('');
      setRating(5);
    }
  };

  const product = mockProducts.find((p) => p.id === productId);

  if (!product) {
    return null;
  }

  const toTypeLabel = (value: string) =>
    value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const productImageOptions = Array.from(
    new Set([
      product.image,
      ...mockProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .map((p) => p.image),
    ])
  ).slice(0, 3);
  const selectedImage = productImageOptions[selectedImageIndex] ?? product.image;

  const rawRelatedProducts = mockProducts.filter((p) => p.id !== product.id);
  const relatedTypeOptions = Array.from(new Set(rawRelatedProducts.map((p) => p.category)));
  const filteredRelatedProducts = rawRelatedProducts
    .filter((p) => relatedTypeFilter === 'all' || p.category === relatedTypeFilter)
    .slice(0, 4);

  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const nameTokens = product.name.trim().split(/\s+/);
  const titleGradientWord =
    nameTokens.length > 1 ? nameTokens[nameTokens.length - 1]! : product.name;
  const titleLead =
    nameTokens.length > 1 ? nameTokens.slice(0, -1).join(' ') : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/shop')}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-primary hover:text-primary/80 hover:border-primary/40 font-semibold mb-6 transition-all shadow-sm backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shop
          </button>

          <PageHeader
            icon={Package}
            eyebrow={
              product.category.charAt(0).toUpperCase() + product.category.slice(1)
            }
            titleBefore={titleLead}
            titleGradient={titleGradientWord}
            description={
              <>
                {product.rating} stars · {product.reviews} reviews · from{' '}
                <span className="font-medium text-primary">Nature Leaf</span>
              </>
            }
          />

          {/* Product Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <button
                type="button"
                onClick={() => setIsImagePreviewOpen(true)}
                className="aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-md transition-colors hover:border-primary/30 hover:shadow-xl"
                aria-label={`Preview ${product.name} image`}
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </button>

              {/* Image Option Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {productImageOptions.map((image, index) => (
                  <button
                    key={`${product.id}-image-option-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary shadow-md'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} option ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-start rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-sm p-8 shadow-lg">
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      fill={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                      color={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-7 pb-7 border-b border-gray-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                {product.badge && (
                  <p className="text-sm text-primary font-semibold mt-2">
                    {product.badge}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-base leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-8">
                <label className="font-semibold text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 border-l border-r border-gray-300 font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => {
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: quantity,
                      image: product.image,
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to cart
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${
                    favorites.includes(product.id)
                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 text-gray-600 hover:border-primary hover:bg-gray-50'
                  } active:scale-95`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                    fill={favorites.includes(product.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-3 border-t border-gray-200 pt-8">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 hover:text-primary transition-colors py-4">
                    PRODUCT COMPOSITION
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-700 text-sm pb-4">
                    {product.description}
                  </p>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 hover:text-primary transition-colors py-4">
                    APPLICATION
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <ul className="text-gray-700 text-sm pb-4 space-y-2">
                    <li>✓ Apply to clean skin</li>
                    <li>✓ Use twice daily for best results</li>
                    <li>✓ Suitable for all skin types</li>
                  </ul>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 hover:text-primary transition-colors py-4">
                    COMPOSITION
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <ul className="text-gray-700 text-sm pb-4 space-y-2">
                    <li>🌿 Premium quality product</li>
                    <li>✓ Sustainable sourcing</li>
                    <li>✓ Fast & free shipping on orders over $500</li>
                    <li>✓ 30-day money back guarantee</li>
                  </ul>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 hover:text-primary transition-colors py-4">
                    ABOUT THE BRAND
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-700 text-sm pb-4">
                    We are committed to providing premium quality natural products that enhance your lifestyle while being kind to the environment.
                  </p>
                </details>
              </div>
            </div>
          </div>

   
        </div>

        {/* Related Products - "You Might Also Like" */}
        {rawRelatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              YOU MIGHT ALSO LIKE
            </h2>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRelatedTypeFilter('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  relatedTypeFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                All Types
              </button>
              {relatedTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRelatedTypeFilter(type)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    relatedTypeFilter === type
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {toTypeLabel(type)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => router.push(`/shop/${relatedProduct.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-gray-300 active:scale-95"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden border-b border-gray-200">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {relatedProduct.badge && (
                      <div className="absolute top-3 left-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {relatedProduct.badge}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(relatedProduct.id);
                      }}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-all active:scale-90"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(relatedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                        fill={favorites.includes(relatedProduct.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2">
                      {relatedProduct.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3"
                            fill={i < Math.floor(relatedProduct.rating) ? '#f59e0b' : '#e5e7eb'}
                            color={i < Math.floor(relatedProduct.rating) ? '#f59e0b' : '#e5e7eb'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({relatedProduct.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${relatedProduct.price}
                      </span>
                    </div>

                    {/* Shop Button */}
                    <button className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 py-2 rounded-lg font-semibold transition-all text-sm active:scale-95">
                      Shop
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredRelatedProducts.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-medium text-gray-500">
                No related products for this type yet.
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-20 border-t border-gray-200 pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{product.rating}</div>
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5"
                        fill={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                        color={i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">Based on {product.reviews} reviews</p>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-12">{stars}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : 3}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write Review & Reviews List */}
            <div className="lg:col-span-2">
              {/* Write Review Form */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Share your experience</h3>

                {/* Rating Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-all hover:scale-110 active:scale-90"
                      >
                        <Star
                          className="w-8 h-8 cursor-pointer"
                          fill={star <= rating ? '#f59e0b' : '#e5e7eb'}
                          color={star <= rating ? '#f59e0b' : '#e5e7eb'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your honest thoughts about this product..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewText.trim()}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">All Reviews ({reviews.length})</h3>
                </div>
                
                {/* Scrollable Reviews Container */}
                <div className={`space-y-4 ${reviews.length > 3 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      {/* User Profile Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.avatar}
                            alt={review.author}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{review.author}</p>
                              {review.verified && (
                                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        
                        {/* Rating Stars */}
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              fill={i < review.rating ? '#f59e0b' : '#e5e7eb'}
                              color={i < review.rating ? '#f59e0b' : '#e5e7eb'}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.text}</p>
                      
                      {/* Review Actions */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <button className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                          👍 Helpful
                        </button>
                        <button className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
                          Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isImagePreviewOpen && (
          <div className="fixed inset-0 z-[70]">
            <button
              aria-label="Close image preview"
              className="absolute inset-0 cursor-pointer bg-black/85"
              type="button"
              onClick={() => setIsImagePreviewOpen(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
              <button
                onClick={() => setIsImagePreviewOpen(false)}
                className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-black/55 p-2 text-white transition hover:bg-black/75"
                type="button"
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-[95vh] w-auto max-w-[96vw] object-contain"
              />
            </div>
          </div>
        )}
      </div>
  );
}
