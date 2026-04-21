'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { SiteFooter } from '@/components/site-footer';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { Phone, Mail, MapPin, CheckCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

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
      {/* Header Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-primary/20">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/vecteezy_sky-cartoon-background-video_20106487.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4">
            <span className="text-white/90 font-semibold text-sm uppercase tracking-wide">Get In Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-balance">
            Contact Us
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Logo Grid */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-gray-600 font-semibold text-sm uppercase tracking-wide mb-8">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
            {['Logo', 'LogoIpsum', 'Logo', 'LogoIpsum'].map((logo, idx) => (
              <div key={idx} className="text-center py-8 border border-gray-200 rounded-xl bg-white hover:shadow-md hover:border-primary/30 transition-all">
                <p className="text-gray-600 font-semibold">{logo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Send us a message
              </h2>
              <p className="text-gray-600 mb-8">We'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  {/* Phone */}
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-300 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Name */}
                <Input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-300 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
                />

                {/* Message */}
                <textarea
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-semibold hover:from-primary/90 hover:to-primary transition-all shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-8 shadow-lg border border-primary/30">
              <h3 className="text-2xl font-bold mb-2">Our Newsletter</h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Subscribe to receive exclusive updates, special offers, and wellness tips delivered to your inbox.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all shadow-md"
                >
                  Subscribe Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Phone</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Call us to get support and answer any questions about our products.
              </p>
              <p className="text-primary font-bold text-lg">(+876) 765 665</p>
            </div>

            {/* Email Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Email</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Reach out to us via email for detailed inquiries and support.
              </p>
              <p className="text-primary font-bold text-lg">
                mail@natureleaf.id
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Location</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Visit us at our headquarters for more information.
              </p>
              <p className="text-primary font-bold text-lg">
                London Eye, London UK
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Find Us Here</h2>
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.9860933036508!2d-74.00601592345047!3d40.71282033110619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a27aebb0e61%3A0x40a5456225df38d!2sLondon%20Eye!5e0!3m2!1sen!2suk!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
            About Nature Leaf
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover our commitment to quality and sustainability
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Nature Leaf is a premium CBD and hemp product company dedicated to
                providing the highest quality products to our customers. We believe
                in the power of nature and science combined to create wellness
                solutions for everyone.
              </p>

              <div className="space-y-3">
                {[
                  'Premium Quality Products',
                  'Sustainable & Eco-Friendly',
                  'Third-Party Tested',
                  'Customer-Focused Service',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl overflow-hidden shadow-lg border border-primary/20">
              <img
                src="https://i.pinimg.com/736x/e8/19/1a/e8191a94ec634f5d5b6f17cb1ccf042a.jpg"
                alt="Nature Leaf Team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </ProtectedRoute>
  );
}
