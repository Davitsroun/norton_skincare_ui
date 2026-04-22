'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { useState } from 'react';
import { Save, Bell, Lock, Palette, Globe, LogOut } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'Nature Leaf',
    storeEmail: 'admin@natureleaf.com',
    storPhone: '+1 (555) 123-4567',
    storeAddress: 'London, United Kingdom',
    currency: 'USD',
    timezone: 'UTC-5',
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="w-5 h-5" /> },
    // { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    // { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
  ];

  return (
    <AdminPageShell title="Settings" description="Manage admin preferences and configurations">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 bg-white rounded-t-2xl px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-2xl mx-auto ">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Store Information</h2>

            <div className="space-y-6">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Store Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Store Email</label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={settings.storPhone}
                  onChange={(e) => setSettings({ ...settings, storPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Currency & Timezone */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option>UTC-5</option>
                    <option>UTC+0</option>
                    <option>UTC+5:30</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all shadow-md mt-8">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {/* {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              {[
                { label: 'New Orders', description: 'Get notified when new orders are placed' },
                { label: 'Low Stock Alerts', description: 'Receive alerts when stock is running low' },
                { label: 'Customer Reviews', description: 'Get notified of new customer reviews' },
                { label: 'Weekly Reports', description: 'Receive weekly sales and analytics reports' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Appearance Settings */}
        {/* {activeTab === 'appearance' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Theme</label>
                <div className="flex gap-4">
                  {['Light', 'Dark'].map((theme) => (
                    <button
                      key={theme}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                        theme === 'Light'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Primary Color</label>
                <div className="flex gap-4">
                  {['Blue', 'Green', 'Purple'].map((color) => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-xl border-2 transition-all ${
                        color === 'Blue'
                          ? 'border-gray-900 bg-blue-500'
                          : color === 'Green'
                          ? 'border-gray-300 bg-green-500'
                          : 'border-gray-300 bg-purple-500'
                      }`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm max-w-2xl  mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>

            <div className="space-y-4">
              <button className="w-full px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all">
                Change Password
              </button>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Active Sessions</h3>
                <div className="space-y-2">
                  {[
                    { device: 'Chrome on Windows', location: 'London, UK', lastActive: 'Now' },
                    { device: 'Safari on iPhone', location: 'London, UK', lastActive: '2 hours ago' },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{session.device}</p>
                        <p className="text-xs text-gray-600">{session.location} â€¢ {session.lastActive}</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm font-semibold">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-6 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout from All Devices
              </button>
            </div>
          </div>
        )}
      </AdminPageShell>
  );
}

