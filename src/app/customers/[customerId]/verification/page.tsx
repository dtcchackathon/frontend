'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { useParams } from 'next/navigation'
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, DocumentCheckIcon, FaceSmileIcon, IdentificationIcon, PlayIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const mockCustomers = {
  '123': { name: 'John Doe', email: 'john@example.com', status: 'Verified' },
  '456': { name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
  '789': { name: 'Robert Johnson', email: 'robert@example.com', status: 'Error' },
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

const customerIdToKycId: Record<string, string> = {
  '123': '1',
  '456': '2',
  '789': '3',
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

export default function CustomerVerificationPage() {
  const params = useParams()
  const customerId = Array.isArray(params.customerId) ? params.customerId[0] : params.customerId
  const customer = mockCustomers[customerId as keyof typeof mockCustomers] || { name: 'Unknown', email: '', status: 'Pending' }
  const verificationSteps = mockVerificationStepsByCustomer[customerId] || []
  const kycId = customerIdToKycId[customerId]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <h1 className="text-2xl font-bold mb-0" style={{ color: 'hsl(var(--foreground))' }}>KYC Verification</h1>
            {/* Resume Button */}
            {kycId && (
              <Link
                href={customer.status === 'Verified' ? '#' : `/kyc/${kycId}/edit`}
                className={`rounded bg-blue-600 px-3 py-3 text-white flex items-center justify-center gap-2 ${customer.status === 'Verified' ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-700'}`}
                title="Resume"
                tabIndex={customer.status === 'Verified' ? -1 : 0}
                aria-disabled={customer.status === 'Verified'}
              >
                <PlayIcon className="h-6 w-6" />
                <span className="hidden sm:inline">Resume</span>
              </Link>
            )}
          </div>
          <div className="overflow-hidden shadow sm:rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}>
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6" style={{ color: 'hsl(var(--foreground))' }}>
                Verification Steps
              </h3>
            </div>
            <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <ul role="list" className="divide-y divide-gray-200">
                {verificationSteps.map((step, stepIdx) => (
                  <li key={step.id} className="flex items-center gap-4 px-4 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', border: '1px solid hsl(var(--border))' }}>
                      <step.icon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium" style={{ ...statusChipStyles[step.status as keyof typeof statusChipStyles], borderRadius: '8px', padding: '4px 12px', display: 'inline-block' }}>{step.name}</span>
                    <span className="text-xs" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>{step.description}</span>
                    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold" style={{ ...statusChipStyles[step.status as keyof typeof statusChipStyles], minWidth: 60, textAlign: 'center' }}>{step.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 