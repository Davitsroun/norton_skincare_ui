'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { loginSchema } from '@/lib/validations/auth';

type SocialProvider = 'google' | 'github';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [isClient, setIsClient] = useState(false);
  const loginInFlightRef = useRef(false);
  const router = useRouter();
  const { login, loginWithIdentityProvider, isAuthenticated, isAdmin } = useAuth();

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginInFlightRef.current) {
      return;
    }

    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    loginInFlightRef.current = true;
    setIsLoading(true);
    setErrors({});
    try {
      const result = await login(username, password);
      if (!result.success) {
        setErrors({ username: 'Invalid Keycloak username or password.' });
        loginInFlightRef.current = false;
        setIsLoading(false);
        return;
      }
      router.replace(result.isAdmin ? '/admin' : '/home');
    } catch {
      setErrors({ username: 'Unable to log in with Keycloak. Please try again.' });
      loginInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    if (loginInFlightRef.current) {
      return;
    }

    loginInFlightRef.current = true;
    setSocialLoading(provider);
    setErrors({});

    try {
      await loginWithIdentityProvider(provider);
    } catch {
      setErrors({
        username: `Unable to log in with ${provider === 'google' ? 'Google' : 'GitHub'}. Please try again.`,
      });
      loginInFlightRef.current = false;
      setSocialLoading(null);
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
            {/* Username Input */}
            <div>
              <Input
                type="text"
                placeholder="Username or email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: undefined });
                }}
                className={`rounded-full border-2 pl-5 py-3 text-base transition-colors placeholder:text-gray-400 ${
                  errors.username
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-primary'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-2">{errors.username}</p>
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
              disabled={isLoading || Boolean(socialLoading)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition-colors h-auto disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(socialLoading) || isLoading}
              onClick={() => handleSocialLogin('google')}
              className="h-auto rounded-full border-2 border-gray-200 bg-white py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <GoogleIcon className="h-5 w-5" />
              {socialLoading === 'google' ? 'Opening...' : 'Google'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(socialLoading) || isLoading}
              onClick={() => handleSocialLogin('github')}
              className="h-auto rounded-full border-2 border-gray-200 bg-white py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <GithubIcon className="h-5 w-5" />
              {socialLoading === 'github' ? 'Opening...' : 'GitHub'}
            </Button>
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.52z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.89A6.01 6.01 0 0 1 6.1 12c0-.66.11-1.3.31-1.89V7.52H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.48l3.35-2.59z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.82 1.49l2.87-2.87C16.96 3 14.69 2 12 2a10 10 0 0 0-8.94 5.52l3.35 2.59C7.2 7.75 9.4 5.99 12 5.99z"
      />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.59 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 7c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.12 10.12 0 0 0 22 12.26C22 6.59 17.52 2 12 2z" />
    </svg>
  );
}
