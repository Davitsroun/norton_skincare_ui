'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Github, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { registerSchema } from '@/lib/validations/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    imageUrl: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'File size must be less than 5MB',
        }));
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({
        ...prev,
        image: '',
      }));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] ?? '',
        firstName: fieldErrors.firstName?.[0] ?? '',
        lastName: fieldErrors.lastName?.[0] ?? '',
        password: fieldErrors.password?.[0] ?? '',
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? '',
        imageUrl: fieldErrors.imageUrl?.[0] ?? '',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        imageUrl: formData.imageUrl,
      });
      if (result.success) {
        router.push('/login');
      } else if (result.status === 409) {
        setErrors({
          submit: result.error ?? 'An account with this email already exists.',
        });
      } else {
        setErrors({ submit: result.error ?? 'Registration failed. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 md:py-16"
      style={{ backgroundImage: "url('/back_ground.gif')" }}
    >
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white/92 shadow-2xl">
        {/* Left Side — animated background + illustration SVG */}
        <div className="relative hidden min-h-[420px] overflow-hidden md:flex md:w-1/2">
          {/* Base wash */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#c5eef0] via-teal-100/90 to-cyan-50"
            aria-hidden
          />
          {/* Soft grid */}
          <div
            className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(201, 207, 207, 0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(159, 187, 185, 0.35)_1px,transparent_1px)] [background-size:32px_32px]"
            aria-hidden
          />
          {/* Animated blobs */}
          <div
            className="register-blob-shift absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
            aria-hidden
          />
          <div
            className="register-blob-shift-reverse absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-cyan-300/50 blur-3xl"
            aria-hidden
          />
          <div
            className="register-blob-shift absolute left-1/3 top-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-white/40 blur-2xl"
            aria-hidden
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-center gap-6 px-5 py-1">
            <div className="w-full max-w-lg rounded-2xl border border-white/70 bg-white/35 p-5 shadow-[0_12px_40px_-12px_rgba(15,118,110,0.25)] backdrop-blur-[2px]">
              <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                Nature Leaf
              </span>
              <h2 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-[1.6rem]">
                Your{' '}
                <span className="bg-gradient-to-r from-primary via-teal-600 to-cyan-500 bg-clip-text text-transparent">
                  glow
                </span>{' '}
                starts here
              </h2>
              <p className="mt-2 text-sm text-gray-600/95">
                Favorites, orders & checkout—one quick sign-up.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  Free
                </span>
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
                  Secure
                </span>
              </div>
            </div>
            <div className="register-illustration-float relative w-full max-w-lg">
              <Image
                src="/register_pic.svg"
                alt="Illustration for creating your account"
                width={960}
                height={700}
                className="h-auto w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 sm:py-16 md:w-1/2">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm">Join us today and start your journey</p>
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              className="flex flex-1 items-center text-bold justify-center gap-2 rounded-lg bg-[#181717] py-2.5 font-medium text-white transition-colors hover:bg-black"
            >
              <Github className="w-4 h-4" />
              Github
            </button>
            <button
              type="button"
              className="flex flex-1 text-bold items-center justify-center gap-2 rounded-lg bg-white py-2.5 font-medium text-[#5f6368] ring-1 ring-gray-300 transition-colors hover:bg-primary hover:text-white"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
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
              Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600 font-medium">or</span>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`rounded-lg border-2 px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 ${
                    errors.firstName
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`rounded-lg border-2 px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 ${
                    errors.lastName
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-primary'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 pr-12 text-sm transition-colors placeholder:text-gray-400 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 pr-12 text-sm transition-colors placeholder:text-gray-400 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Profile photo — compact avatar row */}
            <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-slate-50/90 to-white px-2.5 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <label
                    htmlFor="register-profile-photo"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-cyan-500/10 ring-2 ring-white shadow-sm transition hover:ring-primary/40"
                  >
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-4 w-4 text-primary/70" strokeWidth={1.75} />
                    )}
                  </label>
                  <input
                    id="register-profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                  {profileImagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900/85 text-white shadow hover:bg-gray-900"
                      aria-label="Remove photo"
                    >
                      <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800">Profile photo</p>
                  <p className="text-[11px] leading-snug text-gray-500">
                    Optional · JPG or PNG · max 5MB
                  </p>
                  <label
                    htmlFor="register-profile-photo"
                    className="mt-0.5 inline-block cursor-pointer text-[11px] font-semibold text-primary hover:underline"
                  >
                    {profileImagePreview ? 'Change' : 'Choose file'}
                  </label>
                </div>
              </div>
              {errors.image && (
                <p className="text-red-500 text-xs mt-1.5 pl-[2.75rem]">{errors.image}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg transition-colors h-auto disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/" className="text-primary hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
