'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff } from 'lucide-react';
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
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
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
                className="text-red-400  hover:text-red-600 text-sm font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition-colors h-auto disabled:opacity-50"
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
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#181717] text-white transition-colors hover:bg-black"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
                <path d="M12 .296c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.384-1.332-1.754-1.332-1.754-1.09-.745.082-.729.082-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.833 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.333-5.467-5.93 0-1.31.47-2.38 1.236-3.22-.124-.304-.536-1.526.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 0 1 3.003-.404c1.018.005 2.042.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.65.243 2.872.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.624-5.48 5.92.43.37.813 1.096.813 2.21 0 1.594-.015 2.878-.015 3.27 0 .321.216.694.825.576C20.565 22.09 24 17.592 24 12.296c0-6.627-5.373-12-12-12" />
              </svg>
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#5f6368] ring-1 ring-gray-300 transition-colors hover:bg-gray-50"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.1-6.71-4.92h-4v3.09A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.33A7.2 7.2 0 0 1 4.91 12c0-.81.14-1.6.38-2.33V6.58h-4A12 12 0 0 0 0 12c0 1.94.47 3.77 1.29 5.42l4-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.16 15.24 0 12 0A12 12 0 0 0 1.29 6.58l4 3.09c.94-2.82 3.59-4.9 6.71-4.9z"
                />
              </svg>
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
      <div className="hidden w-1/2 items-center justify-center bg-primary/50 p-12 backdrop-blur-[1px] lg:flex">
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
