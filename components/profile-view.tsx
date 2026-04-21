'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Mail, User, Phone, MapPin, Edit2, Check, X, Camera, Upload } from 'lucide-react';

export type ProfileViewVariant = 'standalone' | 'embedded';

interface ProfileViewProps {
  variant?: ProfileViewVariant;
}

export function ProfileView({ variant = 'standalone' }: ProfileViewProps) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [imageDraft, setImageDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((prev) => {
      const next = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: prev.phone || '+1 (555) 123-4567',
        address: prev.address || 'London, United Kingdom',
        imageUrl: user.imageUrl || '',
      };

      if (
        prev.firstName === next.firstName &&
        prev.lastName === next.lastName &&
        prev.email === next.email &&
        prev.phone === next.phone &&
        prev.address === next.address &&
        prev.imageUrl === next.imageUrl
      ) {
        return prev;
      }

      return next;
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

  const openImagePopup = () => {
    setImageDraft(formData.imageUrl || user?.imageUrl || '');
    setIsImagePopupOpen(true);
  };

  const saveImage = () => {
    const nextImageUrl = imageDraft.trim();
    setFormData((prev) => ({ ...prev, imageUrl: nextImageUrl }));
    updateProfile({
      imageUrl: nextImageUrl,
    });
    setIsImagePopupOpen(false);
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
        setImageDraft(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const outerClass =
    variant === 'standalone'
      ? 'min-h-screen bg-white py-12'
      : 'pb-2';

  const innerClass =
    variant === 'standalone'
      ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
      : 'max-w-4xl mx-auto';

  return (
    <>
      <div className={outerClass}>
        <div className={innerClass}>
          <div className="bg-white border-t-4 border-primary rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="h-2 bg-primary" />

            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6 pb-8 border-b border-primary">
                <button
                  onClick={openImagePopup}
                  className="relative cursor-pointer rounded-full transition hover:scale-105"
                  title="Change profile image"
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
                  <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                    <Camera className="h-4 w-4" />
                  </span>
                </button>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                </div>

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
              </div>

              <div className="mt-8">
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
              </div>
            </div>
          </div>

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

      {isImagePopupOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            aria-label="Close image popup"
            className="absolute inset-0 cursor-pointer bg-black/30"
            type="button"
            onClick={() => setIsImagePopupOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Change Profile Image</h3>
              <button
                onClick={() => setIsImagePopupOpen(false)}
                className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex justify-center">
              {imageDraft.trim() ? (
                <img
                  src={imageDraft.trim()}
                  alt={user?.firstName || user?.username || 'Profile'}
                  className="h-24 w-24 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            <input
              type="text"
              value={imageDraft}
              onChange={(e) => setImageDraft(e.target.value)}
              placeholder="Paste image URL"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadFromComputer}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Upload from computer
            </button>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsImagePopupOpen(false)}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={saveImage}
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
