'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-secondary border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Newsletter Section */}
        <div className="mb-12 md:mb-16 p-8 md:p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-light text-foreground mb-2">
                Join Our Community
              </h3>
              <p className="text-muted-foreground text-base">
                Get exclusive offers and skincare tips delivered to your inbox
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background border-border focus:ring-primary"
              />
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 md:mb-16">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-lg font-light text-foreground mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Luminous
              </span>
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium natural skincare designed for your radiant beauty.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Shop</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Collections
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sale
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 Luminous Skincare. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
