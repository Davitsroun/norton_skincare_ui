'use client';

import { PageHeader } from '@/components/page-header';
import { ProtectedRoute } from '@/components/protected-route';
import { SiteFooter } from '@/components/site-footer';
import { SkeletonLoader } from '@/components/skeleton-loader';
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Send,
  Leaf,
  Shield,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

const highlightStats = [
  {
    label: 'Broad-spectrum focus',
    value: '100%',
    cardClass:
      'border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-white to-secondary/30',
    valueClass: 'text-primary',
  },
  {
    label: 'Third-party tested',
    value: 'Lab OK',
    cardClass:
      'border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50',
    valueClass: 'text-emerald-800',
  },
  {
    label: 'Response time',
    value: '< 24h',
    cardClass:
      'border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/50',
    valueClass: 'text-sky-800',
  },
  {
    label: 'Wellness categories',
    value: '12+',
    cardClass:
      'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40',
    valueClass: 'text-amber-900',
  },
] as const;

const contactChannels = [
  {
    title: 'Phone',
    detail: '(+876) 765 665',
    hint: 'Weekdays 9am–6pm',
    icon: Phone,
    cardClass:
      'border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/80 via-white to-white',
  },
  {
    title: 'Email',
    detail: 'mail@natureleaf.id',
    hint: 'We reply within one business day',
    icon: Mail,
    cardClass:
      'border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-white to-secondary/20',
  },
  {
    title: 'Studio',
    detail: 'Preah Sihanouk Blvd (274), Phnom Penh',
    hint: 'Visits by appointment',
    icon: MapPin,
    cardClass:
      'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/70 via-white to-white',
  },
] as const;

const brandPillars = [
  'Premium hemp & CBD sourcing',
  'Sustainable packaging where we can',
  'Transparent lab results',
  'Support that actually answers',
] as const;

/**
 * Must be an embeddable URL — not a normal https://www.google.com/maps/place/… link.
 * To refresh: Google Maps → Share → Embed a map → copy the iframe `src`.
 * Fallback below uses coordinates (classic embed format).
 */
const GOOGLE_MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent('11.5560765,104.927258')}&z=17&hl=en&output=embed`;

const GOOGLE_MAPS_PLACE_URL =
  'https://www.google.com/maps/place/Preah+Sihanouk+Blvd+(274),+Phnom+Penh,+Cambodia/@11.5560765,104.927258,17z';

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    message: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us!');
    setFormData({ email: '', phone: '', name: '', message: '' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    alert('Successfully subscribed to our newsletter!');
    setEmail('');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            icon={Leaf}
            eyebrow="Who we are"
            titleBefore="About"
            titleGradient="Us"
            description={
              <>
                Our story, how to reach the team, and what drives{' '}
                <span className="font-medium text-primary">Nature Leaf</span> — same calm,
                modern layout you see across your account.
              </>
            }
          />

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlightStats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-gray-200/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${stat.cardClass}`}
              >
                <p className="mb-2 text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.valueClass}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200/90 bg-white/90 shadow-md transition-all duration-300 hover:border-primary/25 hover:shadow-lg">
            <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-stretch">
              <div className="flex-1 space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
                  <span
                    className="h-1 w-6 rounded-full bg-primary"
                    aria-hidden
                  />
                  Our story
                </h2>
                <p className="leading-relaxed text-gray-700">
                  Nature Leaf brings together careful sourcing and honest labeling for
                  broad-spectrum CBD and hemp wellness. We focus on products adults (and
                  pets) can trust — without hype, and with support when you need it.
                </p>
                <ul className="space-y-3">
                  {brandPillars.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span className="font-medium text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 to-secondary/40 lg:max-w-md">
                <img
                  src="https://i.pinimg.com/736x/e8/19/1a/e8191a94ec634f5d5b6f17cb1ccf042a.jpg"
                  alt="Nature Leaf team and products"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-primary/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" aria-hidden />
                Contact
              </span>
              <p className="text-sm text-gray-600">
                Send a note — we read every message.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Message us</h3>
                  <p className="text-sm text-gray-600">
                    We&apos;ll get back as soon as we can, usually within 24 hours.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea
                    name="message"
                    placeholder="How can we help?"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 font-semibold text-white shadow-md shadow-primary/20 transition-all hover:from-primary/90 hover:to-primary hover:shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                    Send message
                  </button>
                </form>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-secondary/30 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" aria-hidden />
                  <h3 className="font-bold text-gray-900">Newsletter</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  Occasional drops: new batches, gentle reminders, and wellness tips — no
                  spam.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="mt-auto space-y-3">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition-all hover:bg-gray-800"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {contactChannels.map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.title}
                  className={`rounded-2xl border border-gray-200/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${ch.cardClass}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-bold text-gray-900">{ch.title}</h3>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">{ch.hint}</p>
                  <p className="font-semibold text-primary">{ch.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-8 overflow-hidden rounded-xl border border-gray-200/90 bg-white/90 shadow-md">
            <div className="flex flex-col gap-1 border-b border-gray-100 bg-white/80 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <MapPin className="h-5 w-5 text-primary" aria-hidden />
                Find us
              </h2>
              <p className="text-sm text-gray-600">
                <a
                  href={GOOGLE_MAPS_PLACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Open in Google Maps
                </a>
              </p>
            </div>
            <div className="aspect-[21/9] min-h-[240px] w-full sm:min-h-[320px]">
              <iframe
                title="Nature Leaf on Google Maps"
                src={GOOGLE_MAPS_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[240px] w-full sm:min-h-[320px]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-primary/25 bg-secondary/30 px-5 py-6 text-center sm:px-8">
            <div className="mx-auto mb-2 flex justify-center gap-2 text-primary">
              <Clock className="h-5 w-5" aria-hidden />
              <Leaf className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm font-medium text-gray-800">
              Built for clarity — questions welcome anytime.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              You&apos;ll see the same header and card style here as on order history and
              shop pages.
            </p>
          </div>
        </div>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
