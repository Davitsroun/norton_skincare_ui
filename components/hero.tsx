'use client';

import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-background via-secondary/10 to-muted py-12 md:py-20 lg:py-32 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full -ml-36 -mb-36" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground text-balance">
                Radiant Skin,{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Naturally
                </span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
                Discover our premium collection of natural skincare products crafted with the finest ingredients to reveal your most luminous self.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg w-full sm:w-auto"
              >
                Shop Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-border hover:bg-muted w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-8 pt-4">
              <div>
                <p className="text-2xl md:text-3xl font-light text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-light text-secondary">100%</p>
                <p className="text-sm text-muted-foreground">Natural Ingredients</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-light text-primary">30+</p>
                <p className="text-sm text-muted-foreground">Product Range</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-64 md:h-full min-h-96 flex items-center justify-center">
            <div className="relative w-full h-full max-w-md">
              {/* Gradient circles background */}
              <div className="absolute top-12 right-12 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-12 left-12 w-40 h-40 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl" />

              {/* Product showcase placeholder */}
              <div className="relative h-full flex items-center justify-center">
                <div className="w-48 h-64 md:w-56 md:h-80 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl flex items-center justify-center text-muted-foreground text-center p-4">
                  <div className="text-sm md:text-base">Premium Skincare Collection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
