'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Github, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { registerSchema } from '@/lib/validations/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
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
        username: fieldErrors.username?.[0] ?? '',
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
      const success = await register({
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        imageUrl: formData.imageUrl,
      });
      if (success) {
        router.push('/home');
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
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
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
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

          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 py-10">
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
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2">
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

            {/* Username */}
            <div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 ${
                  errors.username
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-primary'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
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
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-primary'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture (Optional)</label>
              {profileImagePreview ? (
                <div className="relative mb-4">
                  <img
                    src={profileImagePreview}
                    alt="Profile Preview"
                    className="w-full h-40 object-cover rounded-lg border-2 border-primary"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Click to upload photo</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              {errors.image && (
                <p className="text-red-500 text-xs mt-2">{errors.image}</p>
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
