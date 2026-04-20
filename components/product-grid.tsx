'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  color: 'primary' | 'secondary';
}

const products: Product[] = [
  {
    id: 1,
    name: 'Hydrating Face Serum',
    category: 'Serums',
    price: 48,
    rating: 4.8,
    reviews: 234,
    color: 'primary',
  },
  {
    id: 2,
    name: 'Gentle Cleanser',
    category: 'Cleansers',
    price: 32,
    rating: 4.9,
    reviews: 456,
    color: 'secondary',
  },
  {
    id: 3,
    name: 'Radiance Moisturizer',
    category: 'Moisturizers',
    price: 54,
    rating: 4.7,
    reviews: 189,
    color: 'primary',
  },
  {
    id: 4,
    name: 'Eye Contour Cream',
    category: 'Eye Care',
    price: 42,
    rating: 4.8,
    reviews: 312,
    color: 'secondary',
  },
  {
    id: 5,
    name: 'Vitamin C Brightener',
    category: 'Treatments',
    price: 58,
    rating: 4.9,
    reviews: 523,
    color: 'primary',
  },
  {
    id: 6,
    name: 'Night Recovery Mask',
    category: 'Masks',
    price: 45,
    rating: 4.8,
    reviews: 267,
    color: 'secondary',
  },
  {
    id: 7,
    name: 'Sunscreen SPF 50',
    category: 'Protection',
    price: 38,
    rating: 4.7,
    reviews: 401,
    color: 'primary',
  },
  {
    id: 8,
    name: 'Lip Balm Luxe',
    category: 'Lip Care',
    price: 22,
    rating: 4.9,
    reviews: 178,
    color: 'secondary',
  },
];

function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const colorClass = product.color === 'primary' ? 'from-primary/30 to-primary/10' : 'from-secondary/30 to-secondary/10';

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className={`relative h-48 md:h-56 bg-gradient-to-br ${colorClass} overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl md:text-5xl font-light mb-2">✨</div>
            <div className="text-xs md:text-sm">{product.category}</div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-all"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4">
        <div>
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="text-base md:text-lg font-light text-foreground line-clamp-2 text-balance">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex text-primary">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating) ? 'text-primary' : 'text-muted'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl md:text-2xl font-light text-foreground">${product.price}</p>
          <Button
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ProductGrid() {
  return (
    <section className="w-full py-12 md:py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
            Our <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Collection</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Handpicked products formulated with natural ingredients to nourish and enhance your skin
          </p>
        </div>

        {/* Product Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-border hover:bg-muted px-8"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
