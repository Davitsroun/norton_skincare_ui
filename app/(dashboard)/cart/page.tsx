'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Navigation } from '@/components/navigation';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  if (!isClient || isLoading || isPageLoading) {
    return (
      <>
        <Navigation />
        <SkeletonLoader />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">Shopping Cart</h1>
            <p className="text-gray-600">You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart
            <div className="bg-gray-50 rounded-lg shadow border border-gray-200 text-center py-16 px-8">
              <ShoppingBag className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <button
                onClick={() => router.push('/shop')}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-lg shadow border border-gray-200 p-6 flex gap-6 hover:shadow-lg transition-all"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-lg font-bold text-primary mb-3">₹{item.price}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right flex flex-col justify-between">
                      <p className="font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                  {/* Summary Items */}
                  <div className="space-y-3 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{(cartTotal * 0.1).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="py-6 border-b border-gray-200">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{(cartTotal * 1.1).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3 pt-6">
                    <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => router.push('/shop')}
                      className="w-full border-2 border-primary text-primary hover:bg-primary/10 py-3 rounded-xl font-semibold transition-all"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full text-red-600 hover:text-red-700 font-semibold text-sm transition-colors hover:bg-red-50 py-2 rounded-lg"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
