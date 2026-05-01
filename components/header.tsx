'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ShoppingCart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Luminous
              </span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Shop
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Blog
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full text-sm w-48 bg-muted border-border focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-6 mt-8">
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Shop
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Blog
                  </a>
                  <a
                    href="#"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
