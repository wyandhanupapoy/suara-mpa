'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageCircle, Save } from 'lucide-react';

export default function NotificationPreferences({ user }) {
  const [preferences, setPreferences] = useState({
    email: {
      enabled: true,
      weeklyDigest: true,
      statusUpdates: true,
      newComments: false,
      frequency: 'weekly' // daily, weekly, monthly
    },
    push: {
      enabled: false,
      statusUpdates: true,
      newComments: true,
      assignment: true
    },
    whatsapp: {
      enabled: true,
      statusUpdates: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`notifications_${user?.uid}`);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, [user]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Save to localStorage (can be migrated to Firestore)
    localStorage.setItem(`notifications_${user?.uid}`, JSON.stringify(preferences));
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Preferences saved!');
    }, 500);
  };

  const updatePreference = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          Notification Preferences
        </h3>
        <p className="text-slate-500">
          Customize how you receive updates and notifications
        </p>
      </div>

      {/* Email Notifications */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-black text-slate-900">Email Notifications</h4>
            <p className="text-xs text-slate-500">Receive updates via email</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div>
              <div className="font-bold text-sm text-slate-900">Enable Email Notifications</div>
              <div className="text-xs text-slate-500">Master switch for all email notifications</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.email.enabled}
              onChange={(e) => updatePreference('email', 'enabled', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {preferences.email.enabled && (
            <>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-sm text-slate-900">Weekly Digest</div>
                  <div className="text-xs text-slate-500">Summary of activity and statistics</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email.weeklyDigest}
                  onChange={(e) => updatePreference('email', 'weeklyDigest', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-sm text-slate-900">Status Updates</div>
                  <div className="text-xs text-slate-500">When aspiration status changes</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email.statusUpdates}
                  onChange={(e) => updatePreference('email', 'statusUpdates', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-sm text-slate-900">New Comments</div>
                  <div className="text-xs text-slate-500">When someone comments on your aspiration</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email.newComments}
                  onChange={(e) => updatePreference('email', 'newComments', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div className="p-3 bg-slate-50 rounded-lg">
                <label className="block font-bold text-sm text-slate-900 mb-2">
                  Digest Frequency
                </label>
                <select
                  value={preferences.email.frequency}
                  onChange={(e) => updatePreference('email', 'frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-black text-slate-900">Push Notifications</h4>
            <p className="text-xs text-slate-500">Real-time notifications on Android</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div>
              <div className="font-bold text-sm text-slate-900">Enable Push Notifications</div>
              <div className="text-xs text-slate-500">Receive instant notifications (Android only)</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.push.enabled}
              onChange={(e) => updatePreference('push', 'enabled', e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          {preferences.push.enabled && (
            <>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-sm text-slate-900">Status Updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.push.statusUpdates}
                  onChange={(e) => updatePreference('push', 'statusUpdates', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-sm text-slate-900">New Comments</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.push.newComments}
                  onChange={(e) => updatePreference('push', 'newComments', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-sm text-slate-900">Assignment Notifications</div>
                  <div className="text-xs text-slate-500">(Staff only)</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.push.assignment}
                  onChange={(e) => updatePreference('push', 'assignment', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* WhatsApp */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-black text-slate-900">WhatsApp Notifications</h4>
            <p className="text-xs text-slate-500">Share updates via WhatsApp</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <div>
              <div className="font-bold text-sm text-slate-900">Enable WhatsApp Share</div>
              <div className="text-xs text-slate-500">Show WhatsApp share buttons</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.whatsapp.enabled}
              onChange={(e) => updatePreference('whatsapp', 'enabled', e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                 text-white font-bold rounded-xl transition-all shadow-lg
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
