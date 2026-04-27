'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  defaultProfileFormData,
  isSameProfileFormData,
  mapUserToProfileFormData,
} from '@/lib/profile-data';
import { PageHeader } from '@/components/page-header';
import {
  Mail,
  User,
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
  Camera,
  KeyRound,
} from 'lucide-react';

export type ProfileViewVariant = 'standalone' | 'embedded';

interface ProfileViewProps {
  variant?: ProfileViewVariant;
}

export function ProfileView({ variant = 'standalone' }: ProfileViewProps) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit-profile' | 'change-password'>('edit-profile');
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [formData, setFormData] = useState(defaultProfileFormData);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((prev) => {
      const next = mapUserToProfileFormData(user, prev);
      return isSameProfileFormData(prev, next) ? prev : next;
    });
  }, [user?.firstName, user?.lastName, user?.email, user?.imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (
      !passwordForm.currentPassword.trim() ||
      !passwordForm.newPassword.trim() ||
      !passwordForm.confirmPassword.trim()
    ) {
      setPasswordError('Please complete all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordSuccess('Password changed successfully.');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const openImagePreview = () => {
    setIsImagePreviewOpen(true);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFromComputer = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
        updateProfile({
          imageUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const outerClass =
    variant === 'standalone'
      ? 'min-h-screen bg-gradient-to-b from-secondary/60 via-background to-primary/5 py-12'
      : 'pb-2';

  const innerClass =
    variant === 'standalone'
      ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
      : 'max-w-4xl mx-auto';

  return (
    <>
      <div className={outerClass}>
        <div className={innerClass}>
          {variant === 'standalone' && (
            <PageHeader
              icon={User}
              eyebrow="Your account"
              titleBefore="My"
              titleGradient="Profile"
              description={
                <>
                  Manage your details and preferences with{' '}
                  <span className="font-medium text-primary">Nature Leaf</span>
                </>
              }
            />
          )}
          <div className="bg-white border-t-4 border-primary rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="h-2 bg-primary" />

            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6 pb-8 border-b border-primary">
                <button
                  onClick={openImagePreview}
                  className="relative cursor-pointer rounded-full transition hover:scale-105"
                  title="View profile image"
                  type="button"
                >
                  {formData.imageUrl || user?.imageUrl ? (
                    <img
                      src={formData.imageUrl || user?.imageUrl}
                      alt={user?.firstName || 'User'}
                      className="w-28 h-28 rounded-full border-4 border-primary object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-primary bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        triggerImageUpload();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          triggerImageUpload();
                        }
                      }}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90"
                      title="Change profile image"
                      aria-label="Change profile image"
                    >
                      <Camera className="h-4 w-4" />
                    </span>
                  </span>
                </button>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                </div>

                {/* {activeTab === 'edit-profile' && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-all hover:bg-primary/90"
                    type="button"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </button>
                )} */}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
                <aside className="md:col-span-4 lg:col-span-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('edit-profile')}
                      className={`mb-2 flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-semibold transition ${
                        activeTab === 'edit-profile'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-white'
                      }`}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('change-password');
                        setIsEditing(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-semibold transition ${
                        activeTab === 'change-password'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-white'
                      }`}
                    >
                      <KeyRound className="h-4 w-4" />
                      Change Password
                    </button>
                  </div>
                </aside>

                <div className="md:col-span-8 lg:col-span-9">
                  {activeTab === 'edit-profile' ? (
                    <>
                      <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary">
                        Personal Information
                      </h3>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div>
                            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                              <span className="text-primary">👤</span>
                              Full Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">{formData.firstName}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                              <Mail className="w-4 h-4 text-primary" />
                              Email
                            </label>
                            {isEditing ? (
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">{formData.email}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                              <Phone className="w-4 h-4 text-primary" />
                              Phone Number
                            </label>
                            {isEditing ? (
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">{formData.phone}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                              <span className="text-primary">⚧</span>
                              Gender
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value="Male"
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">Male</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              Place of Birth
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">{formData.address}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                              <span className="text-primary">📅</span>
                              Date of Birth
                            </label>
                            {isEditing ? (
                              <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">March 7, 2002</p>
                            )}
                          </div>
                        </div>

                        <div className="hidden">
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                          />
                        </div>

                        {isEditing && (
                          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-8">
                            <button
                              onClick={handleSave}
                              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
                              type="button"
                            >
                              <Check className="w-5 h-5" />
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary">
                        Change Password
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        {passwordError && (
                          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                            {passwordError}
                          </p>
                        )}
                        {passwordSuccess && (
                          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                            {passwordSuccess}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleChangePassword}
                          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
                        >
                          <KeyRound className="h-4 w-4" />
                          Update Password
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadFromComputer}
            className="hidden"
          />

          <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Account Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">Jan 2024</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
                <p className="text-2xl font-bold text-primary">12</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium mb-2">Loyalty Points</p>
                <p className="text-2xl font-bold text-primary">1,250</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isImagePreviewOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            aria-label="Close image preview"
            className="absolute inset-0 cursor-pointer bg-black/85"
            type="button"
            onClick={() => setIsImagePreviewOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-black/55 p-2 text-white transition hover:bg-black/75"
              type="button"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-full w-full items-center justify-center">
              {formData.imageUrl || user?.imageUrl ? (
                <img
                  src={formData.imageUrl || user?.imageUrl}
                  alt={user?.firstName || user?.username || 'Profile'}
                  className="max-h-[95vh] w-auto max-w-[96vw] object-contain"
                />
              ) : (
                <div className="flex h-[70vh] w-full max-w-3xl items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                  <User className="h-12 w-12 text-white/80" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
