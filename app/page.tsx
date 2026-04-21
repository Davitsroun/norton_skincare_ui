'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Github, Apple, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { loginSchema } from '@/lib/validations/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const isMockAuth = (process.env.NEXT_PUBLIC_AUTH_MODE ?? 'mock') === 'mock';

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('error') || params.has('callbackUrl')) {
        window.history.replaceState({}, '', '/');
      }
    }
    if (isAuthenticated) {
      router.push(isAdmin ? '/admin' : '/home');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setErrors({ email: 'Invalid mock credentials.' });
      }
    } catch {
      setErrors({ email: 'Unable to start Keycloak login. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{ backgroundImage: "url('/back_ground.gif')" }}
    >
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white/92 shadow-2xl">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center bg-white/90 p-8 sm:p-12 md:w-1/2">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Simplify your workflow and boost your productivity with Tuga's App. Get started for free.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isMockAuth && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <p>Mock admin: admin@gmail.com / Admin123!</p>
                <p>Mock user: user@gmail.com / User12345!</p>
              </div>
            )}
            {/* Email Input */}
            <div>
              <Input
                type="email"
                placeholder="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`rounded-full border-2 pl-5 py-3 text-base transition-colors placeholder:text-gray-400 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-primary'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`rounded-full border-2 pl-5 pr-12 py-3 text-base transition-colors placeholder:text-gray-400 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right pt-1">
              <Link
                href="/forgot-password"
                className="text-gray-700 hover:text-primary text-sm font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-full transition-colors h-auto disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600 font-medium">or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-3 justify-center">
            <button className="w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors flex items-center justify-center">
              <Github className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors flex items-center justify-center">
              <Facebook className="w-5 h-5" />
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 text-sm mt-8">
            Not a member?{' '}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Register now
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden w-1/2 items-center justify-center bg-primary/60 p-12 backdrop-blur-[1px] lg:flex">
        <div className="text-center max-w-sm">
          {/* Circular Illustration with decorative elements */}
          <div className="relative mx-auto mb-12 w-72 h-72 flex items-center justify-center">
            {/* Outer decorative circles */}
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 288 288">
              <circle cx="144" cy="144" r="140" fill="none" stroke="#68B2AD" strokeWidth="1" opacity="0.3" />
              <circle cx="144" cy="144" r="110" fill="none" stroke="#68B2AD" strokeWidth="1" opacity="0.2" />
            </svg>

            {/* Illustration content - simplified people/community */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Central figure */}
              <div className="mb-8 flex flex-col items-center">
                {/* Head */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center mb-2 shadow-lg border-4 border-white">
                  <span className="text-5xl">👩</span>
                </div>
                
                {/* Body with heart */}
                <div className="flex items-center gap-6 mt-4">
                  <span className="text-4xl animate-bounce">🙋</span>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-4xl">💚</span>
                  </div>
                  <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🙋</span>
                </div>
              </div>

              {/* Surrounding user avatars */}
              <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white border-3 border-primary flex items-center justify-center shadow-md">
                <span className="text-2xl">👤</span>
              </div>
              <div className="absolute -top-2 -right-8 w-14 h-14 rounded-full bg-white border-3 border-primary flex items-center justify-center shadow-md">
                <span className="text-2xl">👤</span>
              </div>
              <div className="absolute bottom-0 -right-6 w-16 h-16 rounded-full bg-white border-3 border-primary flex items-center justify-center shadow-md">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          {/* Illustration Text */}
          <div className="text-center mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-balance">
              Make your work easier and organized
            </h2>
            <p className="text-gray-700 font-semibold">
              with <span className="text-primary">Tuga's App</span>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
