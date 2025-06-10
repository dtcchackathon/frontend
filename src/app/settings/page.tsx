'use client'
import Navigation from '@/components/Navigation'
import { useState } from 'react'

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'hsl(var(--foreground))' }}>Settings</h1>

          {/* Theme Selection */}
          <div className="mb-8 rounded-lg shadow p-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Theme</h2>
            <p className="mb-2 text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.8 }}>Choose your preferred theme for the application.</p>
            <select
              className="rounded-md border px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}
              defaultValue={typeof window !== 'undefined' ? document.documentElement.className : ''}
              onChange={e => {
                document.documentElement.className = e.target.value
              }}
            >
              <option value="">Theme 1 (Default)</option>
              <option value="theme-2">Theme 2</option>
              <option value="theme-3">Theme 3</option>
              <option value="theme-4">Theme 4 (Dark Blue)</option>
              <option value="theme-5">Theme 5 (Dark Purple)</option>
            </select>
          </div>

          {/* Notification Preferences */}
          <div className="mb-8 rounded-lg shadow p-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Notification Preferences</h2>
            <div className="flex items-center justify-between mb-4">
              <span>Email Notifications</span>
              <button
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${emailNotifications ? 'bg-blue-600' : 'bg-gray-400'}`}
                onClick={() => setEmailNotifications(v => !v)}
                style={{ border: '1px solid hsl(var(--border))' }}
                aria-pressed={emailNotifications}
              >
                <span
                  className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-300 ${emailNotifications ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>SMS Notifications</span>
              <button
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${smsNotifications ? 'bg-blue-600' : 'bg-gray-400'}`}
                onClick={() => setSmsNotifications(v => !v)}
                style={{ border: '1px solid hsl(var(--border))' }}
                aria-pressed={smsNotifications}
              >
                <span
                  className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-300 ${smsNotifications ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Account Settings (Mock) */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Account Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email" style={{ color: 'hsl(var(--foreground))' }}>Email</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}
                value="user@example.com"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="password" style={{ color: 'hsl(var(--foreground))' }}>Password</label>
              <input
                id="password"
                type="password"
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}
                value="********"
                disabled
              />
            </div>
            <button
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              disabled
            >
              Change Password (Coming Soon)
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 