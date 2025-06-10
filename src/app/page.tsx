'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { 
  DocumentCheckIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FaceSmileIcon,
  IdentificationIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import CustomerTable, { Customer } from '@/components/CustomerTable'

const stats = [
  { name: 'Total KYC Applications', value: '2,543', icon: UserGroupIcon },
  { name: 'Pending Verification', value: '45', icon: ClockIcon },
  { name: 'Documents Processed', value: '12,432', icon: DocumentCheckIcon },
  { name: 'Success Rate', value: '98.5%', icon: ShieldCheckIcon },
]

const recentActivity = [
  {
    id: 1,
    name: 'John Doe',
    status: 'Document Verification',
    date: '2 minutes ago',
    type: 'ID Card',
  },
  {
    id: 2,
    name: 'Jane Smith',
    status: 'Face Verification',
    date: '5 minutes ago',
    type: 'Selfie',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    status: 'Completed',
    date: '10 minutes ago',
    type: 'Full KYC',
  },
]

const nameToCustomerId: Record<string, string> = {
  'John Doe': '123',
  'Jane Smith': '456',
  'Robert Johnson': '789',
}
const nameToEmail: Record<string, string> = {
  'John Doe': 'john@example.com',
  'Jane Smith': 'jane@example.com',
  'Robert Johnson': 'robert@example.com',
}
const nameToStatus: Record<string, string> = {
  'John Doe': 'Verified',
  'Jane Smith': 'Pending',
  'Robert Johnson': 'Completed',
}

const mockVerificationStepsByCustomer: Record<string, any[]> = {
  '123': [
    { id: 1, name: 'Document Upload', status: 'completed', date: '2024-06-01 10:30 AM', description: 'ID Card and Proof of Address uploaded successfully', icon: DocumentCheckIcon },
    { id: 2, name: 'Document Verification', status: 'completed', date: '2024-06-01 10:35 AM', description: 'Documents verified using AWS Textract', icon: DocumentCheckIcon },
    { id: 3, name: 'Face Verification', status: 'completed', date: '2024-06-01 10:40 AM', description: 'Face verified using AWS Rekognition', icon: FaceSmileIcon },
    { id: 4, name: 'Final Review', status: 'completed', date: '2024-06-01 10:45 AM', description: 'KYC completed successfully', icon: CheckCircleIcon },
  ],
  '456': [
    { id: 1, name: 'Document Upload', status: 'completed', date: '2024-06-02 09:00 AM', description: 'ID Card uploaded', icon: DocumentCheckIcon },
    { id: 2, name: 'Document Verification', status: 'inProgress', date: '2024-06-02 09:10 AM', description: 'Verification in progress', icon: ClockIcon },
    { id: 3, name: 'Face Verification', status: 'pending', date: '', description: 'Waiting for face verification', icon: FaceSmileIcon },
    { id: 4, name: 'Final Review', status: 'pending', date: '', description: 'Waiting for review', icon: ClockIcon },
  ],
  '789': [
    { id: 1, name: 'Document Upload', status: 'completed', date: '2024-06-03 11:00 AM', description: 'ID Card uploaded', icon: DocumentCheckIcon },
    { id: 2, name: 'Document Verification', status: 'error', date: '2024-06-03 11:10 AM', description: 'Document verification failed', icon: ExclamationCircleIcon },
    { id: 3, name: 'Face Verification', status: 'pending', date: '', description: 'Waiting for face verification', icon: FaceSmileIcon },
    { id: 4, name: 'Final Review', status: 'pending', date: '', description: 'Waiting for review', icon: ClockIcon },
  ],
}

const mockStatuses: Record<string, string> = {
  '123': 'Verified',
  '456': 'Pending',
  '789': 'Error',
}

const statusChipStyles = {
  completed: {
    background: 'hsl(var(--status-completed-bg))',
    color: 'hsl(var(--status-completed-text))',
    border: '1px solid hsl(var(--status-completed-text))',
  },
  inProgress: {
    background: 'hsl(var(--status-inprogress-bg))',
    color: 'hsl(var(--status-inprogress-text))',
    border: '1px solid hsl(var(--status-inprogress-text))',
  },
  error: {
    background: 'hsl(var(--status-error-bg))',
    color: 'hsl(var(--status-error-text))',
    border: '1px solid hsl(var(--status-error-text))',
  },
  pending: {
    background: 'hsl(var(--accent))',
    color: 'hsl(var(--accent-foreground))',
    border: '1px solid hsl(var(--border))',
  },
}

const customerIdToKycId: Record<string, string> = {
  '123': '1',
  '456': '2',
  '789': '3',
}

export default function Dashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight" style={{ color: 'hsl(var(--foreground))' }}>
            Dashboard
          </h1>
          
          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="relative overflow-hidden rounded-lg px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
                style={{ backgroundColor: 'hsl(var(--card, var(--background)))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}
              >
                <dt>
                  <div className="absolute rounded-md p-3" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{item.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{item.value}</p>
                </dd>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-base font-semibold leading-6" style={{ color: 'hsl(var(--foreground))' }}>
                  Recent Activity
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>
                  A list of recent KYC verifications and their current status.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <CustomerTable
                customers={recentActivity.map(a => ({ id: nameToCustomerId[a.name], name: a.name, email: nameToEmail[a.name] }))}
                statuses={Object.fromEntries(recentActivity.map(a => [nameToCustomerId[a.name], mockStatuses[nameToCustomerId[a.name]]]))}
                extraActions={(customer) => {
                  const kycId = customerIdToKycId[customer.id];
                  const status = mockStatuses[customer.id];
                  const isDisabled = status === 'Verified';
                  return (
                    <Link
                      href={isDisabled ? '#' : `/kyc/${kycId}/edit`}
                      className={`rounded bg-blue-600 px-3 py-1 text-white flex items-center justify-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-700'}`}
                      title="Resume"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-disabled={isDisabled}
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span className="hidden sm:inline">Resume</span>
                    </Link>
                  );
                }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-base font-semibold leading-6" style={{ color: 'hsl(var(--foreground))' }}>Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed p-12 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card, var(--background)))',
                  color: 'hsl(var(--foreground))',
                }}
              >
                <DocumentCheckIcon className="mx-auto h-12 w-12" style={{ color: 'hsl(var(--primary))' }} />
                <span className="mt-2 block text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Start New KYC</span>
              </button>
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed p-12 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card, var(--background)))',
                  color: 'hsl(var(--foreground))',
                }}
              >
                <ShieldCheckIcon className="mx-auto h-12 w-12" style={{ color: 'hsl(var(--primary))' }} />
                <span className="mt-2 block text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Verify Documents</span>
              </button>
              <button
                type="button"
                className="relative block w-full rounded-lg border-2 border-dashed p-12 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card, var(--background)))',
                  color: 'hsl(var(--foreground))',
                }}
              >
                <UserGroupIcon className="mx-auto h-12 w-12" style={{ color: 'hsl(var(--primary))' }} />
                <span className="mt-2 block text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>View All Applications</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 