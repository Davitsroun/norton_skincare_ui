'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  forgotPasswordEmailSchema,
  otpSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordEmailSchema.safeParse({ email });
    if (!result.success) {
      setErrors({
        email: result.error.flatten().fieldErrors.email?.[0] ?? 'Invalid email format',
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setErrors({});
      setStep('otp');
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      setErrors({
        otp: result.error.flatten().fieldErrors.otp?.[0] ?? 'OTP must be 6 digits',
      });
      return;
    }

    setErrors({});
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        password: fieldErrors.password?.[0] ?? '',
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? '',
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-10 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
                Forgot Password?
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full rounded-xl border pl-12 py-3 text-base transition-all placeholder:text-gray-400 bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>✕</span> {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
                Verify Your Email
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Enter the 6-digit code we sent to <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setOtp(value);
                    if (errors.otp) setErrors({ ...errors, otp: '' });
                  }}
                  className={`w-full rounded-xl border px-4 py-4 text-base text-center text-3xl tracking-widest font-mono transition-all bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white placeholder:text-gray-400 ${
                    errors.otp
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-primary'
                  }`}
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>✕</span> {errors.otp}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto mt-4"
              >
                Verify Code
              </Button>

              <p className="text-center text-gray-600 text-sm">
                Didn't receive code?{' '}
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Resend
                </button>
              </p>
            </form>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
                Create New Password
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Choose a strong password to protect your account.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full rounded-xl border px-4 pr-12 py-3 text-base transition-all placeholder:text-gray-400 bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>✕</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={`w-full rounded-xl border px-4 pr-12 py-3 text-base transition-all placeholder:text-gray-400 bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white ${
                      errors.confirmPassword
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>✕</span> {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto disabled:opacity-50 mt-6"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
