'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { useParams } from 'next/navigation'
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, DocumentCheckIcon, FaceSmileIcon, IdentificationIcon, PlayIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
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

type StatusType = 'completed' | 'inProgress' | 'error' | 'pending'

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

export default function CustomerStatusPage() {
  const params = useParams()
  const customerId = Array.isArray(params.customerId) ? params.customerId[0] : params.customerId
  const customer = mockCustomers[customerId as keyof typeof mockCustomers] || { name: 'Unknown', email: '', status: 'Pending' }
  const verificationSteps = mockVerificationStepsByCustomer[customerId] || []

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-200 flex items-center justify-center w-12 h-12 text-xl font-bold" style={{ color: 'hsl(var(--primary))' }}>{customer.name[0]}</div>
                <div>
                  <div className="font-semibold text-lg" style={{ color: 'hsl(var(--foreground))' }}>{customer.name}</div>
                  <div className="text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>{customer.email}</div>
                  <div className="text-xs" style={{ color: 'hsl(var(--foreground))', opacity: 0.5 }}>Customer ID: {customerId}</div>
                </div>
              </div>
            </div>
            <Link
              href={customerIdToKycId[customerId] ? `/kyc/${customerIdToKycId[customerId]}` : '#'}
              className="rounded bg-yellow-600 px-3 py-3 text-white hover:bg-yellow-700 flex items-center justify-center"
              title="View KYC Details"
            >
              <IdentificationIcon className="h-6 w-6" />
            </Link>
            {/* Reprocess Button */}
            {customerIdToKycId[customerId] && (
              <Link
                href={customer.status === 'Verified' ? '#' : `/kyc/${customerIdToKycId[customerId]}/edit`}
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
                KYC Verification Status
              </h3>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>
                Application #{customerId}
              </p>
            </div>
            <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <dl>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
                  <dt className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>Full name</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'hsl(var(--foreground))' }}>{customer.name}</dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))' }}>
                  <dt className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>Email</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'hsl(var(--foreground))' }}>{customer.email}</dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
                  <dt className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>Current status</dt>
                  <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ ...statusChipStyles[(customer.status || 'pending').toLowerCase() as StatusType], minWidth: 80, textAlign: 'center' }}>
                      {customer.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="mt-8">
            <h3 className="text-lg font-medium leading-6" style={{ color: 'hsl(var(--foreground))' }}>Verification Steps</h3>
            <div className="mt-4 flow-root">
              <ul role="list" className="-mb-8">
                {verificationSteps.map((step, stepIdx) => (
                  <li key={step.id}>
                    <div className="relative pb-8">
                      {stepIdx !== verificationSteps.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5"
                          style={{ backgroundColor: 'hsl(var(--border))' }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3 items-center">
                        <div>
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white"
                            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', border: '1px solid hsl(var(--border))' }}
                          >
                            <step.icon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <span
                              className="text-sm font-medium"
                              style={{
                                ...statusChipStyles[(step.status || 'pending').toLowerCase() as StatusType],
                                borderRadius: '8px',
                                padding: '4px 12px',
                                display: 'inline-block',
                              }}
                            >
                              {step.name}
                            </span>
                            <span className="font-medium text-gray-900" style={{ color: 'hsl(var(--foreground))', fontWeight: 400, marginLeft: 8 }}>{step.description}</span>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>
                            <time dateTime={step.date}>{step.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
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