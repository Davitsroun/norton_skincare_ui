'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Phone, Mail, CreditCard } from 'lucide-react';

const footerColumns = [
  {
    title: 'Store',
    lines: ['Nature Leaf Wellness', '123 Green Street', 'Mumbai, India 400001', 'Mon–Sat: 9:00 – 20:00'],
  },
  {
    title: 'Information',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/shop', label: 'Shop' },
      { href: '/history', label: 'Order History' },
    ],
  },
  {
    title: 'My Account',
    links: [
      { href: '/profile', label: 'My Profile' },
      { href: '/favorites', label: 'Favorites' },
      { href: '/cart', label: 'Shopping Cart' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { href: '/shop', label: 'All Products' },
      { href: '/shop?search=tincture', label: 'Tinctures' },
      { href: '/shop?search=gummies', label: 'Gummies' },
    ],
  },
] as const;

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-primary/15 bg-gradient-to-b from-[#f4faf9] to-[#eef8f6] text-gray-700">
      {/* Top strip — contact */}
      <div className="border-b border-primary/10 bg-[#e8f4f1]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
            <a
              href="tel:+918000000000"
              className="flex cursor-pointer items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>+91 8000 000 000</span>
            </a>
            <a
              href="mailto:hello@natureleaf.example"
              className="flex cursor-pointer items-center gap-2 transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span>hello@natureleaf.example</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-3">
            <Link
              href="/home"
              className="mb-4 flex cursor-pointer items-center gap-2 text-xl font-bold text-gray-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                ✓
              </span>
              Nature Leaf
            </Link>
            <p className="text-sm leading-relaxed text-gray-600">
              Premium hemp CBD products for everyday wellness—sourced with care, delivered with trust.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="mb-4 border-b border-primary/15 pb-2 text-sm font-bold uppercase tracking-wide text-gray-800">
                {col.title}
              </h4>
              {'lines' in col ? (
                <div className="flex gap-2 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <ul className="space-y-1">
                    {col.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="cursor-pointer text-gray-600 transition-colors hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          Newsletter
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Nature Leaf. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
