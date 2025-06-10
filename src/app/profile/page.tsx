'use client'

import Navigation from '@/components/Navigation'
import { UserCircleIcon } from '@heroicons/react/24/solid'

const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
}

const mockActivity = [
  { id: 1, action: 'Logged in', date: '2024-06-07 09:15' },
  { id: 2, action: 'Started new KYC application', date: '2024-06-06 16:42' },
  { id: 3, action: 'Changed theme to Dark Blue', date: '2024-06-06 16:40' },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'hsl(var(--foreground))' }}>Profile</h1>

          {/* User Info */}
          <div className="mb-8 flex items-center gap-6 rounded-lg shadow p-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-20 w-20 text-blue-400" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <div className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{mockUser.name}</div>
              <div className="text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.8 }}>{mockUser.email}</div>
            </div>
          </div>

          {/* Change Password (Mock) */}
          <div className="mb-8 rounded-lg shadow p-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Change Password</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="current-password" style={{ color: 'hsl(var(--foreground))' }}>Current Password</label>
              <input
                id="current-password"
                type="password"
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}
                value="********"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="new-password" style={{ color: 'hsl(var(--foreground))' }}>New Password</label>
              <input
                id="new-password"
                type="password"
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}
                value=""
                placeholder="••••••••"
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

          {/* Recent Activity */}
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Recent Activity</h2>
            <ul className="divide-y divide-gray-200">
              {mockActivity.map((item) => (
                <li key={item.id} className="py-2 flex justify-between items-center">
                  <span style={{ color: 'hsl(var(--foreground))' }}>{item.action}</span>
                  <span className="text-xs" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>{item.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
} 