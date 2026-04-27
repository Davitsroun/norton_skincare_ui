'use client';

import { useState, type ComponentProps } from 'react';
import { ArrowLeft, KeyRound, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  confirmPasswordResetAction,
  requestPasswordResetAction,
  verifyPasswordResetOtpAction,
} from '@/actions/auth-actions';
import {
  forgotPasswordEmailSchema,
  otpSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

type Step = 'email' | 'otp' | 'password' | 'success';
type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault();
    const result = forgotPasswordEmailSchema.safeParse({ email });
    if (!result.success) {
      setErrors({
        email: result.error.flatten().fieldErrors.email?.[0] ?? 'Invalid email format',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordResetAction({ email });
      if (!result.success) {
        setErrors({
          email: result.error ?? 'Unable to send reset email. Please try again.',
        });
        return;
      }

      setErrors({});
      setStep('otp');
    } catch {
      setErrors({ email: 'Unable to send OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault();
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      setErrors({
        otp: result.error.flatten().fieldErrors.otp?.[0] ?? 'Invalid OTP',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyPasswordResetOtpAction({ email, otp });
      if (!result.success || !result.resetToken) {
        setErrors({
          otp: result.error ?? 'Invalid or expired OTP',
        });
        return;
      }

      setResetToken(result.resetToken);
      setErrors({});
      setStep('password');
    } catch {
      setErrors({ otp: 'Unable to verify OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit: FormSubmitHandler = async (e) => {
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
    try {
      const result = await confirmPasswordResetAction({
        email,
        resetToken,
        password,
      });
      if (!result.success) {
        setErrors({
          password: result.error ?? 'Unable to reset password',
        });
        return;
      }

      setErrors({});
      setStep('success');
      window.setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setErrors({ password: 'Unable to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-10 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {step === 'email' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
                Forgot Password?
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Enter your email address and we will send a one-time password.
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
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
                Enter OTP
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (errors.otp) setErrors({ ...errors, otp: '' });
                    }}
                    className={`w-full rounded-xl border pl-12 py-3 text-base transition-all placeholder:text-gray-400 bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white ${
                      errors.otp
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>✕</span> {errors.otp}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
                Create New Password
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Choose a new password for your account.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full rounded-xl border pl-12 py-3 text-base transition-all placeholder:text-gray-400 bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>✕</span> {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={`w-full rounded-xl border pl-12 py-3 text-base transition-all placeholder:text-gray-400 bg-white/60 focus:ring-2 focus:ring-primary/30 focus:bg-white ${
                      errors.confirmPassword
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                  />
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
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="space-y-5 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-gray-700">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>
                Your password has been reset successfully. Redirecting you to login...
              </p>
            </div>

            <Button
              type="button"
              asChild
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl h-auto"
            >
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
